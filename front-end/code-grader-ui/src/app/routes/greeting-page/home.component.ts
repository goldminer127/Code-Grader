import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, ColumnApi, GridApi, GridReadyEvent } from 'ag-grid-community';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { LANDING_PAGE_STATE, PILLS } from 'src/app/app.constants';
import { CourseLinkComponent } from 'src/app/components/course-link/course-link.component';
import { ClassDetailsModalButtonComponent } from 'src/app/components/modals/class-details/class-details-modal-button.component';
import { CognitoService } from 'src/app/services/cognito.service';
import { CourseService } from 'src/app/services/course.service';
import { GridStorageService, GRID_STORAGE } from 'src/app/services/grid-storage.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';
import { UserStorageService, USER_STORAGE } from 'src/app/services/user-storage.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  user: any;
  activePill: PILLS = PILLS.ALL;
  gridApi: GridApi | undefined;
  columnApi: ColumnApi | undefined;

  isLoading  = false;

  mobileAllData$!: any[];
  mobileInstructorData!: any[];
  mobileGraderData!: any[];
  mobileStudentData!: any[];

  // Each Column Definition results in one Column.
  public columnDefs: ColDef[] = [
    { field: 'className', headerName: "Class Name" },
    { field: 'roleName', headerName: "Role" },
    { field: '', headerName: 'View Details', cellRenderer: ClassDetailsModalButtonComponent },
    { headerName: 'Enter Class', cellRenderer: CourseLinkComponent }
  ];

  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  };

  public rowData$!: Observable<any[]>;
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  constructor(
    private landingPageStorageService: LandingPageStorageService,
    private cognitoService: CognitoService,
    private router: Router,
    private userService: UserService,
    private gridStorageService: GridStorageService,
    private courseService: CourseService,
    private userStorageService: UserStorageService
  ) {
    this.user = {};
  }
  ngOnDestroy(): void {
    document.body.classList.remove(
      LANDING_PAGE_STATE.HOME
    )
  }

  ngOnInit(): void {

    document.body.classList.add(
      LANDING_PAGE_STATE.HOME
    )

    this.cognitoService.isAuthenticated().subscribe((success: boolean) => {
      if (success) {
        this.isLoading = true;

        this.landingPageStorageService.set$(
          LANDING_PAGE_STORAGE.currentState,
          LANDING_PAGE_STATE.HOME
        );

        this.cognitoService.getUser().pipe(
          tap((user: any) => {
            if (user.attributes) {
              this.user = user.attributes;
            } else {
              this.router.navigate(['']);
            }
          }),
          switchMap(() => {
            return this.userService.getUserInfo(this.user.email);
          }),
          switchMap((userData:any)=>{
            return this.userService.getUserInfo(userData.message.userInfo.email).pipe(
              switchMap((resp: any)=>{
                return forkJoin({
                  all: this.courseService.getAllCourses(resp.message.userInfo.user_id, PILLS.ALL),
                  instructor: this.courseService.getAllCourses(resp.message.userInfo.user_id, PILLS.INSTRUCTOR),
                  grader: this.courseService.getAllCourses(resp.message.userInfo.user_id, PILLS.GRADER),
                  student: this.courseService.getAllCourses(resp.message.userInfo.user_id, PILLS.STUDENT),
                })
              }),
              tap((forkedData: any)=>{
                this.mobileAllData$ = forkedData.all;
                this.mobileInstructorData = forkedData.instructor;
                this.mobileGraderData = forkedData.grader;
                this.mobileStudentData = forkedData.student;
              }),
              map(()=>{
                return userData;
              })
            )
          })
        ).subscribe((userData: any) => {
          this.isLoading = false;
          this.userStorageService.set$(USER_STORAGE.USER, userData.message.userInfo);
        })
      } else {
        this.router.navigate(['']);
      }
    })
  }

  onGridReady(params: GridReadyEvent) {
    this.refreshData();
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.gridApi.sizeColumnsToFit();
  }

  // Consuming Grid Event
  onCellClicked(e: CellClickedEvent): void {
    this.gridStorageService.set$(
      GRID_STORAGE.selectedRowData,
      e.data
    )
  }

  clearSelection(): void {
    this.agGrid.api.deselectAll();
  }

  onPillClick(value: string): void {
    this.activePill = value as PILLS;
    this.refreshData();
  }

  refreshData(): void {
    this.rowData$ =
      this.userService.getUserInfo(this.user.email).pipe(
        switchMap((resp: any) => {
          return this.courseService.getAllCourses(resp.message.userInfo.user_id, this.activePill);
        })
      )
  }
}
