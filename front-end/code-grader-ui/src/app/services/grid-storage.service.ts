import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export enum GRID_STORAGE {
    selectedRowData = 'selectedRowData',
    refresh = 'refresh',
    viewSubmission = 'viewSubmission'
}

@Injectable({ providedIn: 'root' })
export class GridStorageService extends StorageService<GRID_STORAGE> {
    protected storage = {} as GridStorage;
}

interface GridStorage {
    [GRID_STORAGE.selectedRowData] : any;
    [GRID_STORAGE.refresh] : any;
    [GRID_STORAGE.viewSubmission]: any;
}