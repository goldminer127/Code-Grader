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

  assignmentSubmission(files: any[], classId: string, assignmentName: string, userId: string): Observable<any> {
    //Remove All Files from this assignment
    return this.listFilesForAssignment(classId, userId, assignmentName).pipe(
      switchMap((filesArr: any) => {
        if (filesArr.results.length > 0) {
          console.log(filesArr.results.map((result:any)=> result.key))
          return this.removeFiles(filesArr.results.map((result:any)=> result.key))
          .pipe(
            switchMap(()=>{
              return this.uploadAssignments(files, classId, assignmentName, userId);
            })
          )
        }
        else{
          return this.uploadAssignments(files, classId, assignmentName, userId);
        }
      })
    )
    //Then upload new files
  }

  uploadAssignment(classId: string, userId: string, assignment: string, fileName: string, file: File): Observable<any> {
    //Class ID - Assignment ID + Assignment Name - Student ID - File Name
    return from(Storage.put(`${classId}/${assignment}/${userId}/${fileName}`, file))
  }

  uploadModifiedAssignment(classId: string, userId: string, assignment: string, fileName: string, file: File): Observable<any> {
    //Class ID - Assignment ID + Assignment Name - Student ID - File Name
    return from(Storage.put(`${classId}/${assignment}/${userId}/modified/${fileName}`, file))
  }

  uploadAssignments(files: any[], classId: string, assignmentName: string, userId: string): Observable<any> {
    const uploadedFiles: Observable<any>[] = [];

    Array.from(files).forEach(file => {
      uploadedFiles.push(this.uploadAssignment(classId, userId, assignmentName, file.name, file));
    })

    return combineLatest(uploadedFiles);
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
      switchMap((data: any) => {
        return data.results[0]?.key ? from(Storage.get(data?.results[0]?.key)) : of(false)
      })
    )
  }

  getSyllabus(): void {
    //TODO
  }

  listFilesForAssignment(classId: string, userId: string, assignmentName: string): Observable<any> {
    return from(Storage.list(`${classId}/${assignmentName}/${userId}`));
  }

  listFilesForModifiedAssignment(classId: string, userId: string, assignmentName: string): Observable<any> {
    return from(Storage.list(`${classId}/${assignmentName}/${userId}/modified`));
  }

  fetchFilesForAssignment(fileNames: string[]): Observable<any> {
    const arrayOfFiles: Observable<any>[] = [];

    fileNames?.forEach((fileName: string) => {
      arrayOfFiles.push(from(Storage.get(fileName, { download: true })));
    })

    return combineLatest(arrayOfFiles);
  }

  removeFiles(fileNames: string[]): Observable<any> {
    const removalObservables: Observable<any>[] = [];

    fileNames.forEach((fileName: string) => {
      removalObservables.push(from(Storage.remove(fileName)));
    })

    return combineLatest(removalObservables);
  }

}
