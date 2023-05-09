import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { of, switchMap } from 'rxjs';
import { CourseService } from 'src/app/services/course.service';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';
import { S3StorageService } from 'src/app/services/s3-storage.service';

@Component({
  selector: 'app-create-assignment-modal',
  templateUrl: './create-assignment-modal.component.html',
  styleUrls: ['./create-assignment-modal.component.scss']
})
export class CreateAssignmentModalComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef | undefined;
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  @ViewChild('assignmentFileInput') assignmentFileInput: ElementRef | undefined;

  isLoading = false;
  createSuccess = false;
  createAssignmentFileSuccess = false;
  classId: any;
  file: any;
  assignmentFile: any;

  constructor(
    private formBuilder: FormBuilder,
    private courseService: CourseService,
    private activatedRoute: ActivatedRoute,
    private gridStorageService: GridStorageService,
    private s3Service: S3StorageService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.classId = params.classId;
    })
  }

  createAssignmentForm = this.formBuilder.group({
    assignmentName: ['', Validators.required],
    description: [''],
    dueDate: [null, Validators.required]
  })

  closeModalClick(): void {
    this.createSuccess = false;
    this.createAssignmentFileSuccess = false;
    this.assignmentFileInput && (this.assignmentFileInput.nativeElement.value = "");
    this.fileInput && (this.fileInput.nativeElement.value = "");
    this.createAssignmentForm.controls.assignmentName.setValue('');
    this.createAssignmentForm.controls.description.setValue('');
    this.createAssignmentForm.controls.dueDate.setValue(null);
    this.closeModal!.nativeElement.click();
  }

  onSubmit(): void {
    this.isLoading = true;
    const dueDate = moment(this.createAssignmentForm.value.dueDate);
    this.createAssignmentForm.controls.dueDate.setValue(dueDate.endOf('day').toISOString() as any);
    this.courseService.createAssignment(
      this.classId, 
      this.createAssignmentForm.value.assignmentName, 
      this.createAssignmentForm.value.dueDate, 
      this.createAssignmentForm.value.description
      ).pipe(
        switchMap((assignmentId:any)=>{
          this.file && (
            this.s3Service.uploadRubric(this.classId, this.file, `${assignmentId} - ${this.createAssignmentForm.value.assignmentName}`, this.file.name)
          )

          this.assignmentFile && (
            this.s3Service.uploadAssignmentDoc(this.classId, this.assignmentFile, `${assignmentId} - ${this.createAssignmentForm.value.assignmentName}`, this.assignmentFile.name)
          )
          return of(true);
        })
      )
      .subscribe(() => {
      this.isLoading = false;
      this.createSuccess = true;
      this.createAssignmentFileSuccess = true;
      this.gridStorageService.emit$(GRID_STORAGE.refresh, true);
    })
  }

  buttonDisabled(): boolean {
    return this.createAssignmentForm.value.assignmentName === '' || this.createAssignmentForm.value.dueDate === null;
  }

  onFileChange(event: any) {
    this.file = event.target.files[0];
  }

  onAssignmentFileChange(event: any) {
    this.assignmentFile = event.target.files[0];
  }
}
