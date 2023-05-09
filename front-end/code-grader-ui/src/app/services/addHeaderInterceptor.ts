import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
} from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { Injectable } from '@angular/core';
import { CognitoService } from './cognito.service';

@Injectable()
export class AddHeaderInterceptor implements HttpInterceptor {

    constructor(
        private cognitoService: CognitoService
    ){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Clone the request to add the new header
        return this.cognitoService.getIdToken().pipe(
            switchMap((idToken:any)=>{
                const clonedRequest = req.clone({ headers: req.headers.append('Authorization', idToken) });
                return next.handle(clonedRequest)
            })
        )
    }
}