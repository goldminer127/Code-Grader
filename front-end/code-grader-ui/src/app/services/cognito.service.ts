import { Injectable } from '@angular/core';
import { Amplify, Auth } from 'aws-amplify';
import { BehaviorSubject, catchError, from, map, Observable, of, switchMap, tap } from 'rxjs';

import { environment } from 'src/environments/environments';
import { IUser } from '../app.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class CognitoService {

  private authenticationSubject: BehaviorSubject<any>;

  constructor(
    private userService: UserService
  ) {
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
    })).pipe(
      switchMap(()=>{
        return this.userService.createUser(
          user.firstName,
          user.lastName,
          user.email
        )
      })
    )
  }

  public confirmSignUp(user: IUser, code: string): Observable<any> {
    return from(Auth.confirmSignUp(user.email, code));
  }

  public signIn(email: string, password: string): Observable<any> {
    return from(Auth.signIn(email, password)).pipe(
      tap(() => {
        this.authenticationSubject.next(true);
      })
    )
  }

  public resendCode(email: string): Observable<any> {
    return from(Auth.resendSignUp(email));
  }

  public signOut(): Observable<any> {
    return from(Auth.signOut()).pipe(
      tap(() => {
        this.authenticationSubject.next(false);
      })
    )
  }

  public isAuthenticated(): Observable<boolean> {
    return this.getUser().pipe(
      map((user: any) => {
        if(user){
          this.authenticationSubject.next(true);
        }else{
          this.authenticationSubject.next(false);
        }

        return user ? true : false
      }),
      catchError(() => of(false))
    )
  }

  public getUser(): Observable<any> {
    return from(Auth.currentUserInfo()).pipe(
      tap((user:any)=> {
        if(user.attributes){
          this.authenticationSubject.next(true)
        }else{
          this.authenticationSubject.next(false)
        }
      })
    );
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

  public forgotPasswordSubmit(username: string, code: string, newPassword: string): Observable<any> {
    return from(Auth.forgotPasswordSubmit(username, code, newPassword));
  }

}