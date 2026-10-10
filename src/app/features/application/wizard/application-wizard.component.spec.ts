import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ApplicationWizardComponent } from './application-wizard.component';
import { ApplicationApiService } from '../../../../mock-api/application-api.service';
import { DraftService } from './draft.service';
import { MerchantApplication } from '../../../core/models/application.model';

const routerStub = { navigate: vi.fn() };

function buildApiStub(app: Partial<MerchantApplication> = {}) {
  return {
    createApplication: vi.fn().mockReturnValue(
      of({ id: 'app-0001', ...app })
    ),
  };
}

function buildDraftStub(hasDraft = false, savedValue: unknown = null) {
  return {
    load: vi.fn().mockReturnValue(savedValue),
    save: vi.fn(),
    clear: vi.fn(),
    exists: vi.fn().mockReturnValue(hasDraft),
  };
}

function setup(opts: { hasDraft?: boolean; draftValue?: unknown } = {}) {
  const apiStub   = buildApiStub();
  const draftStub = buildDraftStub(opts.hasDraft ?? false, opts.draftValue ?? null);

  TestBed.configureTestingModule({
    imports: [ApplicationWizardComponent],
    providers: [
      { provide: ApplicationApiService, useValue: apiStub },
      { provide: DraftService,          useValue: draftStub },
      { provide: Router,                useValue: routerStub },
    ],
  }).compileComponents();

  const fixture   = TestBed.createComponent(ApplicationWizardComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  return { fixture, component, apiStub, draftStub };
}

function fillBusinessInfo(component: ApplicationWizardComponent) {
  component.businessInfo.setValue({
    legalName:         'Apex Corp',
    tradeName:         '',
    businessType:      'LLC',
    taxId:             '12-3456789',
    incorporationDate: '2020-01-01',
    website:           '',
    description:       'A valid description that is long enough',
  });
}

function fillContactInfo(component: ApplicationWizardComponent) {
  component.contactInfo.setValue({
    ownerName:  'Jane Doe',
    ownerEmail: 'jane@apex.com',
    ownerPhone: '+1-555-1234',
    address: {
      street:     '123 Main St',
      city:       'New York',
      state:      'NY',
      postalCode: '10001',
      country:    'US',
    },
  });
}

function fillBankingInfo(component: ApplicationWizardComponent) {
  component.bankingInfo.setValue({
    bankName:      'Chase Bank',
    accountNumber: '12345678',
    routingNumber: '123456789',
    monthlyVolume: 50000,
    averageTicket: 75,
  });
}

describe('ApplicationWizardComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('should create and start on step 0', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
    expect(component.currentIndex()).toBe(0);
  });

  describe('draft restore', () => {
    it('should patch form from DraftService on init', () => {
      const draftValue = {
        businessInfo: {
          legalName: 'Draft Corp', tradeName: '', businessType: 'LLC',
          taxId: '12-3456789', incorporationDate: '2020-01-01',
          website: '', description: 'Draft description that is long enough',
        },
      };
      const { component } = setup({ hasDraft: true, draftValue });
      expect(component.businessInfo.controls.legalName.value).toBe('Draft Corp');
    });

    it('hasDraft() returns true when DraftService.exists() is true', () => {
      const { component } = setup({ hasDraft: true });
      expect(component.hasDraft()).toBe(true);
    });

    it('clearDraft() resets form and navigates to step 0', () => {
      const { component, draftStub } = setup({ hasDraft: true });
      fillBusinessInfo(component);
      component.clearDraft();
      expect(draftStub.clear).toHaveBeenCalled();
      expect(component.currentIndex()).toBe(0);
      expect(component.businessInfo.controls.legalName.value).toBe('');
    });
  });

  describe('step navigation', () => {
    it('next() blocks advance when current step form is invalid', () => {
      const { component } = setup();
      component.next();
      expect(component.currentIndex()).toBe(0);
    });

    it('next() marks fields as touched when blocked', () => {
      const { component } = setup();
      component.next();
      expect(component.businessInfo.controls.legalName.touched).toBe(true);
    });

    it('next() advances to step 1 when business info is valid', () => {
      const { component } = setup();
      fillBusinessInfo(component);
      component.next();
      expect(component.currentIndex()).toBe(1);
    });

    it('back() decrements currentIndex', () => {
      const { component } = setup();
      fillBusinessInfo(component);
      component.next();
      expect(component.currentIndex()).toBe(1);
      component.back();
      expect(component.currentIndex()).toBe(0);
    });

    it('back() does not go below step 0', () => {
      const { component } = setup();
      component.back();
      expect(component.currentIndex()).toBe(0);
    });

    it('goToStep() allows jumping back to a previous step', () => {
      const { component } = setup();
      fillBusinessInfo(component);
      component.next();
      component.goToStep(0);
      expect(component.currentIndex()).toBe(0);
    });

    it('goToStep() does not jump forward past current step', () => {
      const { component } = setup();
      component.goToStep(2);
      expect(component.currentIndex()).toBe(0);
    });
  });

  describe('form validation', () => {
    it('businessInfo should be invalid when required fields are empty', () => {
      const { component } = setup();
      expect(component.businessInfo.invalid).toBe(true);
    });

    it('businessInfo should be valid when all required fields are filled correctly', () => {
      const { component } = setup();
      fillBusinessInfo(component);
      expect(component.businessInfo.valid).toBe(true);
    });

    it('taxId should fail with wrong format', () => {
      const { component } = setup();
      component.businessInfo.controls.taxId.setValue('INVALID');
      expect(component.businessInfo.controls.taxId.errors?.['taxIdFormat']).toBeTruthy();
    });

    it('contactInfo email should fail with invalid format', () => {
      const { component } = setup();
      component.contactInfo.controls.ownerEmail.setValue('not-an-email');
      expect(component.contactInfo.controls.ownerEmail.errors?.['email']).toBeTruthy();
    });

    it('bankingInfo routingNumber should fail when not 9 digits', () => {
      const { component } = setup();
      component.bankingInfo.controls.routingNumber.setValue('12345');
      expect(component.bankingInfo.controls.routingNumber.errors?.['routingFormat']).toBeTruthy();
    });
  });

  describe('submit()', () => {
    it('should not call API when form is invalid', () => {
      const { component, apiStub } = setup();
      component.submit();
      expect(apiStub.createApplication).not.toHaveBeenCalled();
    });

    it('should call createApplication and navigate on success', fakeAsync(() => {
      const { component, apiStub, draftStub } = setup();
      fillBusinessInfo(component);
      fillContactInfo(component);
      fillBankingInfo(component);
      component.submit();
      tick(500);
      expect(apiStub.createApplication).toHaveBeenCalled();
      expect(draftStub.clear).toHaveBeenCalled();
      expect(routerStub.navigate).toHaveBeenCalledWith(['/applications', 'app-0001']);
    }));
  });
});
