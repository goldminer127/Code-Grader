import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CourseService } from 'src/app/services/course.service';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';

@Component({
  selector: 'app-modify-roster',
  templateUrl: './modify-roster.component.html',
  styleUrls: ['./modify-roster.component.scss']
})
export class ModifyRosterComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef | undefined;
  isLoading = false;
  roles: any[] | undefined;
  user: any;
  changeRoleSuccess: boolean = false;

  selectedRole : any;

  constructor(
    private gridStorageService: GridStorageService,
    private courseService: CourseService
  ){}


  ngOnInit(): void {
    this.gridStorageService.get$(GRID_STORAGE.selectedRowData).subscribe((data:any)=>{
      this.user = data;
    })

    this.courseService.fetchAllRoles().subscribe((roles: any[])=>{
      this.roles = roles.filter(role => role.role_name !== 'instructor');
    })
  }

  selected():void {
    console.log(this.selectedRole)
  }

  closeModalClick(): void {
    this.closeModal!.nativeElement.click();
  }

  buttonDisabled(): boolean {
    return this.user?.role_name && this.selectedRole ? this.user.role_name === this.selectedRole : true;
  }
  
  changeRoleClick(): void {
    this.isLoading = true;
    this.closeModalClick();
    this.courseService.changeUserRole(this.user.classInfo.class_id,this.user.user_id, this.selectedRole).subscribe(()=>{
      this.isLoading = false;
      this.gridStorageService.emit$(GRID_STORAGE.refresh, true);
    })
  }
}
