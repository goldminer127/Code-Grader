import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { APPLICATION_NAME, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { CognitoService } from 'src/app/services/cognito.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  appname = APPLICATION_NAME;
  isLoading = false;
  codeSent = false;
  confirmationCode = '';
  password = '';
  errorMessage : string = null;
  successMessage : string | null = null;

  passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);

  constructor(
    private landingPageStorageService: LandingPageStorageService,
    private cognitoService: CognitoService
  ) { }

  forgotPasswordForm = new FormGroup({
    email: new FormControl(null, Validators.email)
  })

  forgotPasswordSubmit(): void {
    this.isLoading = true;

    this.cognitoService.forgotPassword(this.forgotPasswordForm.value.email!).subscribe((x) => {
      this.isLoading = false;
      this.codeSent = true;
      this.errorMessage = null;
    },

      err => {
        this.errorMessage = err.message;
      }

    )
  }

  onRegisterHereClick(): void {
    this.landingPageStorageService.set$(
      LANDING_PAGE_STORAGE.currentState,
      LANDING_PAGE_STATE.SIGN_UP
    )
  }

  onSubmit(): void {
    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.cognitoService.forgotPasswordSubmit(this.forgotPasswordForm.value.email!, this.confirmationCode, this.password).subscribe(()=> {
      this.isLoading = false;

      this.successRedirect();
    },
    err => {
      this.isLoading = false;
      this.errorMessage = err.message;
    }

    )
  }

  successRedirect(): void {
    this.successMessage = 'Successfully changed password! Redirecting to login...';

    setTimeout(()=> {
      this.landingPageStorageService.set$(
        LANDING_PAGE_STORAGE.currentState,
        LANDING_PAGE_STATE.LOGIN
      )
    }, 5000)
  }

  enableButton(): boolean {
    return !!this.confirmationCode && this.passwordRegex.test(this.password);
  }
}
