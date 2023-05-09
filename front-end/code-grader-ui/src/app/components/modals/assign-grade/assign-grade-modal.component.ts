import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { switchMap, tap } from 'rxjs';
import { CourseService } from 'src/app/services/course.service';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';
import { S3StorageService } from 'src/app/services/s3-storage.service';
import { USER_STORAGE, UserStorageService } from 'src/app/services/user-storage.service';

@Component({
  selector: 'app-assign-grade-modal',
  templateUrl: './assign-grade-modal.component.html',
  styleUrls: ['./assign-grade-modal.component.scss']
})
export class AssignGradeModalComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef | undefined;

  rowData:any;
  calendarDate:any;
  pastDue: boolean;
  rubricExist: boolean;
  signedUrl: any;
  user:any;
  currentGrade:any;
  comments:any;

  submitGradeButtonLoading = false;
  submitCommentButtonLoading = false;

  submitGradeSuccess = false;
  submitCommentSuccess = false;

  constructor(
    private gridStorageService: GridStorageService,
    private s3Service: S3StorageService,
    private userService: UserStorageService,
    private courseService: CourseService
  ){}

  ngOnInit(): void {
    this.gridStorageService.get$(GRID_STORAGE.selectedRowData).pipe(
      tap((rowData: any) => {
        this.rowData = rowData;
        this.currentGrade = rowData.grade ?? '';
        this.comments = rowData.comments ?? '';
        this.pastDue = moment(rowData.isoSubmissionDate).isAfter(rowData.due_date);
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
    ).subscribe();
  }



  closeModalClick(): void {
    this.submitCommentButtonLoading = false;
    this.submitGradeButtonLoading = false;
    this.submitGradeSuccess = false;
    this.submitCommentSuccess = false;

    this.closeModal!.nativeElement.click();
  }

  submitGrade(): void {
    this.submitGradeButtonLoading = true;

    this.courseService.gradeAssignment(this.currentGrade, this.rowData.submission_id).subscribe(()=>{
      this.submitCommentButtonLoading = false;
      this.submitGradeSuccess = true;
      this.gridStorageService.emit$(GRID_STORAGE.refresh, true);
    })
  }

  submitComments(): void {
    this.submitCommentButtonLoading = true;

    this.courseService.commentAssignment(this.comments, this.rowData.submission_id).subscribe(()=>{
      this.submitCommentButtonLoading = false;
      this.submitCommentSuccess = true;
      this.gridStorageService.emit$(GRID_STORAGE.refresh, true);
    })
  }

  disableSubmitGradeButton(): boolean {
    return this.currentGrade?.length === 0 || parseInt(this.currentGrade) > 100 || isNaN(this.currentGrade) || parseInt(this.currentGrade) < 0
  }

  disableCommentButton(): boolean {
    return this.comments?.length === 0;
  }
}
