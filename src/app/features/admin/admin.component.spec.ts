import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AdminComponent } from './admin.component';
import { ApplicationApiService } from '../../../mock-api/application-api.service';
import { UsersApiService } from '../../../mock-api/users-api.service';
import { ApplicationSummary } from '../../core/models/application.model';
import { User } from '../../core/models/user.model';

const mockReviewers: User[] = [
  { id: 'usr-002', name: 'Jordan Lee',   email: 'reviewer@techcraft.dev', role: 'REVIEWER' },
  { id: 'usr-003', name: 'Morgan Blake', email: 'admin@techcraft.dev',    role: 'ADMIN' },
];

function makeSummary(overrides: Partial<ApplicationSummary> = {}): ApplicationSummary {
  return {
    id: 'app-0001',
    status: 'SUBMITTED',
    merchantName: 'Apex Retail',
    assignedReviewer: undefined,
    createdBy: 'usr-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const routerStub = { navigate: vi.fn() };

function buildApiStub(apps: ApplicationSummary[] = [makeSummary()], failLoad = false) {
  return {
    getAllApplicationsUnpaged: vi.fn().mockReturnValue(
      failLoad ? throwError(() => new Error('fail')) : of(apps)
    ),
    assignReviewer: vi.fn().mockReturnValue(
      of({ ...makeSummary(), assignedReviewer: 'usr-002', status: 'UNDER_REVIEW' as const })
    ),
  };
}

function buildUsersStub() {
  return { getReviewers: vi.fn().mockReturnValue(of(mockReviewers)) };
}

function setup(opts: { apps?: ApplicationSummary[]; failLoad?: boolean } = {}) {
  const apiStub   = buildApiStub(opts.apps, opts.failLoad);
  const usersStub = buildUsersStub();

  TestBed.configureTestingModule({
    imports: [AdminComponent],
    providers: [
      { provide: ApplicationApiService, useValue: apiStub },
      { provide: UsersApiService,       useValue: usersStub },
      { provide: Router,                useValue: routerStub },
    ],
  }).compileComponents();

  const fixture   = TestBed.createComponent(AdminComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  return { fixture, component, apiStub, usersStub };
}

describe('AdminComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(setup().component).toBeTruthy();
  });

  describe('data loading', () => {
    it('should load applications and reviewers via forkJoin', fakeAsync(() => {
      const { component, apiStub, usersStub } = setup();
      tick(400);
      expect(apiStub.getAllApplicationsUnpaged).toHaveBeenCalledTimes(1);
      expect(usersStub.getReviewers).toHaveBeenCalledTimes(1);
      expect(component.loadState()).toBe('success');
    }));

    it('should populate applications and reviewers signals', fakeAsync(() => {
      const apps = [makeSummary({ id: 'app-0001' }), makeSummary({ id: 'app-0002' })];
      const { component } = setup({ apps });
      tick(400);
      expect(component.applications().length).toBe(2);
      expect(component.reviewers().length).toBe(2);
    }));

    it('should set loadState to error when API fails', fakeAsync(() => {
      const { component } = setup({ failLoad: true });
      tick(400);
      expect(component.loadState()).toBe('error');
    }));
  });

  describe('statusCounts computed', () => {
    it('should count applications by status correctly', fakeAsync(() => {
      const apps = [
        makeSummary({ status: 'SUBMITTED' }),
        makeSummary({ id: 'app-0002', status: 'APPROVED' }),
        makeSummary({ id: 'app-0003', status: 'APPROVED' }),
        makeSummary({ id: 'app-0004', status: 'REJECTED' }),
      ];
      const { component } = setup({ apps });
      tick(400);
      expect(component.statusCounts().total).toBe(4);
      expect(component.statusCounts().approved).toBe(2);
      expect(component.statusCounts().submitted).toBe(1);
      expect(component.statusCounts().rejected).toBe(1);
    }));
  });

  describe('filtered computed', () => {
    it('should filter by search term', fakeAsync(() => {
      const apps = [
        makeSummary({ id: 'app-0001', merchantName: 'Apex Retail' }),
        makeSummary({ id: 'app-0002', merchantName: 'Blue Ridge' }),
      ];
      const { component } = setup({ apps });
      tick(400);
      component.filterForm.controls.search.setValue('apex');
      expect(component.filtered().length).toBe(1);
      expect(component.filtered()[0].merchantName).toBe('Apex Retail');
    }));

    it('should filter by status', fakeAsync(() => {
      const apps = [
        makeSummary({ id: 'app-0001', status: 'SUBMITTED' }),
        makeSummary({ id: 'app-0002', status: 'APPROVED' }),
      ];
      const { component } = setup({ apps });
      tick(400);
      component.filterForm.controls.status.setValue('APPROVED');
      expect(component.filtered().length).toBe(1);
      expect(component.filtered()[0].status).toBe('APPROVED');
    }));

    it('should show all applications when no filter is set', fakeAsync(() => {
      const apps = [makeSummary(), makeSummary({ id: 'app-0002' })];
      const { component } = setup({ apps });
      tick(400);
      expect(component.filtered().length).toBe(2);
    }));
  });

  describe('assignReviewer()', () => {
    it('should call api.assignReviewer with correct args', fakeAsync(() => {
      const { component, apiStub } = setup();
      tick(400);
      component.assignReviewer('app-0001', 'usr-002');
      tick(400);
      expect(apiStub.assignReviewer).toHaveBeenCalledWith('app-0001', 'usr-002');
    }));

    it('should update application in signal after successful assignment', fakeAsync(() => {
      const { component } = setup();
      tick(400);
      component.assignReviewer('app-0001', 'usr-002');
      tick(400);
      const app = component.applications().find((a) => a.id === 'app-0001');
      expect(app?.assignedReviewer).toBe('usr-002');
      expect(app?.status).toBe('UNDER_REVIEW');
    }));

    it('should clear saving signal after assignment completes', fakeAsync(() => {
      const { component } = setup();
      tick(400);
      component.assignReviewer('app-0001', 'usr-002');
      tick(400);
      expect(component.saving()).toBeNull();
    }));
  });

  describe('navigation', () => {
    it('viewApplication() navigates to /applications/:id', fakeAsync(() => {
      const { component } = setup();
      tick(400);
      component.viewApplication('app-0001');
      expect(routerStub.navigate).toHaveBeenCalledWith(['/applications', 'app-0001']);
    }));
  });

  describe('helper methods', () => {
    it('reviewerName() returns reviewer name by id', fakeAsync(() => {
      const { component } = setup();
      tick(400);
      expect(component.reviewerName('usr-002')).toBe('Jordan Lee');
    }));

    it('reviewerName() returns Unassigned for undefined', fakeAsync(() => {
      const { component } = setup();
      tick(400);
      expect(component.reviewerName(undefined)).toBe('Unassigned');
    }));

    it('formatDate() returns readable string', fakeAsync(() => {
      const { component } = setup();
      tick(400);
      expect(component.formatDate('2025-06-15T00:00:00.000Z')).toMatch(/Jun/);
    }));

    it('trackById() returns item id', fakeAsync(() => {
      const { component } = setup();
      tick(400);
      expect(component.trackById(0, makeSummary({ id: 'app-xyz' }))).toBe('app-xyz');
    }));
  });
});
