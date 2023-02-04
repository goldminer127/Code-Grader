import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { APPLICATION_NAME, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { IUser } from 'src/app/app.model';
import { CognitoService } from 'src/app/services/cognito.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';
import { UserStorageService, USER_STORAGE } from 'src/app/services/user-storage.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  appname = APPLICATION_NAME;
  isLoading = false;
  emailAlreadyExist = false;
  errorMessage = null;

  constructor(
    private landingPageStorageService: LandingPageStorageService,
    private cognitoService: CognitoService,
    private userStorageService: UserStorageService
  ) { }


  ngOnInit(): void {
    this.signUpForm.get('email')?.valueChanges.subscribe(()=> {
      this.emailAlreadyExist = false;
    })
  }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value

    return pass === confirmPass ? null : { passMismatch: true }
  }

  signUpForm = new FormGroup({
    email: new FormControl(null, Validators.email),
    firstName: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    lastName: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
  })

  passwords = new FormGroup({
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required)
  }, { validators: this.checkPasswords })


  signUpFormSubmit(): void {
    const signUpUser: IUser = {
      email: this.signUpForm.value.email!,
      firstName: this.signUpForm.value.firstName!,
      lastName: this.signUpForm.value.lastName!,
      password: this.passwords.value.password!
    }

    this.errorMessage = null;
    this.isLoading = true;

    this.cognitoService.signUp(signUpUser).subscribe(() => {
      this.isLoading = false;

      this.userStorageService.set$(
        USER_STORAGE.USER,
        signUpUser
      )

      this.landingPageStorageService.set$(
        LANDING_PAGE_STORAGE.currentState,
        LANDING_PAGE_STATE.CONFIRM_SIGN_UP
      )
    },
      err => {

        if(err.code === 'UsernameExistsException'){
          this.emailAlreadyExist = true;
        }else{
          this.errorMessage = err.message;
        }

        this.isLoading = false;
      }
    )
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