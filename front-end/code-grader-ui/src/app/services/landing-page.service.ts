import { Injectable } from '@angular/core';
import { LANDING_PAGE_STATE } from '../app.constants';
import { StorageService } from './storage.service';

export enum LANDING_PAGE_STORAGE {
    currentState = 'currentState'
}

@Injectable({ providedIn: 'root' })
export class LandingPageStorageService extends StorageService<LANDING_PAGE_STORAGE> {
    protected storage = {} as LandingPageStorage;
}

interface LandingPageStorage {
    [LANDING_PAGE_STORAGE.currentState] : LANDING_PAGE_STATE;
}