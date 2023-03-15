import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }

  createUser(firstName : string, lastName : string, email : string): Observable<any> {
    return this.http.put('http://localhost:3000/user', {
      firstName: firstName,
      lastName: lastName,
      email: email
    })
  }

  getUserInfo(email: string): Observable<any> {
    return this.http.get(`http://localhost:3000/user/${email}`);
  }
}
