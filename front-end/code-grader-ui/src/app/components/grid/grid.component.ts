import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CellClickedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import { DarkModeService } from 'angular-dark-mode';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {

  @Input() columnDefs : ColDef[] | undefined;
  @Input() defaultColDef : ColDef | undefined;
  @Input() rowData$!: Observable<any>;

  @Output() gridReadyEvent = new EventEmitter<any>();
  @Output() cellClickedEvent = new EventEmitter<any>();

  gridTheme  = 'ag-theme-alpine';

  constructor(
    private darkModeService: DarkModeService
  ){}

  ngOnInit(): void {
    this.darkModeService.darkMode$.subscribe((darkMode: boolean)=>{
      this.gridTheme = darkMode ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    })
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridReadyEvent.emit(params);
  }

  onCellClicked(event: CellClickedEvent): void {
    this.cellClickedEvent.emit(event);
  }
}
