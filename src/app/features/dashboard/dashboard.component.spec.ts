import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { ApplicationApiService } from '../../../mock-api/application-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { PermissionService } from '../../core/permissions/permission.service';
import { ApplicationSummary } from '../../core/models/application.model';
import { PaginatedResponse } from '../../core/models/pagination.model';

function makeSummary(overrides: Partial<ApplicationSummary> = {}): ApplicationSummary {
  return {
    id: 'app-0001',
    status: 'SUBMITTED',
    merchantName: 'Apex Retail',
    assignedReviewer: 'usr-002',
    createdBy: 'usr-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makePagedResponse(
  items: ApplicationSummary[],
  total = items.length
): PaginatedResponse<ApplicationSummary> {
  return { data: items, total, page: 1, pageSize: 10, totalPages: Math.ceil(total / 10) };
}

const routerStub = { navigate: vi.fn() };

function buildDeps(opts: { canCreate?: boolean; canViewAll?: boolean; apiResponse?: any; apiError?: boolean } = {}) {
  const { canCreate = true, canViewAll = false, apiResponse, apiError = false } = opts;

  const response = apiResponse ?? makePagedResponse([makeSummary()]);
  const apiStub = {
    getApplications: vi.fn().mockReturnValue(
      apiError ? throwError(() => new Error('fail')) : of(response).pipe(delay(0))
    ),
  };

  const authStub = {
    user: signal({ id: 'usr-001', name: 'Alex', email: 'a@b.com', role: 'SALES' as const }),
    role: signal<'SALES' | 'REVIEWER' | 'ADMIN'>('SALES'),
  };

  const permStub = {
    can: vi.fn((action: string) => {
      if (action === 'application:create') return canCreate;
      if (action === 'application:view:all') return canViewAll;
      return false;
    }),
  };

  return { apiStub, authStub, permStub };
}

function setup(opts: Parameters<typeof buildDeps>[0] = {}): ComponentFixture<DashboardComponent> {
  const { apiStub, authStub, permStub } = buildDeps(opts);

  TestBed.configureTestingModule({
    imports: [DashboardComponent],
    providers: [
      { provide: ApplicationApiService, useValue: apiStub },
      { provide: AuthService, useValue: authStub },
      { provide: PermissionService, useValue: permStub },
      { provide: Router, useValue: routerStub },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(DashboardComponent);
  fixture.detectChanges();
  return fixture;
}

describe('DashboardComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('should create', fakeAsync(() => {
    const fixture = setup();
    tick(400);
    expect(fixture.componentInstance).toBeTruthy();
  }));

  describe('initial load', () => {
    it('should set loadState to success after data loads', fakeAsync(() => {
      const fixture = setup();
      tick(400);
      expect(fixture.componentInstance.loadState()).toBe('success');
    }));

    it('should populate applications with response data', fakeAsync(() => {
      const items = [makeSummary({ id: 'app-0001' }), makeSummary({ id: 'app-0002' })];
      const fixture = setup({ apiResponse: makePagedResponse(items, 2) });
      tick(400);
      fixture.detectChanges();
      expect(fixture.componentInstance.applications().length).toBe(2);
    }));

    it('should set loadState to error when API fails', fakeAsync(() => {
      const fixture = setup({ apiError: true });
      tick(400);
      expect(fixture.componentInstance.loadState()).toBe('error');
    }));

    it('should show loading state before data arrives', fakeAsync(() => {
      const fixture = setup();
      expect(fixture.componentInstance.loadState()).toBe('loading');
      tick(400);
    }));
  });

  describe('role-aware UI', () => {
    it('should show New Application button when canCreate is true', fakeAsync(() => {
      const fixture = setup({ canCreate: true });
      tick(400);
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('[aria-label="Create new merchant application"]');
      expect(btn).toBeTruthy();
    }));

    it('should hide New Application button when canCreate is false', fakeAsync(() => {
      const fixture = setup({ canCreate: false });
      tick(400);
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('[aria-label="Create new merchant application"]');
      expect(btn).toBeNull();
    }));

    it('should show "All merchant applications" subtitle when canViewAll is true', fakeAsync(() => {
      const fixture = setup({ canCreate: true, canViewAll: true });
      tick(400);
      fixture.detectChanges();
      const subtitle = fixture.nativeElement.querySelector('.dashboard__subtitle');
      expect(subtitle.textContent.trim()).toBe('All merchant applications');
    }));

    it('should show "Your merchant applications" subtitle when canViewAll is false', fakeAsync(() => {
      const fixture = setup({ canCreate: true, canViewAll: false });
      tick(400);
      fixture.detectChanges();
      const subtitle = fixture.nativeElement.querySelector('.dashboard__subtitle');
      expect(subtitle.textContent.trim()).toBe('Your merchant applications');
    }));
  });

  describe('navigation', () => {
    it('should navigate to application detail on viewApplication()', fakeAsync(() => {
      const fixture = setup();
      tick(400);
      fixture.componentInstance.viewApplication('app-0001');
      expect(routerStub.navigate).toHaveBeenCalledWith(['/applications', 'app-0001']);
    }));

    it('should navigate to new wizard on createApplication()', fakeAsync(() => {
      const fixture = setup();
      tick(400);
      fixture.componentInstance.createApplication();
      expect(routerStub.navigate).toHaveBeenCalledWith(['/applications/new']);
    }));
  });

  describe('pagination', () => {
    it('should not navigate below page 1', fakeAsync(() => {
      const fixture = setup();
      tick(400);
      fixture.componentInstance.goToPage(0);
      expect(fixture.componentInstance.currentPage()).toBe(1);
    }));

    it('should not trigger reload when navigating to current page', fakeAsync(() => {
      const { apiStub } = buildDeps();
      TestBed.configureTestingModule({
        imports: [DashboardComponent],
        providers: [
          { provide: ApplicationApiService, useValue: apiStub },
          { provide: AuthService, useValue: buildDeps().authStub },
          { provide: PermissionService, useValue: buildDeps().permStub },
          { provide: Router, useValue: routerStub },
        ],
      }).compileComponents();
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.detectChanges();
      tick(400);
      const callCount = apiStub.getApplications.mock.calls.length;
      fixture.componentInstance.goToPage(1);
      expect(apiStub.getApplications.mock.calls.length).toBe(callCount);
    }));

    it('should update currentPage signal when navigating to a valid page', fakeAsync(() => {
      const items = Array.from({ length: 10 }, (_, i) => makeSummary({ id: `app-${i}` }));
      const fixture = setup({ apiResponse: makePagedResponse(items, 25) });
      tick(400);
      fixture.componentInstance.goToPage(2);
      expect(fixture.componentInstance.currentPage()).toBe(2);
      tick(400);
    }));
  });

  describe('helper methods', () => {
    it('formatDate() should return a readable date string', fakeAsync(() => {
      const fixture = setup();
      tick(400);
      const result = fixture.componentInstance.formatDate('2025-06-15T00:00:00.000Z');
      expect(result).toMatch(/Jun/);
      expect(result).toMatch(/2025/);
    }));

    it('trackById() should return the item id', fakeAsync(() => {
      const fixture = setup();
      tick(400);
      expect(fixture.componentInstance.trackById(0, makeSummary({ id: 'app-xyz' }))).toBe('app-xyz');
    }));
  });
});
