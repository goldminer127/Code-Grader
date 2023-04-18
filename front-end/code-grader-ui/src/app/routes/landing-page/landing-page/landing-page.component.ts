import { Component, OnInit } from '@angular/core';
import { combineLatest, forkJoin, mergeMap, Observable, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { APPLICATION_NAME, LANDING_PAGE_STATE } from 'src/app/app.constants';
import { CognitoService } from 'src/app/services/cognito.service';
import { LandingPageStorageService, LANDING_PAGE_STORAGE } from 'src/app/services/landing-page.service';
import { S3StorageService } from 'src/app/services/s3-storage.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  currentState: LANDING_PAGE_STATE | undefined;
  appname = APPLICATION_NAME;
  filesFromS3: string[] = [];
  code: string;
  filesToUpload: FileList | null = null;

  display = false;

  constructor(
    private landingPageStorageService: LandingPageStorageService,
    private cognitoService: CognitoService,
    private s3StorageService: S3StorageService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.currentState = LANDING_PAGE_STATE.DEFAULT;

    this.cognitoService.isAuthenticated().subscribe((success: boolean )=> {
      if(success){
        this.landingPageStorageService.set$(
          LANDING_PAGE_STORAGE.currentState,
          LANDING_PAGE_STATE.HOME
        );
        
        this.router.navigate(['/home']);
      }else{
        this.display = true;
      }
    })

    this.landingPageStorageService.listen$(
      LANDING_PAGE_STORAGE.currentState
    ).subscribe((state: LANDING_PAGE_STATE) => {
      this.currentState = state;
    })
  }

  onSignUpClick(): void {
    this.landingPageStorageService.set$(
      LANDING_PAGE_STORAGE.currentState,
      LANDING_PAGE_STATE.SIGN_UP
    )
  }

  handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    this.filesToUpload = files;
    console.log("files ", this.filesToUpload)

  }

  onSubmitFiles(): void {
    console.log("files to up load ", this.filesToUpload)
    const uploadedFilesReceipt : Observable<any>[] = [];

    // this.filesToUpload.forEach((file)=>{})
    Array.from(this.filesToUpload).forEach(file => {
      uploadedFilesReceipt.push(this.s3StorageService.uploadAssignments('CSI-404','Cheung Matthew', 'Assignment 1 - Testing', file.name, file));
    });

    combineLatest(uploadedFilesReceipt).subscribe((files)=>{
      console.log("x ", files)
    },
    err => {
      console.log("err ", err)
    }
    )
  }

  listFiles(): void {
    this.s3StorageService.listFilesForAssignment('CSI-404', 'Cheung Matthew', 'Assignment 2 - Testing').subscribe((x)=>{
      this.filesFromS3 = x.results;
      console.log(this.filesFromS3)
    })
  }

  getFiles(): void {
    const x = this.filesFromS3.map((x: any)=>x.key);
    console.log("get files ", this.filesFromS3)
    this.s3StorageService.fetchFilesForAssignment(x).pipe(
      switchMap((x)=> {
        const y = x.map((i: any) => i.Body.text());

        return forkJoin(y)
      })
    ).subscribe((z : any)=> {
      console.log("z ", z)
      this.code = z[0]
    })
  }

  removeFiles(): void {
    const x = this.filesFromS3.map((i: any) => i.key);
    combineLatest(this.s3StorageService.removeFiles(x)).subscribe((x)=>console.log("remove ", x))
  }

}
