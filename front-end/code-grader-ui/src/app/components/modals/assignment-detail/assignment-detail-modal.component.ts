import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { switchMap, tap } from 'rxjs';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';
import { S3StorageService } from 'src/app/services/s3-storage.service';

@Component({
  selector: 'app-assignment-detail-modal',
  templateUrl: './assignment-detail-modal.component.html',
  styleUrls: ['./assignment-detail-modal.component.scss']
})
export class AssignmentDetailModalComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef | undefined;
  @ViewChild('fileInput') fileInput: ElementRef | undefined;

  isLoading = false;
  createSuccess = false;
  rowData: any;
  pastDue: boolean;
  calendarDate: any;
  files: any[];
  rubricExist: boolean = false;
  signedUrl : any;

  constructor(
    private gridStorageService: GridStorageService,
    private s3Service: S3StorageService
  ) { }

  ngOnInit(): void {
    this.gridStorageService.get$(GRID_STORAGE.selectedRowData).pipe(
      tap((rowData: any) => {
        this.rowData = rowData;
        this.calendarDate = moment(rowData.isoDueDate).calendar();
        this.pastDue = moment(rowData.isoDueDate).isBefore();
      }),
      switchMap((rowData: any) => {
        return this.s3Service.getRubric(rowData.class_id, `${rowData.assignment_id} - ${rowData.assignment_name}`)
      })
    )
      .subscribe((x: any) => {
        this.rubricExist = x;
        this.signedUrl = x;
      });
  }

  closeModalClick(): void {
    this.files = undefined;
    this.fileInput && (this.fileInput.nativeElement.value = "");

    this.closeModal!.nativeElement.click();
  }

  onSubmit(): void {

  }

  buttonDisabled(): boolean {
    return false;
  }

  onFileChange(event: any) {
    this.files = event.target.files;
  }

}
