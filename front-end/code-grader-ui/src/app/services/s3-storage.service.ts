import { Injectable } from '@angular/core';
import { Amplify, Storage } from 'aws-amplify';
import { combineLatest, forkJoin, from, map, mergeMap, Observable } from 'rxjs';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class S3StorageService {

  constructor() {
    Amplify.configure({
      Auth: environment.auth,
      Storage: environment.storage,
    });
  }

  uploadAssignments(className: string, name: string, assignmentName: string, fileName: string, file: File): Observable<any> {
    //Class Name - Student Name - Assignment Name - File Name
    return from(Storage.put(`${className}/${name}/${assignmentName}/${fileName}`, file))
  }

  uploadSyllabus(className: string, name: string, fileName: string, file: File): Observable<any> {
    return from(Storage.put(`${className}/${name}/Syllabus/${fileName}`, file));
  }

  getSyllabus(): void {
    //TODO
  }

  listFilesForAssignment(className: string, name: string, assignmentName: string): Observable<any> {
    return from(Storage.list(`${className}/${name}/${assignmentName}`));
  }

  fetchFilesForAssignment(fileNames: string[]): Observable<any> {
    const arrayOfFiles : Observable<any>[] = [];
    
    fileNames.forEach((fileName : string)=> {
      arrayOfFiles.push(from(Storage.get(fileName, {download: true})));
    })

    return combineLatest(arrayOfFiles);
  }

  removeFiles(fileNames: string[]): Observable<any>[] {
    const removalObservables : Observable<any>[] = [];

    fileNames.forEach((fileName : string)=> {
      removalObservables.push(from(Storage.remove(fileName)));
    })

    return removalObservables;
  }

}
