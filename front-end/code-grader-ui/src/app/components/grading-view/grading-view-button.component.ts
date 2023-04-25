import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';

@Component({
  selector: 'app-grading-view-button',
  templateUrl: './grading-view-button.component.html',
  styleUrls: ['./grading-view-button.component.scss']
})
export class GradingViewButtonComponent implements ICellRendererAngularComp {

  constructor(
    private gridStorageService: GridStorageService
  ){}

  agInit(params: ICellRendererParams<any, any>): void {
    
  }
  refresh(params: ICellRendererParams<any, any>): boolean {
    return true;
  }

  viewGrading(): void {
    this.gridStorageService.emit$(GRID_STORAGE.viewGrading, true);
  }
}
