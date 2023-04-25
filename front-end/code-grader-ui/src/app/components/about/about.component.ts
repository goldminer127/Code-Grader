import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DarkModeService } from 'angular-dark-mode';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  darkMode = false;
  viewportWidth = 1000; //Arbitrary number. 
  mobileWidthBootstrap = 575;

  studentFeaturesArrowUp = false;
  graderFeaturesArrowUp = false;
  instructorFeaturesArrowUp = false;

  @ViewChild('studentFeaturesContent', { read: ElementRef, static:false }) studentFeaturesContent!: ElementRef;
  @ViewChild('gradersFeaturesContent', { read: ElementRef, static:false }) gradersFeaturesContent!: ElementRef;
  @ViewChild('instructorsFeaturesContent', { read: ElementRef, static:false }) instructorsFeaturesContent!: ElementRef;
  @ViewChild('aboutContainer', { read: ElementRef, static:false }) aboutContainer!: ElementRef;

  constructor(
    private darkModeService: DarkModeService
  ) { }

  ngOnInit(): void {
    this.darkModeService.darkMode$.subscribe((darkMode: boolean) => {
      this.darkMode = darkMode;
    })
    

    this.viewportWidth = window.innerWidth;
  }
  
  removeShowClass(): void {
    this.studentFeaturesContent.nativeElement.classList.remove('show');
    this.gradersFeaturesContent.nativeElement.classList.remove('show');
    this.instructorsFeaturesContent.nativeElement.classList.remove('show');

    this.studentFeaturesArrowUp = false;
    this.graderFeaturesArrowUp = false;
    this.instructorFeaturesArrowUp = false;
  }
}
