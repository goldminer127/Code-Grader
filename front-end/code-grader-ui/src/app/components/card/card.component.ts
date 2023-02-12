import { Component, Input, OnInit } from '@angular/core';
import { DarkModeService } from 'angular-dark-mode';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() title: string | undefined;
  @Input() mainBody: string | undefined;
  @Input() footer: string | undefined;

  darkMode : boolean = false;

  constructor(
    private darkModeService: DarkModeService
  ){}

  ngOnInit(): void {
    this.darkModeService.darkMode$.subscribe((darkMode: boolean ) => {
      this.darkMode = darkMode;
    })
  }
}
