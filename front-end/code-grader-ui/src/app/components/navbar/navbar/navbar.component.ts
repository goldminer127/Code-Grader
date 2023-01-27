import { Component, OnInit } from '@angular/core';
import { LANDING_PAGE_STATE } from 'src/app/app.constants';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit{

  constructor(
    public landingPageStorageService: LandingPageStorageService
  ){}

  ngOnInit(): void {
    this.landingPageStorageService.set$(
      LANDING_PAGE_STORAGE.currentState,
      LANDING_PAGE_STATE.HOME
    )
  }

  onNavbarClick(state: string): void {
    if(state === LANDING_PAGE_STATE.DARK_MODE || state === LANDING_PAGE_STATE.LIGHT_MODE){
      //TODO
    }else{
      this.landingPageStorageService.set$(
        LANDING_PAGE_STORAGE.currentState,
        state as LANDING_PAGE_STATE
      )
    }
  }
  
}
