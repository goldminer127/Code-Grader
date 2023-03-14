import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LANDING_PAGE_STATE } from 'src/app/app.constants';
import { IUser } from 'src/app/app.model';
import { CognitoService } from 'src/app/services/cognito.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: IUser;

  constructor(
    private landingPageStorageService: LandingPageStorageService,
    private cognitoService: CognitoService,
    private router: Router
  ) {
    this.user = {} as IUser;
  }

  ngOnInit(): void {
    this.cognitoService.isAuthenticated().subscribe((success: boolean) => {
      if (success) {
        this.landingPageStorageService.set$(
          LANDING_PAGE_STORAGE.currentState,
          LANDING_PAGE_STATE.HOME
        );

        this.cognitoService.getUser().subscribe((user: any)=>{
          this.user = user.attributes;
        })
      } else {
        this.router.navigate(['']);
      }
    })
  }
}
