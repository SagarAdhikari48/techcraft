import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ApplicationDetailComponent } from './application-detail.component';
import { ApplicationApiService } from '../../../../mock-api/application-api.service';
import { PermissionService } from '../../../core/permissions/permission.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MerchantApplication } from '../../../core/models/application.model';

const mockApp: MerchantApplication = {
  id: 'app-0001',
  status: 'UNDER_REVIEW',
  createdBy: 'usr-001',
  assignedReviewer: 'usr-002',
  businessInfo: {
    legalName: 'Apex Retail',
    tradeName: 'Apex',
    businessType: 'LLC',
    taxId: '12-3456789',
    incorporationDate: '2020-01-01',
    website: 'https://apex.com',
    description: 'A retail merchant.',
  },
  contactInfo: {
    ownerName: 'Jane Doe',
    ownerEmail: 'jane@apex.com',
    ownerPhone: '+1-555-0001',
    address: { street: '1 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'US' },
  },
  bankingInfo: {
    bankName: 'Chase',
    accountNumber: '987654321',
    routingNumber: '021000021',
    monthlyVolume: 50000,
    averageTicket: 75,
  },
  riskHistory: [
    {
      id: 'risk-001',
      decision: 'APPROVE',
      notes: 'All checks passed.',
      reviewerId: 'usr-002',
      reviewerName: 'Jordan Lee',
      createdAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const routerStub = { navigate: vi.fn() };

function buildApiStub(appOrError: MerchantApplication | 'error' = mockApp) {
  return {
    getApplicationById: vi.fn().mockReturnValue(
      appOrError === 'error' ? throwError(() => ({ status: 404 })) : of(appOrError)
    ),
    updateStatus: vi.fn().mockReturnValue(of({ ...mockApp, status: 'APPROVED' as const })),
    updateApplication: vi.fn().mockReturnValue(of({ ...mockApp, status: 'APPROVED' as const })),
  };
}

function buildPermStub(canReview: boolean, canReveal: boolean) {
  return {
    can: vi.fn((action: string) => {
      if (action === 'application:review') return canReview;
      if (action === 'sensitive:reveal')   return canReveal;
      return false;
    }),
  };
}

function setup(opts: {
  canReview?: boolean;
  canReveal?: boolean;
  appOrError?: MerchantApplication | 'error';
} = {}) {
  const { canReview = true, canReveal = true, appOrError = mockApp } = opts;
  const apiStub  = buildApiStub(appOrError);
  const permStub = buildPermStub(canReview, canReveal);

  const authStub = {
    user: signal({ id: 'usr-002', name: 'Rajan Shrestha', email: 'reviewer@techcraft.dev', role: 'REVIEWER' as const }),
  };

  TestBed.configureTestingModule({
    imports: [ApplicationDetailComponent],
    providers: [
      { provide: ApplicationApiService, useValue: apiStub },
      { provide: PermissionService,     useValue: permStub },
      { provide: AuthService,           useValue: authStub },
      { provide: Router,                useValue: routerStub },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: { get: () => 'app-0001' } } },
      },
    ],
  }).compileComponents();

  const fixture   = TestBed.createComponent(ApplicationDetailComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  return { fixture, component, apiStub, permStub };
}

describe('ApplicationDetailComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  describe('data loading', () => {
    it('should set loadState to success and populate application', fakeAsync(() => {
      const { component, fixture } = setup();
      tick(400);
      fixture.detectChanges();
      expect(component.loadState()).toBe('success');
      expect(component.application()?.id).toBe('app-0001');
    }));

    it('should set loadState to error when API fails', fakeAsync(() => {
      const { component } = setup({ appOrError: 'error' });
      tick(400);
      expect(component.loadState()).toBe('error');
    }));
  });

  describe('sensitive field masking', () => {
    it('should mask taxId by default', fakeAsync(() => {
      const { component, fixture } = setup();
      tick(400);
      fixture.detectChanges();
      expect(component.isRevealed('taxId')).toBe(false);
    }));

    it('toggleReveal() should flip reveal state for a field', fakeAsync(() => {
      const { component } = setup();
      tick(400);
      component.toggleReveal('taxId');
      expect(component.isRevealed('taxId')).toBe(true);
      component.toggleReveal('taxId');
      expect(component.isRevealed('taxId')).toBe(false);
    }));

    it('reveal buttons should not render when canReveal is false', fakeAsync(() => {
      const { fixture } = setup({ canReveal: false });
      tick(400);
      fixture.detectChanges();
      const btns = fixture.nativeElement.querySelectorAll('.detail__reveal-btn');
      expect(btns.length).toBe(0);
    }));

    it('reveal buttons should render when canReveal is true', fakeAsync(() => {
      const { fixture } = setup({ canReveal: true });
      tick(400);
      fixture.detectChanges();
      const btns = fixture.nativeElement.querySelectorAll('.detail__reveal-btn');
      expect(btns.length).toBeGreaterThan(0);
    }));
  });

  describe('reviewer controls', () => {
    it('should show review form when canReview is true', fakeAsync(() => {
      const { fixture } = setup({ canReview: true });
      tick(400);
      fixture.detectChanges();
      const form = fixture.nativeElement.querySelector('.detail__review-card');
      expect(form).toBeTruthy();
    }));

    it('should hide review form when canReview is false', fakeAsync(() => {
      const { fixture } = setup({ canReview: false });
      tick(400);
      fixture.detectChanges();
      const form = fixture.nativeElement.querySelector('.detail__review-card');
      expect(form).toBeNull();
    }));

    it('submitReview() should block when form is invalid', () => {
      const { component, apiStub } = setup();
      component.submitReview();
      expect(apiStub.updateStatus).not.toHaveBeenCalled();
    });

    it('submitReview() should call updateApplication and update application on success', fakeAsync(() => {
      const { component, apiStub } = setup();
      tick(400);
      component.reviewForm.setValue({ decision: 'APPROVE', notes: 'Looks good, approved.' });
      component.submitReview();
      tick(400);
      expect(apiStub.updateApplication).toHaveBeenCalledWith(
        'app-0001',
        expect.objectContaining({ status: 'APPROVED' })
      );
      expect(component.application()?.status).toBe('APPROVED');
    }));

    it('submitReview() marks form touched when invalid', () => {
      const { component } = setup();
      component.submitReview();
      expect(component.reviewForm.controls.decision.touched).toBe(true);
    });
  });

  describe('navigation', () => {
    it('goBack() should navigate to /dashboard', () => {
      const { component } = setup();
      component.goBack();
      expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('helper methods', () => {
    it('formatDate() should return readable date string', () => {
      const { component } = setup();
      expect(component.formatDate('2025-06-15T00:00:00.000Z')).toMatch(/June|Jun/);
    });

    it('decisionLabel() should return correct labels', () => {
      const { component } = setup();
      expect(component.decisionLabel('APPROVE')).toBe('Approved');
      expect(component.decisionLabel('REJECT')).toBe('Rejected');
      expect(component.decisionLabel('HOLD')).toBe('On Hold');
    });

    it('decisionClass() should return correct CSS classes', () => {
      const { component } = setup();
      expect(component.decisionClass('APPROVE')).toBe('text-success');
      expect(component.decisionClass('REJECT')).toBe('text-danger');
      expect(component.decisionClass('HOLD')).toBe('text-warning');
    });
  });
});
