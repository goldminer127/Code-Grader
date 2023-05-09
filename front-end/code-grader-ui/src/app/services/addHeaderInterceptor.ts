import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, switchMap, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { CognitoService } from './cognito.service';
import { Router } from '@angular/router';
import { LANDING_PAGE_STORAGE, LandingPageStorageService } from './landing-page.service';
import { LANDING_PAGE_STATE } from '../app.constants';

@Injectable()
export class AddHeaderInterceptor implements HttpInterceptor {

    constructor(
        private cognitoService: CognitoService,
        private router: Router,
        private landingPageStorageService: LandingPageStorageService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Clone the request to add the new header
        return this.cognitoService.getIdToken().pipe(
            switchMap((idToken: any) => {
                const clonedRequest = req.clone({ headers: req.headers.append('Authorization', idToken) });
                return next.handle(clonedRequest).pipe(
                    catchError((err: any) => {
                        if (err instanceof HttpErrorResponse) {
                            console.log("1 ", err)
                            if (err.status === 401) {
                                console.log("2 ", err)
                                this.cognitoService.signOut();
                                this.landingPageStorageService.set$(LANDING_PAGE_STORAGE.currentState, LANDING_PAGE_STATE.DEFAULT);
                                this.router.navigate([''])
                            }
                        }

                        return new Observable<HttpEvent<any>>();
                    })
                    // tap((res:any) => {
                    //     console.log("res ", res)
                    // },
                    //     (err: any) => {
                    //         console.log("0 ", err)
                    //         if(err instanceof HttpErrorResponse){
                    //             console.log("1 ", err)
                    //             if(err.status === 401){
                    //                 console.log("2 ", err)
                    //                 this.cognitoService.signOut();
                    //                 this.landingPageStorageService.set$(LANDING_PAGE_STORAGE.currentState, LANDING_PAGE_STATE.DEFAULT);
                    //                 this.router.navigate([''])
                    //             }
                    //         }
                    //     }
                    // )
                )
            })
        )
    }
}