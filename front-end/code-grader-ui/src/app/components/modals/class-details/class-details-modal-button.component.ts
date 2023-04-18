import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-class-details-modal-button',
  templateUrl: './class-details-modal-button.component.html',
  styleUrls: ['./class-details-modal-button.component.scss']
})
export class ClassDetailsModalButtonComponent implements ICellRendererAngularComp {
  agInit(params: ICellRendererParams<any, any>): void {
    //Do something
  }
  refresh(params: ICellRendererParams<any, any>): boolean {return true;}
}
