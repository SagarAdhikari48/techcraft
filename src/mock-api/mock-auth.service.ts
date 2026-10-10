import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthTokens, User } from '../app/core/models/user.model';
import { MOCK_CREDENTIALS } from './mock-users';

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

const TOKEN_TTL = 900;

function generateToken(userId: string, role: string, type: 'access' | 'refresh'): string {
  const payload = btoa(JSON.stringify({ sub: userId, role, type, iat: Date.now() }));
  return `mock-${type}.${payload}.signature`;
}

@Injectable({ providedIn: 'root' })
export class MockAuthService {
  login(email: string, password: string): Observable<LoginResponse> {
    const match = MOCK_CREDENTIALS.find(
      (c) => c.email === email && c.password === password
    );

    if (!match) {
      return throwError(() => ({ status: 401, message: 'Invalid email or password' })).pipe(
        delay(400)
      );
    }

    const tokens: AuthTokens = {
      accessToken: generateToken(match.user.id, match.user.role, 'access'),
      refreshToken: generateToken(match.user.id, match.user.role, 'refresh'),
      expiresIn: TOKEN_TTL,
    };

    return of({ user: match.user, tokens }).pipe(delay(500));
  }

  refresh(refreshToken: string): Observable<AuthTokens> {
    const isValid = refreshToken.startsWith('mock-refresh.');

    if (!isValid) {
      return throwError(() => ({ status: 401, message: 'Invalid refresh token' })).pipe(
        delay(200)
      );
    }

    const parts = refreshToken.split('.');
    const payload = JSON.parse(atob(parts[1]));

    const tokens: AuthTokens = {
      accessToken: generateToken(payload.sub, payload.role, 'access'),
      refreshToken: generateToken(payload.sub, payload.role, 'refresh'),
      expiresIn: TOKEN_TTL,
    };

    return of(tokens).pipe(delay(200));
  }
}
