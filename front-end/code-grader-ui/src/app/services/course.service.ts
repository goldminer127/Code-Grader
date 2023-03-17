import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BASE_API_URL, PILLS } from '../app.constants';
import { courseMapper } from './mappers/courses.mapper';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(
    private http: HttpClient
  ) { }

  getAllCourses(userId: string, activePill: string): Observable<any> {
    return this.http.get(`${BASE_API_URL}/class/${userId}`).pipe(
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
}
