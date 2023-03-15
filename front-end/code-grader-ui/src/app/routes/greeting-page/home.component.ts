import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, ColumnApi, GridApi, GridReadyEvent } from 'ag-grid-community';
import { map, Observable, switchMap } from 'rxjs';
import { LANDING_PAGE_STATE, PILLS } from 'src/app/app.constants';
import { IUser } from 'src/app/app.model';
import { CognitoService } from 'src/app/services/cognito.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: IUser;
  activePill: PILLS = PILLS.ALL;
  gridApi: GridApi | undefined;
  columnApi: ColumnApi | undefined;

  // Each Column Definition results in one Column.
  public columnDefs: ColDef[] = [
    { field: 'class_name', headerName: "Class Name" },
    { field: 'role_name', headerName: "Role" },
    { field: '', headerName: 'View Details' },
    { headerName: 'Enter Class' }
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
    private http: HttpClient,
    private userService: UserService
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

  // Example of consuming Grid Event
  onCellClicked(e: CellClickedEvent): void {
    console.log('cellClicked', e);
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
          return this.http
            .get<any[]>(`http://localhost:3000/class/${resp.message.userInfo.user_id}`).pipe(
              map((data:any )=> {
                const results = this.activePill === PILLS.ALL ? data.message.instructorClasses.concat(data.message.graderClasses, data.message.studentClasses)
                                : this.activePill === PILLS.GRADER ? data.message.graderClasses
                                : this.activePill === PILLS.INSTRUCTOR ? data.message.instructorClasses
                                : data.message.studentClasses
                return results;
              })
            );
        })
      )

  }
}
