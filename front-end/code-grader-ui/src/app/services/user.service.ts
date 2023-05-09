import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_API_URL } from '../app.constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }

  createUser(firstName: string, lastName: string, email: string): Observable<any> {
    return this.http.put(`${BASE_API_URL}/user`, {
      firstName: firstName,
      lastName: lastName,
      email: email,
      skip: true
    }
    )
  }

  getUserInfo(email: string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/user/${email}`)
  }
}
