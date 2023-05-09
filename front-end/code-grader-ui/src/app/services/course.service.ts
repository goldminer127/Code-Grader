import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { BASE_API_URL, PILLS } from '../app.constants';
import { courseMapper } from './mappers/courses.mapper';
import { UserService } from './user.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) { }

  getUser(email:string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/user/${email}`).pipe(
      map((res:any)=> res.message.userInfo)
    )
  }

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

  getPendingCount(classId: string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/class/count/pending/${classId}`).pipe(
      map((resp:any)=> resp.message.result[0]?.user_count ?? 0)
    )
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

  getRosterforClass(classId: string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/class/roster/${classId}`).pipe(
      map((resp:any)=>resp.message.result)
    )
  }

  fetchAllRoles(): Observable<any> {
    return this.http.get(`${BASE_API_URL}/roles`).pipe(
      map((resp:any)=>resp.message.result)
    )
  }


  getSubmissionsForClass(classId: string): Observable<any> {
    return of(
      [
        {
          assignmentName: "Homework 1",
          date: "1/1/2023"
        },
        {
          assignmentName: "Homework 2",
          date: "2/2/2023"
        }
      ]
    )
  }

  changeUserRole(classId: string, userId: string, roleName: string): Observable<any> {
    return this.http.put(`${BASE_API_URL}/roles/change`, {
      classId: classId,
      userId: userId,
      roleName: roleName
    });
  }

  deleteUserFromRoster(classId: string, userId: string) : Observable<any> {
    return this.http.put(`${BASE_API_URL}/roster/delete`, {
      classId: classId,
      userId: userId
    })
  }

  createAssignment(classId: string, assignmentName: string, dueDate: string, description: string): Observable<any> {
    return this.http.put(`${BASE_API_URL}/assignment/create`, {
      classId: classId,
      assignmentName: assignmentName,
      dueDate: dueDate,
      description: description
    }).pipe(
      map((data:any)=> data.message.result.assignment_id)
    )
  }

  getAssignmentsForClass(classId: string) : Observable<any> {
    return this.http.get(`${BASE_API_URL}/assignment/${classId}`).pipe(
      map((data:any)=> data.message.result),
      map((data:any)=> {
        return data.map((x:any)=>{
          return {...x, due_date: moment(x.due_date).format('MMMM Do YYYY, h:mm A'), isoDueDate: x.due_date}
        })
      })
    )
  }

  insertSubmission(classId: string, assignmentId: string, userId: string, submissionDate: string, bucketKeys: string[]): Observable<any> {
    return this.http.put(`${BASE_API_URL}/assignment/submission`, {
      classId: classId, 
      assignmentId: assignmentId,
      userId: userId,
      submissionDate: submissionDate,
      bucketKey: bucketKeys
    })
  }

  getAllSubmissions(userId: string, classId: string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/submissions/${userId}/${classId}`).pipe(
      map((res:any)=> {
        return res.message.result.map((x:any)=>{
          return {...x, submission_date: moment(x.submission_date).format('MMMM Do YYYY, h:mm A'), isoSubmissionDate: x.submission_date}
        })
      })
    )
  }

  getAllClassSubmissions(classId: string) : Observable<any> {
    return this.http.get(`${BASE_API_URL}/submissions/${classId}`).pipe(
      map((res:any)=> {
        return res.message.result.map((x:any)=>{
          return {...x, submitter: `${x.first_name} ${x.last_name}`,submission_date: moment(x.submission_date).format('MMMM Do YYYY, h:mm A'), isoSubmissionDate: x.submission_date}
        })
      })
    )
  }

  getAllUngradedClassSubmissions(classId: string) : Observable<any> {
    return this.http.get(`${BASE_API_URL}/submissions/ungraded/${classId}`).pipe(
      map((res:any)=> {
        return res.message.result.map((x:any)=>{
          return {...x, submitter: `${x.first_name} ${x.last_name}`,submission_date: moment(x.submission_date).format('MMMM Do YYYY, h:mm A'), isoSubmissionDate: x.submission_date}
        })
      })
    )
  }

  gradeAssignment(grade: string, submissionId: string): Observable<any> {
    return this.http.put(`${BASE_API_URL}/assignment/grade`, {
      submissionId: submissionId,
      grade: grade
    })
  }

  commentAssignment(comments: string, submissionId: string): Observable<any> {
    return this.http.put(`${BASE_API_URL}/assignment/comment`, {
      comments: comments,
      submissionId: submissionId
    })
  }
}