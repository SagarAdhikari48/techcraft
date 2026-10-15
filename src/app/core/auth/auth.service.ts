import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthTokens, AuthState, User, UserRole } from '../models/user.model';
import { MockAuthService } from '../../../mock-api/mock-auth.service';
import { environment } from '../../../environments/environment';

const STORAGE_KEY_USER   = 'tc_user';
const STORAGE_KEY_TOKENS = 'tc_tokens';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http      = inject(HttpClient);
  private readonly mockAuth  = inject(MockAuthService);
  private readonly router    = inject(Router);

  private readonly _state = signal<AuthState>(this.loadFromStorage());

  readonly user            = computed(() => this._state().user);
  readonly tokens          = computed(() => this._state().tokens);
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly role            = computed(() => this._state().user?.role ?? null);

  login(email: string, password: string): Observable<{ user: User; tokens: AuthTokens }> {
    return this.mockAuth.login(email, password).pipe(
      tap(({ user, tokens }) => this.setSession(user, tokens)),
      catchError((err) => throwError(() => err))
    );
  }

  refresh(refreshToken: string): Observable<AuthTokens> {
    if (environment.production) {
      return this.http.post<AuthTokens>(
        `${environment.apiUrl}/auth/refresh`,
        { refreshToken }
      ).pipe(
        tap((tokens) => {
          const current = this._state();
          if (current.user) this.setSession(current.user, tokens);
        }),
        catchError(() => throwError(() => ({ status: 401, message: 'Invalid refresh token' })))
      );
    }
    return this.mockAuth.refresh(refreshToken).pipe(
      tap((tokens) => {
        const current = this._state();
        if (current.user) this.setSession(current.user, tokens);
      }),
      catchError(() => throwError(() => ({ status: 401, message: 'Invalid refresh token' })))
    );
  }

  logout(): void {
    this._state.set({ user: null, tokens: null, isAuthenticated: false });
    sessionStorage.removeItem(STORAGE_KEY_USER);
    sessionStorage.removeItem(STORAGE_KEY_TOKENS);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return this._state().tokens?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this._state().tokens?.refreshToken ?? null;
  }

  hasRole(role: UserRole): boolean {
    return this._state().user?.role === role;
  }

  private setSession(user: User, tokens: AuthTokens): void {
    this._state.set({ user, tokens, isAuthenticated: true });
    sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    sessionStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(tokens));
  }

  private loadFromStorage(): AuthState {
    try {
      const user   = sessionStorage.getItem(STORAGE_KEY_USER);
      const tokens = sessionStorage.getItem(STORAGE_KEY_TOKENS);
      if (user && tokens) {
        return {
          user:            JSON.parse(user) as User,
          tokens:          JSON.parse(tokens) as AuthTokens,
          isAuthenticated: true,
        };
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY_USER);
      sessionStorage.removeItem(STORAGE_KEY_TOKENS);
    }
    return { user: null, tokens: null, isAuthenticated: false };
  }
}
