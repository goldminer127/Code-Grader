import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { APPLICATION_NAME, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  appname = APPLICATION_NAME;

  constructor(
    private landingPageStorageService: LandingPageStorageService
  ){}

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value

    return pass === confirmPass ? null : { passMismatch: true }
  }

  signUpForm = new FormGroup({
    username: new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(15)]),
    email: new FormControl(null, Validators.email),
    firstName: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    lastName: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
  })

  passwords = new FormGroup({
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required)
  }, { validators: this.checkPasswords })


  signUpFormSubmit(): void {
    // console.log("sign up ", this.signUpForm)
    // console.log("pw ", this.passwords)
  }

  checkForms(): boolean {
    return (this.signUpForm.valid && this.passwords.valid)
  }

  onSignInClick(): void {
    this.landingPageStorageService.set$(
      LANDING_PAGE_STORAGE.currentState,
      LANDING_PAGE_STATE.LOGIN
    )
  }

}