import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { map, switchMap, tap } from 'rxjs';
import { CourseService } from 'src/app/services/course.service';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';
import { S3StorageService } from 'src/app/services/s3-storage.service';
import { USER_STORAGE, UserStorageService } from 'src/app/services/user-storage.service';

@Component({
  selector: 'app-assignment-detail-modal',
  templateUrl: './assignment-detail-modal.component.html',
  styleUrls: ['./assignment-detail-modal.component.scss']
})
export class AssignmentDetailModalComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef | undefined;
  @ViewChild('fileInput') fileInput: ElementRef | undefined;

  isLoading = false;
  uploadSuccess = false;
  rowData: any;
  pastDue: boolean;
  calendarDate: any;
  files: any[];
  rubricExist: boolean = false;
  signedUrl: any;
  user: any;
  previousUploaded: boolean = false;

  constructor(
    private gridStorageService: GridStorageService,
    private s3Service: S3StorageService,
    private userService: UserStorageService,
    private courseService: CourseService
  ) { }

  ngOnInit(): void {
    this.gridStorageService.get$(GRID_STORAGE.selectedRowData).pipe(
      tap((rowData: any) => {
        this.rowData = rowData;
        this.calendarDate = moment(rowData.isoDueDate).calendar();
        this.pastDue = moment(rowData.isoDueDate).isBefore();
      }),
      switchMap((rowData: any) => {
        return this.s3Service.getRubric(rowData.class_id, `${rowData.assignment_id} - ${rowData.assignment_name}`).pipe(
          tap((x: any) => {
            this.rubricExist = x;
            this.signedUrl = x;
          })
        )
      }),
      switchMap(() => {
        return this.userService.get$(USER_STORAGE.USER).pipe(
          tap((user: any) => {
            this.user = user
          })
        )
      }),
      switchMap((user: any) => {
        return this.s3Service.listFilesForAssignment(this.rowData.class_id, user.userId, `${this.rowData.assignment_id} - ${this.rowData.assignment_name}`)
      })
    )
      .subscribe((res: any) => {
        this.previousUploaded = res.results.length > 0;
      });
  }

  closeModalClick(): void {
    this.files = undefined;
    this.isLoading = false;
    this.uploadSuccess = false;
    this.fileInput && (this.fileInput.nativeElement.value = "");

    this.closeModal!.nativeElement.click();
  }

  onSubmit(): void {
    this.isLoading = true;
    this.s3Service.assignmentSubmission(
      this.files, 
      this.rowData.class_id, 
      `${this.rowData.assignment_id} - ${this.rowData.assignment_name}`, 
      this.user.userId
      )
      .pipe(
        switchMap((res:any)=>{
          return this.courseService.insertSubmission(this.rowData.class_id, this.rowData.assignment_id, this.user.userId, moment().toISOString(), res.map((x:any)=> x.key)).pipe(
            map(()=>res)
          )
        })
      )
      .subscribe(() => {
      this.isLoading = false;
      this.uploadSuccess = true;
    })
  }

  buttonDisabled(): boolean {
    return (this.files?.length > 0 ?? false) || this.isLoading;
  }

  onFileChange(event: any) {
    this.files = event.target.files;
  }

}
