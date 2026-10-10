import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../app/core/models/user.model';
import { MOCK_CREDENTIALS } from './mock-users';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  getReviewers(): Observable<User[]> {
    const reviewers = MOCK_CREDENTIALS
      .filter((c) => c.user.role === 'REVIEWER' || c.user.role === 'ADMIN')
      .map((c) => c.user);
    return of(reviewers).pipe(delay(200));
  }

  getAllUsers(): Observable<User[]> {
    return of(MOCK_CREDENTIALS.map((c) => c.user)).pipe(delay(200));
  }
}
