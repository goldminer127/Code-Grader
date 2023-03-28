import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, switchMap, tap } from 'rxjs';
import { COURSE_STATE, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { CognitoService } from 'src/app/services/cognito.service';
import { CourseService } from 'src/app/services/course.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
  classId: string | undefined;
  user: any;
  userRole: string | undefined;
  className: string | undefined;
  instructor: string | undefined;
  graders: any[] | undefined;
  classInfo: any | undefined;
  classSize: number | undefined;

  date = new Date().toLocaleString();

  courseState : COURSE_STATE = COURSE_STATE.OVERVIEW;

  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private landingPageStorageService: LandingPageStorageService,
    private cognitoService: CognitoService
  ) { }

  ngOnInit(): void {
    this.validateUserCheck();

    this.activateRoute.params.subscribe((params: any) => {
      this.classId = params.classId;
    })

    this.activateRoute.params.pipe(
      tap((params: any)=> {
        this.classId = params.classId;
      }),
      switchMap((params: any)=>{
        return forkJoin({
          classInfo: this.courseService.getClassFromClassId(params.classId),
          instructor: this.courseService.getInstructorForCourse(params.classId),
          graders: this.courseService.getGradersForCourse(params.classId),
          classSize: this.courseService.getNumberOfStudentsForCourse(params.classId)
        })
      })
    ).subscribe((data:any)=>{
      this.classInfo = data.classInfo;
      this.classSize = data.classSize;
      this.className = data.classInfo.class_name;
      this.graders = data.graders;
      this.instructor = `${data.instructor[0].first_name} ${data.instructor[0].last_name}`
    });

  }

  validateUserCheck(): void {
    //Check to see if the user is authenticated + logged in AND if they belong in the class.
    this.cognitoService.isAuthenticated().pipe(
      tap((success: boolean) => {
        if (success) {
          this.landingPageStorageService.set$(
            LANDING_PAGE_STORAGE.currentState,
            LANDING_PAGE_STATE.HOME
          );
        }
      }),
      switchMap((success: boolean) => {
        if (success) {
          return this.cognitoService.getUser().pipe(
            tap((user: any) => {
              if (user.attributes) {
                this.user = user.attributes;
              } else {
                this.router.navigate(['']);
              }
            })
          )
        }

        return of(success);
      }),
      switchMap(() => {
        return this.courseService.checkUserBelongsToCourse(this.user.email, this.classId!);
      })
    ).subscribe((val: boolean | string) => {
      if (!val) {
        this.router.navigate(['']);
      } else {
        this.userRole = val as string;
      }
    });
  }

  onAccordionClick(state: string): void {
    this.courseState = this.courseState === state as COURSE_STATE ? COURSE_STATE.NO_STATE : state as COURSE_STATE;
  }

}
