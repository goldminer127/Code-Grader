import { Component, OnInit } from '@angular/core';
import { APPLICATION_NAME, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { IUser } from 'src/app/app.model';
import { CognitoService } from 'src/app/services/cognito.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';
import { UserStorageService, USER_STORAGE } from 'src/app/services/user-storage.service';

@Component({
  selector: 'app-confirm-signup',
  templateUrl: './confirm-signup.component.html',
  styleUrls: ['./confirm-signup.component.scss']
})
export class ConfirmSignupComponent implements OnInit {
  appname = APPLICATION_NAME;
  confirmationCode = '';
  isLoading = false;
  isLoadingResend = false;
  errorMessage : string = null;
  errorMessageResend : string = null;
  successMessageResend = false;
  disableResend = false;
  successConfirm = false;

  user: IUser | undefined;

  constructor(
    private cognitoService: CognitoService,
    private userStorageService: UserStorageService,
    private landingPageStorageService: LandingPageStorageService
  ) { }

  ngOnInit(): void {
    this.user = this.userStorageService.get(USER_STORAGE.USER);
  }

  onConfirm(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.cognitoService.confirmSignUp(this.user!, this.confirmationCode).subscribe(() => {
      this.isLoading = false;
      this.userStorageService.set$(USER_STORAGE.USER, null); //Reset the storage
      this.successRedirect();
    },
      err => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    )
  }

  resendCode(): void {
    this.isLoadingResend = true;
    this.errorMessageResend = null;
    this.successMessageResend = false;
    this.disableResend = true;

    this.cognitoService.resendCode(this.user!.email).subscribe(() => {
      this.isLoadingResend = false;
      this.successMessageResend = true;
      this.disableResendButton();
    },
      err => {
        this.errorMessageResend = err.message;
        this.isLoadingResend = false;
        this.disableResendButton();
      }
    )
  }

  disableResendButton(): void {
    setTimeout(()=> {
      this.disableResend = false;
    }, 5000)
  }

  successRedirect(): void {
    this.successConfirm = true;
    setTimeout(()=> {
      this.landingPageStorageService.set$(
        LANDING_PAGE_STORAGE.currentState,
        LANDING_PAGE_STATE.LOGIN
      )
    }, 3000)
  }
}
