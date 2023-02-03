import { Component } from '@angular/core';
import { APPLICATION_NAME, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  appname = APPLICATION_NAME;

  constructor(
    private landingPageStorageService: LandingPageStorageService
  ){}

  onRegisterHereClick(): void {
    this.landingPageStorageService.set$(
      LANDING_PAGE_STORAGE.currentState,
      LANDING_PAGE_STATE.SIGN_UP
    )
  }
}
