import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { LoadingService } from "../loading/loading.service";
import { MessagesService } from "../messages/messages.service";
import { Course, sortCoursesBySeqNo } from "../model/course";

@Injectable({
    providedIn: 'root'
})
export class CoursesStore {

    private subject = new BehaviorSubject<Course[]>([]);

    courses$ = this.subject.asObservable();

    constructor(
        private http: HttpClient,
        private loading: LoadingService,
        private message: MessagesService
    ){
        this.loadAllCourses();
    };
    
    private loadAllCourses() {
        const loadCourses$ = this.http.get<Course[]>('/api/courses').pipe(
            map(res => res['payload']),
            catchError(err => {
                const message = 'Could not load courses'
                this.message.showErrors(message);
                console.log(message, err);
                return throwError(err);
            }),
            tap(courses => this.subject.next(courses))
        );

        this.loading.showLoadingUntilCompleted(loadCourses$).subscribe();
    }

    filterByCategory(category: string): Observable<Course[]> {
        return this.courses$.pipe(
            map(courses => 
                courses.filter(course => course.category == category)
                    .sort(sortCoursesBySeqNo)
            )
        );
    }
}