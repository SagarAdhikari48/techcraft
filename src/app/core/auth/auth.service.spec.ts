import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { MockAuthService } from '../../../mock-api/mock-auth.service';
import { AuthTokens, User } from '../models/user.model';

const mockUser: User = {
  id: 'usr-001',
  name: 'Alex Turner',
  email: 'sales@techcraft.dev',
  role: 'SALES',
};

const mockTokens: AuthTokens = {
  accessToken: 'mock-access.abc.sig',
  refreshToken: 'mock-refresh.abc.sig',
  expiresIn: 900,
};

const mockAuthStub = {
  login: vi.fn(),
  refresh: vi.fn(),
};

const routerStub = {
  navigate: vi.fn(),
};

function createService(): AuthService {
  TestBed.configureTestingModule({
    providers: [
      AuthService,
      { provide: MockAuthService, useValue: mockAuthStub },
      { provide: Router, useValue: routerStub },
    ],
  });
  return TestBed.inject(AuthService);
}

describe('AuthService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  afterEach(() => sessionStorage.clear());

  it('should create', () => {
    expect(createService()).toBeTruthy();
  });

  it('should start unauthenticated when sessionStorage is empty', () => {
    const service = createService();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.role()).toBeNull();
  });

  describe('login()', () => {
    it('should set authenticated state on successful login', async () => {
      mockAuthStub.login.mockReturnValue(of({ user: mockUser, tokens: mockTokens }));
      const service = createService();

      await firstValueFrom(service.login('sales@techcraft.dev', 'password'));

      expect(service.isAuthenticated()).toBe(true);
      expect(service.user()).toEqual(mockUser);
      expect(service.role()).toBe('SALES');
      expect(service.getAccessToken()).toBe(mockTokens.accessToken);
    });

    it('should persist session to sessionStorage on successful login', async () => {
      mockAuthStub.login.mockReturnValue(of({ user: mockUser, tokens: mockTokens }));
      const service = createService();

      await firstValueFrom(service.login('sales@techcraft.dev', 'password'));

      const storedUser = JSON.parse(sessionStorage.getItem('tc_user')!);
      const storedTokens = JSON.parse(sessionStorage.getItem('tc_tokens')!);
      expect(storedUser.id).toBe(mockUser.id);
      expect(storedTokens.accessToken).toBe(mockTokens.accessToken);
    });

    it('should propagate error and stay unauthenticated on failed login', async () => {
      mockAuthStub.login.mockReturnValue(
        throwError(() => ({ status: 401, message: 'Invalid email or password' }))
      );
      const service = createService();

      await expect(
        firstValueFrom(service.login('bad@email.com', 'wrong'))
      ).rejects.toMatchObject({ status: 401 });

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('logout()', () => {
    it('should clear state, sessionStorage and redirect to login', async () => {
      mockAuthStub.login.mockReturnValue(of({ user: mockUser, tokens: mockTokens }));
      const service = createService();

      await firstValueFrom(service.login('sales@techcraft.dev', 'password'));
      service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.user()).toBeNull();
      expect(sessionStorage.getItem('tc_user')).toBeNull();
      expect(sessionStorage.getItem('tc_tokens')).toBeNull();
      expect(routerStub.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('refresh()', () => {
    it('should update access token in state on successful refresh', async () => {
      mockAuthStub.login.mockReturnValue(of({ user: mockUser, tokens: mockTokens }));
      const refreshedTokens: AuthTokens = {
        accessToken: 'mock-access.new.sig',
        refreshToken: 'mock-refresh.new.sig',
        expiresIn: 900,
      };
      mockAuthStub.refresh.mockReturnValue(of(refreshedTokens));
      const service = createService();

      await firstValueFrom(service.login('sales@techcraft.dev', 'password'));
      await firstValueFrom(service.refresh('mock-refresh.abc.sig'));

      expect(service.getAccessToken()).toBe(refreshedTokens.accessToken);
    });
  });

  describe('hasRole()', () => {
    it('should return true for matching role and false for others', async () => {
      mockAuthStub.login.mockReturnValue(of({ user: mockUser, tokens: mockTokens }));
      const service = createService();

      await firstValueFrom(service.login('sales@techcraft.dev', 'password'));

      expect(service.hasRole('SALES')).toBe(true);
      expect(service.hasRole('ADMIN')).toBe(false);
      expect(service.hasRole('REVIEWER')).toBe(false);
    });
  });

  describe('session restore', () => {
    it('should restore authenticated state from sessionStorage on init', () => {
      sessionStorage.setItem('tc_user', JSON.stringify(mockUser));
      sessionStorage.setItem('tc_tokens', JSON.stringify(mockTokens));

      const service = createService();
      expect(service.isAuthenticated()).toBe(true);
      expect(service.user()?.id).toBe(mockUser.id);
      expect(service.role()).toBe('SALES');
    });
  });
});
