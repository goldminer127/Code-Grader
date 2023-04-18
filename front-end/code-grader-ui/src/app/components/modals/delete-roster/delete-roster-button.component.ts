import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-delete-roster-button',
  templateUrl: './delete-roster-button.component.html',
  styleUrls: ['./delete-roster-button.component.scss']
})
export class DeleteRosterButtonComponent implements ICellRendererAngularComp {
  agInit(params: ICellRendererParams<any, any>): void {
    //Do something
  }
  refresh(params: ICellRendererParams<any, any>): boolean { return true; }
}
