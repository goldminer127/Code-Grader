import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DarkModeService } from 'angular-dark-mode';
import { Observable } from 'rxjs';
import { APPLICATION_NAME, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { CognitoService } from 'src/app/services/cognito.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
  navbarState = LANDING_PAGE_STATE.DEFAULT;
  appname = APPLICATION_NAME;
  darkMode = true;

  constructor(
    private landingPageStorageService: LandingPageStorageService,
    private darkModeService: DarkModeService,
    private router: Router,
    private cognitoService: CognitoService
  ) { }

  ngOnInit(): void {
    this.landingPageStorageService.set$(
      LANDING_PAGE_STORAGE.currentState,
      LANDING_PAGE_STATE.DEFAULT
    )

    this.landingPageStorageService.get$(
      LANDING_PAGE_STORAGE.currentState
    ).subscribe((state: LANDING_PAGE_STATE) => {
      this.navbarState = state;
    })

    this.fetchLocalStoreDarkVal();
  }

  fetchLocalStoreDarkVal(): void {
    const darkModeVal = JSON.parse(localStorage.getItem('dark-mode') as string)?.darkMode;

    if (darkModeVal) {
      this.darkModeService.enable()
      this.darkMode = false;
    } else {
      this.darkMode = true;
      this.darkModeService.disable();
    }
  }

  onToggle(): void {
    this.darkModeService.toggle();
    this.darkMode = !this.darkMode;
  }

  onNavbarClick(state: string): void {
    if(state === 'home'){
      this.router.navigate(['home']);
    }else{
      this.landingPageStorageService.set$(
        LANDING_PAGE_STORAGE.currentState,
        state as LANDING_PAGE_STATE
      )
    }
  }

  signOutClick(): void {
    this.cognitoService.signOut().subscribe(() => {
      this.landingPageStorageService.set$(
        LANDING_PAGE_STORAGE.currentState,
        LANDING_PAGE_STATE.DEFAULT
      );
      
      this.router.navigate(['']);
    })
  }

}
