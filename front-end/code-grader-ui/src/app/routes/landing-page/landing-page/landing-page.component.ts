import { Component, OnInit } from '@angular/core';
import { APPLICATION_NAME, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  currentState : LANDING_PAGE_STATE = LANDING_PAGE_STATE.HOME;
  appname = APPLICATION_NAME;

  constructor(
    private landingPageStorageService: LandingPageStorageService
  ){}

  ngOnInit(): void {
    this.landingPageStorageService.listen$(
      LANDING_PAGE_STORAGE.currentState
    ).subscribe((state: LANDING_PAGE_STATE) => {
      this.currentState = state;
    })
  }

}
