import { Component, OnInit } from '@angular/core';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';

@Component({
  selector: 'app-view-feedback-modal',
  templateUrl: './view-feedback-modal.component.html',
  styleUrls: ['./view-feedback-modal.component.scss']
})
export class ViewFeedbackModalComponent implements OnInit {

  rowData:any;
  comments: any;
  isLoading = false;

  constructor(
    private gridStorageService: GridStorageService
  ){}

  ngOnInit(): void {
    this.gridStorageService.get$(GRID_STORAGE.selectedRowData).subscribe((rowData:any)=>{
      this.rowData = rowData;
      this.comments = rowData.comments ?? 'N/A';
    })
  }

}
