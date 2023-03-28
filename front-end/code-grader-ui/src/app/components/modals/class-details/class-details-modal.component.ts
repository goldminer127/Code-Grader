import { Component, OnInit } from '@angular/core';
import { forkJoin, mergeMap, switchMap } from 'rxjs';
import { CourseService } from 'src/app/services/course.service';
import { GridStorageService, GRID_STORAGE } from 'src/app/services/grid-storage.service';

@Component({
  selector: 'app-class-details-modal',
  templateUrl: './class-details-modal.component.html',
  styleUrls: ['./class-details-modal.component.scss']
})
export class ClassDetailsModalComponent implements OnInit {
  rowData : any = null;
  isLoading  = true;

  instructor: any[] | undefined;
  graders: any[] | undefined;
  classSize: string | undefined;

  constructor(
    private gridStorageService: GridStorageService,
    private courseService: CourseService
  ) {

  }

  ngOnInit(): void {
    this.gridStorageService.get$(GRID_STORAGE.selectedRowData).pipe(
      switchMap((rowData: any)=>{
        this.rowData = rowData;
        return forkJoin({
          numberOfStudents: this.courseService.getNumberOfStudentsForCourse(rowData.classId),
          instructor: this.courseService.getInstructorForCourse(rowData.classId),
          graders: this.courseService.getGradersForCourse(rowData.classId)
        })
      })
    ).subscribe((courseData: any)=>{
      this.classSize = courseData.numberOfStudents;
      this.instructor = courseData.instructor;
      this.graders = courseData.graders;
      this.isLoading = false;
    })
  }

}
