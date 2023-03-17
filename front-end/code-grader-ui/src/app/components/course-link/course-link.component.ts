import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-course-link',
  templateUrl: './course-link.component.html',
  styleUrls: ['./course-link.component.scss']
})
export class CourseLinkComponent implements ICellRendererAngularComp {
  cellData: any;
  routerLink : string | undefined;

  agInit(params: ICellRendererParams<any, any>): void {
    // throw new Error('Method not implemented.');
    this.cellData = params.data;
    this.routerLink = `class/${params.data.classId}`;
    console.log(params)
  }
  refresh(params: ICellRendererParams<any, any>): boolean {
    // throw new Error('Method not implemented.');
    return true;
  }

}
