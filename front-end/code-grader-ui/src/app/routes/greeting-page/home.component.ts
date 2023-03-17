import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, ColumnApi, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Observable, switchMap } from 'rxjs';
import { LANDING_PAGE_STATE, PILLS } from 'src/app/app.constants';
import { CourseLinkComponent } from 'src/app/components/course-link/course-link.component';
import { ClassDetailsModalButtonComponent } from 'src/app/components/modals/class-details/class-details-modal-button.component';
import { CognitoService } from 'src/app/services/cognito.service';
import { CourseService } from 'src/app/services/course.service';
import { GridStorageService, GRID_STORAGE } from 'src/app/services/grid-storage.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: any;
  activePill: PILLS = PILLS.ALL;
  gridApi: GridApi | undefined;
  columnApi: ColumnApi | undefined;

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
    private courseService: CourseService
  ) {
    this.user = {};
  }

  ngOnInit(): void {
    this.cognitoService.isAuthenticated().subscribe((success: boolean) => {
      if (success) {
        this.landingPageStorageService.set$(
          LANDING_PAGE_STORAGE.currentState,
          LANDING_PAGE_STATE.HOME
        );

        this.cognitoService.getUser().subscribe((user: any) => {
          if (user.attributes) {
            this.user = user.attributes;
          } else {
            this.router.navigate([''])
          }
        },
          err => console.log("Err ", err)
        )
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
        switchMap((resp: any)=> {
          return this.courseService.getAllCourses(resp.message.userInfo.user_id, this.activePill);
        })
      )
  }
}
