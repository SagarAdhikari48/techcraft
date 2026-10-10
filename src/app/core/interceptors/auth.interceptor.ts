import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  Observable,
  throwError,
  filter,
  take,
  switchMap,
  catchError,
} from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AuthTokens } from '../models/user.model';
import { AuthRefreshState } from './auth-refresh-state.service';

function addAuthHeader(
  req: HttpRequest<unknown>,
  token: string
): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  state: AuthRefreshState
): Observable<HttpEvent<unknown>> {
  if (!state.isRefreshing) {
    state.isRefreshing = true;
    state.subject.next(null);

    const refreshToken = auth.getRefreshToken();

    if (!refreshToken) {
      state.isRefreshing = false;
      auth.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return auth.refresh(refreshToken).pipe(
      switchMap((tokens: AuthTokens) => {
        state.isRefreshing = false;
        state.subject.next(tokens);
        return next(addAuthHeader(req, tokens.accessToken));
      }),
      catchError((err) => {
        state.isRefreshing = false;
        state.subject.next(null);
        auth.logout();
        return throwError(() => err);
      })
    );
  }

  return state.subject.pipe(
    filter((tokens): tokens is AuthTokens => tokens !== null),
    take(1),
    switchMap((tokens) => next(addAuthHeader(req, tokens.accessToken)))
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const state = inject(AuthRefreshState);
  const token = auth.getAccessToken();

  const authReq = token ? addAuthHeader(req, token) : req;

  return next(authReq).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return handle401(req, next, auth, state);
      }
      return throwError(() => err);
    })
  );
};
