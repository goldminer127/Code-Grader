import { Component, OnInit } from '@angular/core';
import { DarkModeService } from 'angular-dark-mode';
import { switchMap, from, combineLatest, Observable, map, tap, of } from 'rxjs';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';
import { S3StorageService } from 'src/app/services/s3-storage.service';
import { LanguageExtMap } from 'src/app/languageExtMap';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { USER_STORAGE, UserStorageService } from 'src/app/services/user-storage.service';

@Component({
  selector: 'app-submission-view',
  templateUrl: './submission-view.component.html',
  styleUrls: ['./submission-view.component.scss']
})
export class SubmissionViewComponent implements OnInit {

  options = {
    theme: 'vs-dark',
    readOnly: true
  };

  originalModel: DiffEditorModel = {
    code: '',
    language: ''
  };

  modifiedModel: DiffEditorModel = {
    code: '',
    language: ''
  };

  rowData: any;
  fileNames: any[] = [];
  files: any[];
  modifiedFiles: any[];
  selectedFile: any;
  userRole: any;
  modifiedContent: any;
  bucketKeys: string[];
  modifiedButtonLoading = false;

  modifiedFileNames: any[] = [];

  constructor(
    private gridStorageService: GridStorageService,
    private s3Service: S3StorageService,
    private darkModeService: DarkModeService,
    private userStorageService: UserStorageService
  ) { }

  ngOnInit(): void {
    this.darkModeService.darkMode$.subscribe((val: boolean) => {
      this.options = { ...this.options, theme: (val ? 'vs-dark' : 'vs') }
    })

    this.userStorageService.get$(USER_STORAGE.USER).subscribe((user: any) => {
      this.userRole = user.userRole;
    })

    this.gridStorageService.get$(GRID_STORAGE.selectedRowData).pipe(
      switchMap((rowData: any) => {
        this.rowData = rowData;
        this.bucketKeys = rowData.bucket_key;
        return this.s3Service.fetchFilesForAssignment(rowData.bucket_key)
      }),
      switchMap((x: any) => {
        const arr: Observable<any>[] = [];
        x.forEach((y: any, index: number) => {
          arr.push(from(y.Body.text()));
          this.fileNames.push(this.getFileName(this.rowData.bucket_key[index]));
        })

        return combineLatest(arr);
      }),
      map((fileText: string[]) => {
        const x = fileText.map((text: string, index: number) => {
          return {
            text: text,
            fileName: this.fileNames[index]
          }
        })

        return x;
      }),
      tap((res: any) => {
        this.files = res;
        this.selectedFile = res[0].fileName;
        this.originalModel = { ...this.originalModel, code: res[0].text, language: this.getLanguageFromFileExtension() }
      }),
      switchMap(() => {
        return this.s3Service.listFilesForModifiedAssignment(
          this.rowData.classInfo.class_id,
          `${this.rowData.user_id}`,
          `${this.rowData.assignment_id} - ${this.rowData.assignment_name}`
        ).pipe(
          map((res: any) => {
            return res.results.map((file: any) => file.key);
          }),
          switchMap((files: any) => {
            if(files.length > 0 ){
              files.forEach((file:any)=>{
                this.modifiedFileNames.push(this.getFileName(file));
              })
              return this.s3Service.fetchFilesForAssignment(files)
            }else{
              return of([]);
            }
          }),
          switchMap((x: any) => {
            if(x.length > 0 ){
              const arr: Observable<any>[] = [];
              x.forEach((y: any, index: number) => {
                arr.push(from(y.Body.text()));
                this.fileNames.push(this.getFileName(this.rowData.bucket_key[index]));
              })
  
              return combineLatest(arr);
            }else{
              return of([])
            }

          }),
          map((fileText: string[]) => {
            if(fileText.length > 0){
              const x = fileText.map((text: string, index: number) => {
                return {
                  text: text,
                  fileName: this.modifiedFileNames[index]
                }
              })
      
              return x;
            }else{
              return [];
            }

          }),
          tap((res: any) => {
            this.modifiedFiles = res;

            const matchingFile = res.find((file:any)=> file.fileName === this.selectedFile);

            if(matchingFile){
              this.modifiedModel = {...this.modifiedModel, code: res[0].text, language: this.getLanguageFromFileExtension()}
            }else{
              this.modifiedModel = {...this.modifiedModel, code: this.files[0].text, language: this.getLanguageFromFileExtension()}
            }
          })
        )
      }),
    ).subscribe()

  }

  getFileName(bucketKey: string): string {
    const x = bucketKey.split("/");
    return x[x.length - 1];
  }

  backToSubmission(): void {
    this.gridStorageService.emit$(GRID_STORAGE.viewSubmission, false);
  }

  changeFileClick(): void {
    this.modifiedContent = undefined;
    const lang = this.getLanguageFromFileExtension();
    this.originalModel = { ...this.originalModel, code: this.files.find((file: any) => file.fileName === this.selectedFile).text, language: lang.toString().toLowerCase() }
    
    const matchingFile = this.modifiedFiles.find((file:any)=> file.fileName === this.selectedFile);

    if(matchingFile){
      this.modifiedModel = {...this.modifiedModel, code: matchingFile.text, language: this.getLanguageFromFileExtension()}
    }else{
      this.modifiedModel = {...this.modifiedModel, code: this.files.find((file: any) => file.fileName === this.selectedFile).text, language: lang.toString().toLowerCase()}
    }
  }

  getLanguageFromFileExtension(): string {
    const ext = this.selectedFile.split(".");
    return LanguageExtMap[`.${ext[ext.length - 1]}` as keyof Object].toString().toLowerCase();
  }

  //Class id / assignment id - assignment name/ user id / filename
  addModifiedToFilename(path: string): string {
    // Extract the path components by splitting the string using the '/' delimiter
    const pathComponents = path.split('/');

    // Get the last component, which is the file name
    const fileName = pathComponents[pathComponents.length - 1];

    // Separate the file name and its extension
    const fileParts = fileName.split('.');
    const fileBaseName = fileParts[0];
    const fileExtension = fileParts[1];

    // Add 'modified' to the file name
    const newFileName = `modified/${fileBaseName}.${fileExtension}`;

    // Replace the old file name with the new one in the path components array
    pathComponents[pathComponents.length - 1] = newFileName;

    // Join the path components back together using the '/' delimiter
    const newPath = pathComponents.join('/');

    return newPath;
  }

}