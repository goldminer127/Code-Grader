import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-modify-roster-button',
  templateUrl: './modify-roster-button.component.html',
  styleUrls: ['./modify-roster-button.component.scss']
})
export class ModifyRosterButtonComponent implements ICellRendererAngularComp {
  agInit(params: ICellRendererParams<any, any>): void {
    //Do something
  }
  refresh(params: ICellRendererParams<any, any>): boolean {return true;}
}
