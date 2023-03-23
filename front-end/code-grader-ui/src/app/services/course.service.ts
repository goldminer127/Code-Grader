import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { BASE_API_URL, PILLS } from '../app.constants';
import { courseMapper } from './mappers/courses.mapper';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) { }

  getAllCourses(userId: string, activePill: string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/class/all/${userId}`).pipe(
      map((data: any) => {
        const results = activePill === PILLS.ALL ? data.message.instructorClasses.concat(data.message.graderClasses, data.message.studentClasses)
          : activePill === PILLS.GRADER ? data.message.graderClasses
            : activePill === PILLS.INSTRUCTOR ? data.message.instructorClasses
              : data.message.studentClasses
        return courseMapper(results);
      })
    );
  }

  getNumberOfStudentsForCourse(classId: string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/class/count/students/${classId}`).pipe(
      map((resp:any)=> resp.message.result[0]["user_count"])
    );
  }

  getGradersForCourse(classId: string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/class/graders/${classId}`).pipe(
      map((data:any)=>data.message.result)
    );
  }

  getInstructorForCourse(classId: string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/class/instructor/${classId}`).pipe(
      map((data:any)=>data.message.result)
    );
  }

  getUserRoleForCourse(userId: string, classId: string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/role/${userId}/${classId}`).pipe(
      map((data: any)=> data.message)
    )
  }

  checkUserBelongsToCourse(userEmail: string, classId: string): Observable<boolean | string> {
    return this.userService.getUserInfo(userEmail).pipe(
      switchMap((userData:any)=> {
        return this.http.get(`${BASE_API_URL}/role/${userData.message.userInfo.user_id}/${classId}`).pipe(
          map((resp:any)=> resp.message?.result ? resp.message.result['role_name'] : false)
        )
      })
    )
  }

  checkInviteCode(inviteCode: string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/classInfo/invite/${inviteCode}`).pipe(
      map((resp:any)=>resp.message.result)
    )
  }

  checkUserPartOfClass(userId: string, inviteCode: string): Observable<boolean> {
    return this.http.get(`${BASE_API_URL}/user/${userId}/invite/${inviteCode}`).pipe(
      map((resp:any)=>Number(resp.message[0]['user_count']) > 0)
    )
  }

  requestToJoinClass(userId: string, inviteCode: string): Observable<any> {
    return this.http.put(`${BASE_API_URL}/request/class`,{
      userId: userId,
      inviteCode: inviteCode
    });
  }

  createClass(userId: string, className: string): Observable<any> {
    return this.http.put(`${BASE_API_URL}/class`, {
      userId: userId,
      className: className
    })
  }

  getClassFromClassId(classId:string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/class/${classId}`).pipe(
      map((resp:any)=>resp.message.result[0])
    );
  }
}
