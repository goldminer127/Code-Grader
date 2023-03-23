import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CourseService } from 'src/app/services/course.service';
import { UserStorageService, USER_STORAGE } from 'src/app/services/user-storage.service';

@Component({
  selector: 'app-create-course-modal',
  templateUrl: './create-course-modal.component.html',
  styleUrls: ['./create-course-modal.component.scss']
})
export class CreateCourseModalComponent {

  @ViewChild('closeModal') closeModal: ElementRef | undefined;

  isLoading = false;
  inviteCode: string | undefined;
  classCreateSuccess = false;

  constructor(
    private formBuilder: FormBuilder,
    private courseService: CourseService,
    private userStorageService: UserStorageService
  ) { }

  createClassForm = this.formBuilder.group({
    className: ['', Validators.required]
  })

  onSubmit() {
    this.isLoading = true;
    const x = this.userStorageService.get(USER_STORAGE.USER);

    this.courseService.createClass(x.user_id, this.createClassForm.value.className!).subscribe((resp: any) => {
      this.isLoading = false;
      this.inviteCode = resp.message.inviteCode as string;
      this.classCreateSuccess = true;
    })
  }

  closeModalClick(): void {
    this.createClassForm.reset();
    this.createClassForm.controls.className.setValue('');
    this.isLoading = false;
    this.inviteCode = undefined;
    this.classCreateSuccess = false;

    this.closeModal!.nativeElement.click();
  }

  buttonDisabled(): boolean {
    return this.createClassForm.value.className!.length === 0 || this.isLoading;
  }
}
