import { Component, OnInit } from '@angular/core';
import { DarkModeService } from 'angular-dark-mode';
import { Observable } from 'rxjs';
import { APPLICATION_NAME, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
  navbarState = 'landing-page';
  appname = APPLICATION_NAME;
  darkMode = true;

  constructor(
    private landingPageStorageService: LandingPageStorageService,
    private darkModeService: DarkModeService
  ) { }

  ngOnInit(): void {
    this.landingPageStorageService.set$(
      LANDING_PAGE_STORAGE.currentState,
      LANDING_PAGE_STATE.HOME
    )

    this.fetchLocalStoreDarkVal();
  }

  fetchLocalStoreDarkVal() : void {
    const darkModeVal = JSON.parse(localStorage.getItem('dark-mode') as string)?.darkMode;

    if(darkModeVal){
      this.darkModeService.enable()
      this.darkMode = false;
    }else{
      this.darkMode = true;
      this.darkModeService.disable();
    }
  }

  onToggle(): void {
    this.darkModeService.toggle();
    this.darkMode = !this.darkMode;
  }

  onNavbarClick(state: string): void {
    this.landingPageStorageService.set$(
      LANDING_PAGE_STORAGE.currentState,
      state as LANDING_PAGE_STATE
    )
  }

}
