import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';

@Component({
  selector: 'app-view-submission-button',
  templateUrl: './view-submission-button.component.html',
  styleUrls: ['./view-submission-button.component.scss']
})
export class ViewSubmissionButtonComponent implements ICellRendererAngularComp {
  
  constructor(
    private gridStorageService: GridStorageService
  ){}

  agInit(params: ICellRendererParams<any, any>): void {
    //Do something
  }
  refresh(params: ICellRendererParams<any, any>): boolean { return true; }

  viewSubmission(): void {
    this.gridStorageService.emit$(GRID_STORAGE.viewSubmission, true);
  }
}
