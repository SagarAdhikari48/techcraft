import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthTokens } from '../models/user.model';

@Injectable()
export class AuthRefreshState {
  isRefreshing = false;
  readonly subject = new BehaviorSubject<AuthTokens | null>(null);
}
