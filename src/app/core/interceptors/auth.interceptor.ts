import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError, filter, take, switchMap, catchError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AuthTokens } from '../models/user.model';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<AuthTokens | null>(null);

function addAuthHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService
): Observable<unknown> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    const refreshToken = auth.getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      auth.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return auth.refresh(refreshToken).pipe(
      switchMap((tokens: AuthTokens) => {
        isRefreshing = false;
        refreshSubject.next(tokens);
        return next(addAuthHeader(req, tokens.accessToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        refreshSubject.next(null);
        auth.logout();
        return throwError(() => err);
      })
    );
  }

  return refreshSubject.pipe(
    filter((tokens): tokens is AuthTokens => tokens !== null),
    take(1),
    switchMap((tokens) => next(addAuthHeader(req, tokens.accessToken)))
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  const authReq = token ? addAuthHeader(req, token) : req;

  return next(authReq).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return handle401(req, next, auth);
      }
      return throwError(() => err);
    })
  );
};
