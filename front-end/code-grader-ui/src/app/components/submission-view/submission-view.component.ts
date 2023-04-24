import { Component, OnInit } from '@angular/core';
import { CodeModel } from '@ngstack/code-editor';
import { DarkModeService } from 'angular-dark-mode';
import { switchMap, from, combineLatest, Observable, map } from 'rxjs';
import { GRID_STORAGE, GridStorageService } from 'src/app/services/grid-storage.service';
import { S3StorageService } from 'src/app/services/s3-storage.service';

@Component({
  selector: 'app-submission-view',
  templateUrl: './submission-view.component.html',
  styleUrls: ['./submission-view.component.scss']
})
export class SubmissionViewComponent implements OnInit {

  theme = 'vs-dark';
  rowData: any;
  fileNames: any[] = [];
  files: any[];
  selectedFile: any;

  codeModel: CodeModel = {
    language: '',
    uri: '',
    value: '',
  };

  options = {
    contextmenu: true,
    minimap: {
      enabled: true,
    },
  };

  constructor(
    private gridStorageService: GridStorageService,
    private s3Service: S3StorageService,
    private darkModeService: DarkModeService
  ) { }

  ngOnInit(): void {
    this.darkModeService.darkMode$.subscribe((val: boolean)=>{
      this.theme = val ? 'vs-dark' : 'vs';
    })

    this.gridStorageService.get$(GRID_STORAGE.selectedRowData).pipe(
      switchMap((rowData: any) => {
        this.rowData = rowData;
        return this.s3Service.fetchFilesForAssignment(rowData.bucket_key)
      }),
      switchMap((x: any) => {
        const arr : Observable<any>[] = [];
        x.forEach((y: any, index: number) => {
          arr.push(from(y.Body.text()));
          this.fileNames.push(this.getFileName(this.rowData.bucket_key[index]));
        })

        return combineLatest(arr);
      }),
      map((fileText: string[])=>{
        const x = fileText.map((text:string, index:number)=>{
          return {
            text: text,
            fileName: this.fileNames[index]
          }
        })

        return x;
      })
    ).subscribe((res: any) => {
      this.files = res;
      this.codeModel = { ...this.codeModel, value: res[0].text, language: '', uri: res[0].fileName }
      this.selectedFile = res[0].fileName;
    })

  }

  onCodeChanged(value: any) {
    console.log('CODE', value);
  }

  getFileName(bucketKey: string): string {
    const x = bucketKey.split("/");
    return x[x.length-1];
  }

  backToSubmission(): void {
    this.gridStorageService.emit$(GRID_STORAGE.viewSubmission, false);
  }

  changeFileClick(): void {
    this.codeModel = {...this.codeModel, value: this.files.find((file:any)=> file.fileName === this.selectedFile).text, uri: this.files.find((file:any)=> file.fileName === this.selectedFile).fileName}
  }
}