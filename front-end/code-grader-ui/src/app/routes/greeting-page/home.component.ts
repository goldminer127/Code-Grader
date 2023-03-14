import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, ColumnApi, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { LANDING_PAGE_STATE, PILLS } from 'src/app/app.constants';
import { IUser } from 'src/app/app.model';
import { CognitoService } from 'src/app/services/cognito.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';

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
    { field: 'make', headerName: "Class Name" },
    { field: 'model', headerName: "Role" },
    { field: 'price', headerName: 'View Details' },
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
    private http: HttpClient
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
          this.user = user.attributes;
        })
      } else {
        this.router.navigate(['']);
      }
    })
  }

  onGridReady(params: GridReadyEvent) {
    this.refreshData();
    console.log("params ", params)
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
    console.log("fetch ")

    this.rowData$ = this.http
      .get<any[]>('https://www.ag-grid.com/example-assets/row-data.json');
  }
}
