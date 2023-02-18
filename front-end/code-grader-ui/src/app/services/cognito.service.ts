import { Injectable } from '@angular/core';
import { Amplify, Auth } from 'aws-amplify';
import { BehaviorSubject, from, Observable } from 'rxjs';

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

  //TODO convert to observable
  public signIn(user: IUser): Promise<any> {
    return Auth.signIn(user.email, user.password)
      .then(() => {
        this.authenticationSubject.next(true);
      });
  }

  public resendCode(email: string): Observable<any> {
    return from(Auth.resendSignUp(email));
  }

  //TODO convert to observable
  public signOut(): Promise<any> {
    return Auth.signOut()
      .then(() => {
        this.authenticationSubject.next(false);
      });
  }

  //TODO convert to observable
  public isAuthenticated(): Promise<boolean> {
    if (this.authenticationSubject.value) {
      return Promise.resolve(true);
    } else {
      return this.getUser()
        .then((user: any) => {
          if (user) {
            return true;
          } else {
            return false;
          }
        }).catch(() => {
          return false;
        });
    }
  }

  //TODO convert to observable
  public getUser(): Promise<any> {
    return Auth.currentUserInfo();
  }

  //TODO convert to observable
  public updateUser(user: IUser): Promise<any> {
    return Auth.currentUserPoolUser()
      .then((cognitoUser: any) => {
        return Auth.updateUserAttributes(cognitoUser, user);
      });
  }

}