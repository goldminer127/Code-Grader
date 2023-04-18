import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CourseService } from 'src/app/services/course.service';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';

@Component({
  selector: 'app-delete-roster-modal',
  templateUrl: './delete-roster-modal.component.html',
  styleUrls: ['./delete-roster-modal.component.scss']
})
export class DeleteRosterModalComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef | undefined;

  isLoading = false;
  rowData: any;
  success = false;

  constructor(
    private gridStorageService: GridStorageService,
    private courseService: CourseService
  ){}

  ngOnInit(): void {
    this.gridStorageService.get$(GRID_STORAGE.selectedRowData).subscribe((data:any)=>{
      this.rowData = data;
    })
  }

  removeUserClick(): void {
    this.closeModal!.nativeElement.click();
    this.courseService.deleteUserFromRoster(this.rowData.classInfo.class_id, this.rowData.user_id).subscribe(()=>{
      this.gridStorageService.emit$(GRID_STORAGE.refresh, true);
    })
  }
  
}
