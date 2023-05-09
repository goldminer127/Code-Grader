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

@Injectable()
export class AddHeaderInterceptor {

    constructor(
        private cognitoService: CognitoService,
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Clone the request to add the new header

        if(req.body?.skip) return next.handle(req);
        return this.cognitoService.getIdToken().pipe(
            switchMap((idToken: any) => {
                const clonedRequest = req.clone({ headers: req.headers.append('Authorization', idToken) });
                return next.handle(clonedRequest);
            })
        )
    }
}