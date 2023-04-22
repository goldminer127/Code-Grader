import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { CourseService } from 'src/app/services/course.service';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';

@Component({
  selector: 'app-create-assignment-modal',
  templateUrl: './create-assignment-modal.component.html',
  styleUrls: ['./create-assignment-modal.component.scss']
})
export class CreateAssignmentModalComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef | undefined;

  isLoading = false;
  createSuccess = false;
  classId: any;

  constructor(
    private formBuilder: FormBuilder,
    private courseService: CourseService,
    private activatedRoute: ActivatedRoute,
    private gridStorageService: GridStorageService
  ){}

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
    this.createAssignmentForm.controls.assignmentName.setValue('');
    this.createAssignmentForm.controls.description.setValue('');
    this.createAssignmentForm.controls.dueDate.setValue(null);
    this.closeModal!.nativeElement.click();
  }

  onSubmit(): void {
    this.isLoading = true;
    const dueDate = moment(this.createAssignmentForm.value.dueDate);
    this.createAssignmentForm.controls.dueDate.setValue(dueDate.endOf('day').toISOString() as any);
    this.courseService.createAssignment(this.classId, this.createAssignmentForm.value.assignmentName, this.createAssignmentForm.value.dueDate, this.createAssignmentForm.value.description).subscribe(()=>{
      this.isLoading = false;
      this.createSuccess = true;
      this.gridStorageService.emit$(GRID_STORAGE.refresh, true);
    })
  }

  buttonDisabled(): boolean {
    return this.createAssignmentForm.value.assignmentName === '' || this.createAssignmentForm.value.dueDate === null;
  }
}
