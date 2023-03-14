import { Injectable } from '@angular/core';
import { Amplify, Auth } from 'aws-amplify';
import { BehaviorSubject, catchError, from, map, Observable, of, tap } from 'rxjs';

import { environment } from 'src/environments/environments';
import { IUser } from '../app.model';

@Injectable({
  providedIn: 'root',
})
export class CognitoService {

  private authenticationSubject: BehaviorSubject<any>;

  constructor() {
    Amplify.configure({
      Auth: environment.cognito,
    });

    this.authenticationSubject = new BehaviorSubject<boolean>(false);
  }

  public signUp(user: IUser): Observable<any> {
    return from(Auth.signUp({
      username: user.email,
      password: user.password,
      attributes: {
        given_name: user.firstName,
        family_name: user.lastName,
      }
    }));
  }

  public confirmSignUp(user: IUser, code: string): Observable<any> {
    return from(Auth.confirmSignUp(user.email, code));
  }

  public signIn(email: string, password: string): Observable<any> {
    return from(Auth.signIn(email, password)).pipe(
      tap(()=> {
        this.authenticationSubject.next(true);
      })
    )
  }

  public resendCode(email: string): Observable<any> {
    return from(Auth.resendSignUp(email));
  }

  public signOut(): Observable<any> {
    return from(Auth.signOut()).pipe(
      tap(()=>{
        this.authenticationSubject.next(false);
      })
    )
  }

  public isAuthenticated(): Observable<boolean> {
    if (this.authenticationSubject.value) {
      return of(true);
    } else {
      return this.getUser().pipe(
        map((user: any)=> user ? true : false),
        catchError(()=> of(false))
      )
    }
  }

  public getUser(): Observable<any> {
    return from(Auth.currentUserInfo());
  }

  //TODO convert to observable
  public updateUser(user: IUser): Promise<any> {
    return Auth.currentUserPoolUser()
      .then((cognitoUser: any) => {
        return Auth.updateUserAttributes(cognitoUser, user);
      });
  }

  public forgotPassword(username: string): Observable<any> {
    return from(Auth.forgotPassword(username));
  }

  public forgotPasswordSubmit(username: string, code: string, newPassword: string) : Observable<any> {
    return from(Auth.forgotPasswordSubmit(username, code, newPassword));
  }

}