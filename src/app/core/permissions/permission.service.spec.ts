import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PermissionService } from './permission.service';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../models/user.model';

function createAuthStub(role: UserRole | null) {
  return {
    role: signal<UserRole | null>(role),
  };
}

function createService(role: UserRole | null): PermissionService {
  TestBed.configureTestingModule({
    providers: [
      PermissionService,
      { provide: AuthService, useValue: createAuthStub(role) },
    ],
  });
  return TestBed.inject(PermissionService);
}

describe('PermissionService', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    expect(createService('SALES')).toBeTruthy();
  });

  describe('SALES role', () => {
    it('should allow application:create', () => {
      expect(createService('SALES').can('application:create')).toBe(true);
    });

    it('should allow application:edit', () => {
      expect(createService('SALES').can('application:edit')).toBe(true);
    });

    it('should allow application:view:own', () => {
      expect(createService('SALES').can('application:view:own')).toBe(true);
    });

    it('should deny application:review', () => {
      expect(createService('SALES').can('application:review')).toBe(false);
    });

    it('should deny sensitive:reveal', () => {
      expect(createService('SALES').can('sensitive:reveal')).toBe(false);
    });

    it('should deny admin:access', () => {
      expect(createService('SALES').can('admin:access')).toBe(false);
    });
  });

  describe('REVIEWER role', () => {
    it('should allow application:view:assigned', () => {
      expect(createService('REVIEWER').can('application:view:assigned')).toBe(true);
    });

    it('should allow application:review', () => {
      expect(createService('REVIEWER').can('application:review')).toBe(true);
    });

    it('should allow sensitive:reveal', () => {
      expect(createService('REVIEWER').can('sensitive:reveal')).toBe(true);
    });

    it('should deny application:create', () => {
      expect(createService('REVIEWER').can('application:create')).toBe(false);
    });

    it('should deny admin:access', () => {
      expect(createService('REVIEWER').can('admin:access')).toBe(false);
    });
  });

  describe('ADMIN role', () => {
    it('should allow all actions', () => {
      const service = createService('ADMIN');
      expect(service.can('application:create')).toBe(true);
      expect(service.can('application:edit')).toBe(true);
      expect(service.can('application:view:all')).toBe(true);
      expect(service.can('application:review')).toBe(true);
      expect(service.can('application:assign')).toBe(true);
      expect(service.can('sensitive:reveal')).toBe(true);
      expect(service.can('admin:access')).toBe(true);
    });
  });

  describe('unauthenticated (null role)', () => {
    it('should deny all actions', () => {
      const service = createService(null);
      expect(service.can('application:create')).toBe(false);
      expect(service.can('application:review')).toBe(false);
      expect(service.can('admin:access')).toBe(false);
    });
  });

  describe('canAny()', () => {
    it('should return true if at least one action is allowed', () => {
      const service = createService('SALES');
      expect(service.canAny('application:create', 'admin:access')).toBe(true);
    });

    it('should return false if no actions are allowed', () => {
      const service = createService('SALES');
      expect(service.canAny('application:review', 'admin:access')).toBe(false);
    });
  });

  describe('canAll()', () => {
    it('should return true only when all actions are allowed', () => {
      const service = createService('ADMIN');
      expect(service.canAll('application:create', 'sensitive:reveal', 'admin:access')).toBe(true);
    });

    it('should return false when any action is denied', () => {
      const service = createService('SALES');
      expect(service.canAll('application:create', 'admin:access')).toBe(false);
    });
  });

  describe('isRole()', () => {
    it('should return true for matching role', () => {
      expect(createService('REVIEWER').isRole('REVIEWER')).toBe(true);
    });

    it('should return false for non-matching role', () => {
      expect(createService('REVIEWER').isRole('ADMIN')).toBe(false);
    });
  });
});
