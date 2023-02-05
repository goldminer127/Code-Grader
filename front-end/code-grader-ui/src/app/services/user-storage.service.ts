import { Injectable } from '@angular/core';
import { IUser } from '../app.model';
import { StorageService } from './storage.service';

export enum USER_STORAGE {
  USER = 'user'
}

@Injectable({ providedIn: 'root' })
export class UserStorageService extends StorageService<USER_STORAGE> {
  protected storage = {} as UserStorage
}

interface UserStorage {
  [USER_STORAGE.USER]: IUser
}
