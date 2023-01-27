import { NgZone, Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export abstract class StorageService<T> {
  protected abstract storage: any;
  private event$ = new ReplaySubject<any>(1);

  constructor(private zone: NgZone) {}

  get$(key: T): Observable<any> {
    return this.event$.pipe(
      filter(event => event.key === key),
      map(() => this.get(key))
    );
  }

  listen$(key: T): Observable<any> {
    // This is a semantic method for event listener
    return this.get$(key);
  }

  set$(key: T, value: unknown): void {
    this.storage[key] = value;

    this.zone.run(() => {
      this.event$.next({ key, value });
    });
  }

  emit$(key: T, value: unknown): void {
    // This is a semantic method for emiting an event
    this.set$(key, value);
  }

  get(key: T): any {
    return this.storage[key];
  }
}