import { Injectable } from '@angular/core';
import { Amplify, Storage } from 'aws-amplify';
import { combineLatest, from, Observable, of, switchMap } from 'rxjs';
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

  uploadAssignments(classId: string, name: string, assignment: string, fileName: string, file: File): Observable<any> {
    //Class ID - Assignment ID + Assignment Name - Student Name - File Name
    return from(Storage.put(`${classId}/${assignment}/${name}/${fileName}`, file))
  }

  uploadRubric(classId: string, file: File, assignment: string, fileName: string): Observable<any> {
    //Class ID - Assignment ID + Assignment Name - Rubric - File Name
    return from(Storage.put(`${classId}/${assignment}/Rubric/${fileName}`, file));
  }

  uploadSyllabus(classId: string, file: File, fileName: string): Observable<any> {
    return from(Storage.put(`${classId}/Syllabus/${fileName}`, file));
  }

  getRubric(classId: string, assignment: string): Observable<any> {
    //Class ID - Assignment ID + Assignment Name - Rubric - File Name
    return from(Storage.list(`${classId}/${assignment}/Rubric`)).pipe(
      switchMap((data:any)=>{
        return data.results[0]?.key ? from(Storage.get(data?.results[0]?.key)) : of(false)
      })
    )
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
