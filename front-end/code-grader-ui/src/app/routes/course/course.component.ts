import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, ColumnApi, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Observable, forkJoin, from, of, switchMap, tap } from 'rxjs';
import { COURSE_STATE, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { DeleteRosterButtonComponent } from 'src/app/components/modals/delete-roster/delete-roster-button.component';
import { ModifyRosterButtonComponent } from 'src/app/components/modals/modify-roster/modify-roster-button.component';
import { CognitoService } from 'src/app/services/cognito.service';
import { CourseService } from 'src/app/services/course.service';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
  classId: string | undefined;
  user: any;
  userRole: string | undefined;
  className: string | undefined;
  instructor: string | undefined;
  graders: any[] | undefined;
  classInfo: any | undefined;
  classSize: number | undefined;
  pendingCount: number | undefined;

  date = new Date().toLocaleString();

  courseState: COURSE_STATE = COURSE_STATE.OVERVIEW;

  gridApi: GridApi | undefined;
  columnApi: ColumnApi | undefined;
  // Each Column Definition results in one Column.
  public columnDefs: ColDef[] = [
    { field: 'first_name', headerName: "First Name" },
    { field: 'last_name', headerName: "Last Name" },
    { field: 'email', headerName: "Email" },
    { field: 'role_name', headerName: "Role" },
    { headerName: "", cellRenderer: ModifyRosterButtonComponent },
    { headerName: "", cellRenderer: DeleteRosterButtonComponent }
  ];

  public assignmentsColumnDefs: ColDef[] = [
    { field: 'assignmentName', headerName: "Assignment Name" },
    { field: 'dueDate', headerName: "Due Date" }
  ]

  public submissionColumnDefs: ColDef[] = [
    { field: 'assignmentName', headerName: "Assignment Name" },
    { field: 'date', headerName: "Submission Date" }
  ]

  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  };

  public rowData$!: Observable<any[]>;
  public assignmentsRowData$!: Observable<any[]>;
  public submissionRowData$!: Observable<any[]>;

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private landingPageStorageService: LandingPageStorageService,
    private cognitoService: CognitoService,
    private gridStorageService: GridStorageService
  ) { }

  ngOnInit(): void {
    this.validateUserCheck();

    this.activateRoute.params.subscribe((params: any) => {
      this.classId = params.classId;
    })

    this.gridStorageService.listen$(GRID_STORAGE.refresh).subscribe(() => {
      this.refreshData();
      this.refreshSubmissionData();
      this.refreshSubmissionData();
      this.fetchClassData();
    })

    this.fetchClassData();
  }

  onGridReady(params: GridReadyEvent) {
    this.refreshData();
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.gridApi.sizeColumnsToFit();
  }

  fetchClassData(): void {
    this.activateRoute.params.pipe(
      tap((params: any) => {
        this.classId = params.classId;
      }),
      switchMap((params: any) => {
        return forkJoin({
          classInfo: this.courseService.getClassFromClassId(params.classId),
          instructor: this.courseService.getInstructorForCourse(params.classId),
          graders: this.courseService.getGradersForCourse(params.classId),
          classSize: this.courseService.getNumberOfStudentsForCourse(params.classId),
          roster: this.courseService.getRosterforClass(params.classId),
          pendingCount: this.courseService.getPendingCount(params.classId)
        })
      })
    ).subscribe((data: any) => {
      this.classInfo = data.classInfo;
      this.classSize = data.classSize;
      this.className = data.classInfo?.class_name;
      this.graders = data.graders;
      this.pendingCount = data.pendingCount;
      this.instructor = `${data.instructor[0].first_name} ${data.instructor[0].last_name}`
    });
  }

  onAssignmentsGridReady(params: GridReadyEvent) {
    this.refreshAssignmentsData();
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.gridApi.sizeColumnsToFit();
  }

  onSubmissionGridReady(params: GridReadyEvent) {
    this.refreshSubmissionData();
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.gridApi.sizeColumnsToFit();
  }

  // Consuming Grid Event
  onCellClicked(e: CellClickedEvent): void {
    this.gridStorageService.set$(
      GRID_STORAGE.selectedRowData,
      { ...e.data, classInfo: this.classInfo }
    )
  }

  refreshData(): void {

    const dataServiceMap = {
      [COURSE_STATE.ROSTER]: this.courseService.getRosterforClass(this.classId!),
      [COURSE_STATE.ASSIGNMENTS]: this.courseService.getAssignmentsForClass(this.classId!),


    } as any;

    this.rowData$ = this.courseService.getRosterforClass(this.classId!);
  }

  refreshAssignmentsData(): void {
    this.assignmentsRowData$ = this.courseService.getAssignmentsForClass(this.classId!);
  }

  refreshSubmissionData(): void {
    this.submissionRowData$ = this.courseService.getSubmissionsForClass(this.classId!);
  }

  clearSelection(): void {
    this.agGrid.api.deselectAll();
  }

  validateUserCheck(): void {
    //Check to see if the user is authenticated + logged in AND if they belong in the class.
    this.cognitoService.isAuthenticated().pipe(
      tap((success: boolean) => {
        if (success) {
          this.landingPageStorageService.set$(
            LANDING_PAGE_STORAGE.currentState,
            LANDING_PAGE_STATE.HOME
          );
        }
      }),
      switchMap((success: boolean) => {
        if (success) {
          return this.cognitoService.getUser().pipe(
            tap((user: any) => {
              if (user.attributes) {
                this.user = user.attributes;
              } else {
                this.router.navigate(['']);
              }
            })
          )
        }

        return of(success);
      }),
      switchMap(() => {
        return this.courseService.checkUserBelongsToCourse(this.user.email, this.classId!);
      })
    ).subscribe((val: boolean | string) => {
      if (!val) {
        this.router.navigate(['']);
      } else {
        this.userRole = val as string;
      }
    });
  }

  onAccordionClick(state: string): void {
    this.courseState = this.courseState === state as COURSE_STATE ? COURSE_STATE.NO_STATE : state as COURSE_STATE;
  }

}
