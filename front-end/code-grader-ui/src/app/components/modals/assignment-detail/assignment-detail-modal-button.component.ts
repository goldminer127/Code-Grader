import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-assignment-detail-modal-button',
  templateUrl: './assignment-detail-modal-button.component.html',
  styleUrls: ['./assignment-detail-modal-button.component.scss']
})
export class AssignmentDetailModalButtonComponent implements ICellRendererAngularComp {
  agInit(params: ICellRendererParams<any, any>): void {}
  refresh(params: ICellRendererParams<any, any>): boolean { return true }

}
