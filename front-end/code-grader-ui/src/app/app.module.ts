import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar/navbar.component';
import { LandingPageComponent } from './routes/landing-page/landing-page/landing-page.component';
import { LandingPageStorageService } from './services/landing-page.service';
import { AboutComponent } from './components/about/about.component';
import { LoginComponent } from './components/login/login.component';
import { FeaturesComponent } from './components/features/features.component';
import { SignupComponent } from './components/signup/signup.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CognitoService } from './services/cognito.service';
import { ConfirmSignupComponent } from './components/confirm-signup/confirm-signup.component';
import { UserStorageService } from './services/user-storage.service';
import { CardComponent } from './components/card/card.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { HomeComponent } from './routes/greeting-page/home.component';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from  '@angular/common/http';
import { GridComponent } from './components/grid/grid.component';
import { ClassDetailsModalComponent } from './components/modals/class-details/class-details-modal.component';
import { ClassDetailsModalButtonComponent } from './components/modals/class-details/class-details-modal-button.component';
import { CourseService } from './services/course.service';
import { CourseComponent } from './routes/course/course.component';
import { CourseLinkComponent } from './components/course-link/course-link.component';
import { JoinCourseModalComponent } from './components/modals/join-course/join-course-modal.component';
import { CreateCourseModalComponent } from './components/modals/create-course/create-course-modal.component';
import { ModifyRosterComponent } from './components/modals/modify-roster/modify-roster.component';
import { ModifyRosterButtonComponent } from './components/modals/modify-roster/modify-roster-button.component';
import { DeleteRosterButtonComponent } from './components/modals/delete-roster/delete-roster-button.component';
import { DeleteRosterModalComponent } from './components/modals/delete-roster/delete-roster-modal.component';
import { CreateAssignmentModalButtonComponent } from './components/modals/create-assignment/create-assignment-modal-button.component';
import { CreateAssignmentModalComponent } from './components/modals/create-assignment/create-assignment-modal.component';
import { AssignmentDetailModalButtonComponent } from './components/modals/assignment-detail/assignment-detail-modal-button.component';
import { AssignmentDetailModalComponent } from './components/modals/assignment-detail/assignment-detail-modal.component';
import { ViewSubmissionButtonComponent } from './components/modals/submission/view-submission-button.component';

import { CodeEditorModule } from '@ngstack/code-editor';
import { SubmissionViewComponent } from './components/submission-view/submission-view.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { GradingViewButtonComponent } from './components/grading-view/grading-view-button.component';
import { GradingViewComponent } from './components/grading-view/grading-view.component';
import { AssignGradeButtonComponent } from './components/modals/assign-grade/assign-grade-button.component';
import { AssignGradeModalComponent } from './components/modals/assign-grade/assign-grade-modal.component';
import { ViewFeedbackModalComponent } from './components/modals/view-feedback/view-feedback-modal.component';
import { ViewFeedbackButtonComponent } from './components/modals/view-feedback/view-feedback-button.component';
import { UnderConstructionComponent } from './components/under-construction/under-construction.component';
import { AddHeaderInterceptor } from './services/addHeaderInterceptor';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    NavbarComponent,
    AboutComponent,
    LoginComponent,
    FeaturesComponent,
    SignupComponent,
    UserSettingsComponent,
    ConfirmSignupComponent,
    CardComponent,
    ForgotPasswordComponent,
    HomeComponent,
    GridComponent,
    ClassDetailsModalComponent,
    ClassDetailsModalButtonComponent,
    CourseComponent,
    CourseLinkComponent,
    JoinCourseModalComponent,
    CreateCourseModalComponent,
    ModifyRosterComponent,
    ModifyRosterButtonComponent,
    DeleteRosterButtonComponent,
    DeleteRosterModalComponent,
    CreateAssignmentModalButtonComponent,
    CreateAssignmentModalComponent,
    AssignmentDetailModalButtonComponent,
    AssignmentDetailModalComponent,
    ViewSubmissionButtonComponent,
    SubmissionViewComponent,
    GradingViewButtonComponent,
    GradingViewComponent,
    AssignGradeButtonComponent,
    AssignGradeModalComponent,
    ViewFeedbackModalComponent,
    ViewFeedbackButtonComponent,
    UnderConstructionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule,
    HttpClientModule,
    CodeEditorModule.forRoot(),
    MonacoEditorModule.forRoot()
  ],
  providers: [
    LandingPageStorageService,
    CognitoService,
    UserStorageService,
    CourseService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AddHeaderInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
