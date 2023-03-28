import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APPLICATION_NAME, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { CognitoService } from 'src/app/services/cognito.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  currentState : LANDING_PAGE_STATE | undefined;
  appname = APPLICATION_NAME;
  display = false;

  constructor(
    private landingPageStorageService: LandingPageStorageService,
    private cognitoService: CognitoService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.currentState = LANDING_PAGE_STATE.DEFAULT;

    this.cognitoService.isAuthenticated().subscribe((success: boolean )=> {
      if(success){
        this.landingPageStorageService.set$(
          LANDING_PAGE_STORAGE.currentState,
          LANDING_PAGE_STATE.HOME
        );
        
        this.router.navigate(['/home']);
      }else{
        this.display = true;
      }
    })

    this.landingPageStorageService.listen$(
      LANDING_PAGE_STORAGE.currentState
    ).subscribe((state: LANDING_PAGE_STATE) => {
      this.currentState = state;
    })
  }

  onSignUpClick(): void {
    this.landingPageStorageService.set$(
      LANDING_PAGE_STORAGE.currentState,
      LANDING_PAGE_STATE.SIGN_UP
    )
  }

}
