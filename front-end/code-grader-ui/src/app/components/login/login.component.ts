import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APPLICATION_NAME, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { CognitoService } from 'src/app/services/cognito.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';
import { UserStorageService, USER_STORAGE } from 'src/app/services/user-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  appname = APPLICATION_NAME;
  model: any;
  isLoading = false;
  errorMessage: string | null = null;
  success = false;

  constructor(
    private landingPageStorageService: LandingPageStorageService,
    private cognitoService: CognitoService,
    private userStorageService: UserStorageService,
    private router: Router
  ) { }

  loginForm = new FormGroup({
    email: new FormControl(null, Validators.email),
    password: new FormControl(null, Validators.required)
  })

  onRegisterHereClick(): void {
    this.landingPageStorageService.set$(
      LANDING_PAGE_STORAGE.currentState,
      LANDING_PAGE_STATE.SIGN_UP
    )
  }

  onForgotPasswordClick(): void {
    this.landingPageStorageService.set$(
      LANDING_PAGE_STORAGE.currentState,
      LANDING_PAGE_STATE.FORGOT_PASSWORD
    )
  }
  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.cognitoService.signIn(this.loginForm.value.email!, this.loginForm.value.password!).subscribe(() => {
      this.success = true;
      this.redirectToHome()
    },
      err => {
        if (err.code === 'UserNotConfirmedException') {
          this.errorMessage = 'Email not confirmed. Redirecting to confirm your email...';

          this.redirectConfirmEmail();
        } else {
          this.errorMessage = err.message;
          this.isLoading = false;
        }
      },
    )

  }

  redirectToHome(): void {
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 3000)
  }

  redirectConfirmEmail(): void {
    setTimeout(() => {
      this.userStorageService.set$(
        USER_STORAGE.USER,
        {
          email: this.loginForm.value.email,
          password: this.loginForm.value.password
        }
      )

      this.cognitoService.resendCode(this.loginForm.value.email!);

      this.landingPageStorageService.set$(
        LANDING_PAGE_STORAGE.currentState,
        LANDING_PAGE_STATE.CONFIRM_SIGN_UP
      )
    }, 5000)

  }
}
