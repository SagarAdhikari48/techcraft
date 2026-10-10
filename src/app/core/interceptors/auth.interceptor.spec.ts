import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../auth/auth.service';
import { AuthRefreshState } from './auth-refresh-state.service';
import { AuthTokens } from '../models/user.model';

const ACCESS_TOKEN = 'mock-access.test.sig';
const REFRESH_TOKEN = 'mock-refresh.test.sig';
const NEW_ACCESS_TOKEN = 'mock-access.refreshed.sig';
const NEW_REFRESH_TOKEN = 'mock-refresh.refreshed.sig';

const refreshedTokens: AuthTokens = {
  accessToken: NEW_ACCESS_TOKEN,
  refreshToken: NEW_REFRESH_TOKEN,
  expiresIn: 900,
};

function buildAuthStub(overrides: Partial<{
  accessToken: string | null;
  refreshToken: string | null;
  refreshResult: AuthTokens | 'error';
}> = {}) {
  const opts = {
    accessToken: ACCESS_TOKEN,
    refreshToken: REFRESH_TOKEN,
    refreshResult: refreshedTokens as AuthTokens | 'error',
    ...overrides,
  };

  return {
    getAccessToken: vi.fn().mockReturnValue(opts.accessToken),
    getRefreshToken: vi.fn().mockReturnValue(opts.refreshToken),
    refresh: vi.fn().mockReturnValue(
      opts.refreshResult === 'error'
        ? throwError(() => ({ status: 401 }))
        : of(opts.refreshResult)
    ),
    logout: vi.fn(),
  };
}

function setup(authStub: ReturnType<typeof buildAuthStub>) {
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: authStub },
      AuthRefreshState,
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
    ],
  });

  return {
    http: TestBed.inject(HttpClient),
    controller: TestBed.inject(HttpTestingController),
  };
}

describe('authInterceptor', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    TestBed.resetTestingModule();
  });

  describe('token attachment', () => {
    it('should attach Authorization header when access token exists', () => {
      const stub = buildAuthStub();
      const { http, controller } = setup(stub);

      http.get('/api/test').subscribe();

      const req = controller.expectOne('/api/test');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${ACCESS_TOKEN}`);
      req.flush({});
    });

    it('should not attach Authorization header when no access token', () => {
      const stub = buildAuthStub({ accessToken: null });
      const { http, controller } = setup(stub);

      http.get('/api/test').subscribe();

      const req = controller.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('401 handling — successful refresh', () => {
    it('should retry original request with new token after successful refresh', () => {
      const stub = buildAuthStub();
      const { http, controller } = setup(stub);

      let responseData: unknown;
      http.get('/api/data').subscribe((res) => (responseData = res));

      const req1 = controller.expectOne('/api/data');
      expect(req1.request.headers.get('Authorization')).toBe(`Bearer ${ACCESS_TOKEN}`);

      req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      const req2 = controller.expectOne('/api/data');
      expect(req2.request.headers.get('Authorization')).toBe(`Bearer ${NEW_ACCESS_TOKEN}`);
      req2.flush({ ok: true });

      expect(responseData).toEqual({ ok: true });
      expect(stub.refresh).toHaveBeenCalledWith(REFRESH_TOKEN);
    });

    it('should only trigger a single refresh for a 401 response', () => {
      const stub = buildAuthStub();
      const { http, controller } = setup(stub);

      http.get('/api/a').subscribe();

      const reqA = controller.expectOne('/api/a');
      reqA.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      const retryA = controller.expectOne('/api/a');
      retryA.flush({ from: 'a' });

      expect(stub.refresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('401 handling — refresh failures', () => {
    it('should call logout when refresh token is missing', () => {
      const stub = buildAuthStub({ refreshToken: null });
      const { http, controller } = setup(stub);

      let errorCaught = false;
      http.get('/api/secure').subscribe({ error: () => (errorCaught = true) });

      const req = controller.expectOne('/api/secure');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(stub.logout).toHaveBeenCalled();
      expect(errorCaught).toBe(true);
    });

    it('should call logout and propagate error when refresh request fails', () => {
      const stub = buildAuthStub({ refreshResult: 'error' });
      const { http, controller } = setup(stub);

      let errorCaught = false;
      http.get('/api/secure').subscribe({ error: () => (errorCaught = true) });

      const req = controller.expectOne('/api/secure');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(stub.logout).toHaveBeenCalled();
      expect(errorCaught).toBe(true);
    });
  });

  describe('non-401 errors', () => {
    it('should pass through non-401 errors without triggering refresh', () => {
      const stub = buildAuthStub();
      const { http, controller } = setup(stub);

      let errorStatus = 0;
      http.get('/api/data').subscribe({ error: (e) => (errorStatus = e.status) });

      const req = controller.expectOne('/api/data');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      expect(stub.refresh).not.toHaveBeenCalled();
      expect(stub.logout).not.toHaveBeenCalled();
      expect(errorStatus).toBe(500);
    });

    it('should pass through 403 errors without triggering refresh', () => {
      const stub = buildAuthStub();
      const { http, controller } = setup(stub);

      let errorStatus = 0;
      http.get('/api/admin').subscribe({ error: (e) => (errorStatus = e.status) });

      const req = controller.expectOne('/api/admin');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      expect(stub.refresh).not.toHaveBeenCalled();
      expect(errorStatus).toBe(403);
    });
  });
});
