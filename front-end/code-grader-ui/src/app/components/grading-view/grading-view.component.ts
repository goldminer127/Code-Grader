import { Component, OnInit } from '@angular/core';
import { DarkModeService } from 'angular-dark-mode';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { Observable, combineLatest, from, map, of, switchMap, tap } from 'rxjs';
import { LanguageExtMap } from 'src/app/languageExtMap';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';
import { S3StorageService } from 'src/app/services/s3-storage.service';
import { USER_STORAGE, UserStorageService } from 'src/app/services/user-storage.service';

@Component({
  selector: 'app-grading-view',
  templateUrl: './grading-view.component.html',
  styleUrls: ['./grading-view.component.scss']
})
export class GradingViewComponent implements OnInit {

  options = {
    theme: 'vs-dark'
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
  disableSelect = false;

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
          switchMap((files: any) => { //Keys here
            if (files.length > 0) {
              files.forEach((file:any)=>{
                this.modifiedFileNames.push(this.getFileName(file));
              })
              return this.s3Service.fetchFilesForAssignment(files)
            } else {
              return of([]);
            }
          }),
          switchMap((x: any) => {
            if (x.length > 0) {
              const arr: Observable<any>[] = [];
              x.forEach((y: any, index: number) => {
                arr.push(from(y.Body.text()));
                this.fileNames.push(this.getFileName(this.rowData.bucket_key[index]));
              })

              return combineLatest(arr);
            } else {
              return of([])
            }

          }),
          map((fileText: string[]) => {
            if (fileText.length > 0) {
              const x = fileText.map((text: string, index: number) => {
                return {
                  text: text,
                  fileName: this.modifiedFileNames[index]
                }
              })

              return x;
            } else {
              return [];
            }

          }),
          tap((res: any) => {
            this.modifiedFiles = res;

            const matchingFile = res.find((file: any) => file.fileName === this.selectedFile);

            if (matchingFile) {
              this.modifiedModel = { ...this.modifiedModel, code: res[0].text, language: this.getLanguageFromFileExtension() }
            } else {
              this.modifiedModel = { ...this.modifiedModel, code: this.files[0].text, language: this.getLanguageFromFileExtension() }
            }
          })
        )
      }),
    ).subscribe()
  }

  back(): void {
    this.gridStorageService.emit$(GRID_STORAGE.viewGrading, false);
  }

  getFileName(bucketKey: string): string {
    const x = bucketKey.split("/");
    return x[x.length - 1];
  }

  getLanguageFromFileExtension(): string {
    const ext = this.selectedFile.split(".");
    return LanguageExtMap[`.${ext[ext.length - 1]}` as keyof Object].toString().toLowerCase();
  }

  onInitDiffEditor(diffEditor: any) {
    if (!diffEditor) {
      return;
    }

    diffEditor.getModifiedEditor().onDidChangeModelContent(() => {
      const content = diffEditor.getModel().modified.getValue();
      this.modifiedContent = content;
    });
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

  saveModification(): void {
    this.modifiedButtonLoading = true;
    this.disableSelect = true;

    const modifiedFile = this.modifiedFiles.find((file:any)=> file.fileName === this.selectedFile);
    if(modifiedFile){
      modifiedFile.text = this.modifiedContent;
    }else{
      this.modifiedFiles.push({
        fileName: this.selectedFile,
        text: this.modifiedContent
      })
    }

    const originalFile = this.bucketKeys.find((key: any) => {
      const x = key.split("/");
      return x[x.length - 1] === this.selectedFile
    });

    const fileExt = `.${this.getFileName(originalFile).split(".")[1]}`;

    let blob = new Blob([this.modifiedContent], { type: fileExt })
    const file = new File([blob], this.addModifiedToFilename(originalFile));
    this.s3Service.uploadModifiedAssignment(
      this.rowData.classInfo.class_id,
      `${this.rowData.user_id}`,
      `${this.rowData.assignment_id} - ${this.rowData.assignment_name}`,
      this.selectedFile,
      file
    ).subscribe(() => {
      this.modifiedButtonLoading = false;
      this.disableSelect = false;
    })

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
