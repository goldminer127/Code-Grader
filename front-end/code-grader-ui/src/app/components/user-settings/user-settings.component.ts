import { Component, OnInit } from '@angular/core';
import { DarkModeService } from 'angular-dark-mode';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {

  darkMode : boolean | undefined;

  constructor(
    private darkmodeService: DarkModeService
  ){}

  ngOnInit(): void {
    this.darkmodeService.darkMode$.subscribe( (val: boolean) => {
      this.darkMode = val;
    })
  }

}
