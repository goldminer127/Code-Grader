import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, of, switchMap, tap } from 'rxjs';
import { CourseService } from 'src/app/services/course.service';
import { UserStorageService, USER_STORAGE } from 'src/app/services/user-storage.service';

@Component({
  selector: 'app-join-course-modal',
  templateUrl: './join-course-modal.component.html',
  styleUrls: ['./join-course-modal.component.scss']
})
export class JoinCourseModalComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef | undefined;
  isLoading  = false;
  inviteCodeClassInfo: any;
  classDoesNotExist = false;
  userPartOfClass: boolean | null = null;
  inviteCode: string | undefined;
  requestCourseSuccess  = false;
  courseRouterLink : string | undefined;
  user: any;

  constructor(
    private formBuilder: FormBuilder,
    private courseService: CourseService,
    private userStorageService: UserStorageService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.userStorageService.get$(USER_STORAGE.USER).subscribe((user:any)=>{
      this.user = user;
    })
  }

  inviteCodeForm = this.formBuilder.group({
    inviteCode: ['', Validators.required]
  })

  validateInviteCode(): void {
    this.inviteCode = this.inviteCodeForm.value.inviteCode!;

    this.classDoesNotExist = false;
    this.userPartOfClass = null;
    this.requestCourseSuccess = false;
    this.isLoading = true;

    this.courseService.checkInviteCode(this.inviteCode!).pipe( //Check if invite code is valid
      tap((resp:any)=>{
        let validClass  = false;
        if(resp.length > 0){
          this.inviteCodeClassInfo = resp[0];
          this.courseRouterLink = `/home/class/${this.inviteCodeClassInfo.class_id}`;
          validClass = true;
        }else{
          this.classDoesNotExist = true;
        }

        return validClass;
      }),
      switchMap((valid:boolean)=>{ //Check if user is part of the class
        if(valid){
          return this.courseService.checkUserPartOfClass(this.user.user_id, this.inviteCode!).pipe(
            tap((partOfClass: boolean)=>{
              this.userPartOfClass = partOfClass;
            })
          )
        }else{
          return of(false);
        }
      }), //Add User to class
      switchMap((partOfClass: boolean)=>{
        if(!partOfClass && !this.userPartOfClass && !this.classDoesNotExist){
          return this.courseService.requestToJoinClass(this.user.user_id, this.inviteCode!).pipe(
            map(()=>true)
          )
        }else{
          return of(false);
        }
        
      })
    )
    .subscribe((success: boolean)=>{
      this.isLoading = false;
      if(success && !this.userPartOfClass && !this.classDoesNotExist){ //Display class info and redirect to class page
        this.requestCourseSuccess = true; 
      }
    });
  }

  closeModalClick(): void {
    this.reset();

    this.closeModal!.nativeElement.click();
  }

  buttonDisabled(): boolean {
    return this.inviteCodeForm.value.inviteCode?.length === 0 || this.isLoading || this.requestCourseSuccess;
  }

  reset(): void {
    this.classDoesNotExist = false;
    this.userPartOfClass = null;
    this.requestCourseSuccess = false;
    this.isLoading = false;
    this.inviteCodeForm.reset();
    this.inviteCodeForm.controls.inviteCode.setValue('');
  }
}
