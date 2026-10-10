import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { StepperComponent } from '../../../shared/components/stepper/stepper.component';
import { WIZARD_STEPS } from '../../../core/models/wizard.model';
import { DraftService } from './draft.service';
import { ApplicationApiService } from '../../../../mock-api/application-api.service';
import {
  taxIdValidator, routingNumberValidator, accountNumberValidator,
  phoneValidator, urlValidator, positiveNumberValidator,
} from '../../../shared/validators/application.validators';

const BUSINESS_TYPES = [
  { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship' },
  { value: 'PARTNERSHIP',         label: 'Partnership' },
  { value: 'LLC',                 label: 'LLC' },
  { value: 'CORPORATION',         label: 'Corporation' },
  { value: 'NON_PROFIT',          label: 'Non-Profit' },
];

@Component({
  selector: 'app-application-wizard',
  standalone: true,
  imports: [ReactiveFormsModule, StepperComponent],
  templateUrl: './application-wizard.component.html',
  styleUrl: './application-wizard.component.scss',
})
export class ApplicationWizardComponent implements OnInit, OnDestroy {
  private readonly fb      = inject(FormBuilder);
  private readonly router  = inject(Router);
  private readonly draft   = inject(DraftService);
  private readonly api     = inject(ApplicationApiService);
  private readonly destroy$ = new Subject<void>();

  readonly steps        = WIZARD_STEPS;
  readonly businessTypes = BUSINESS_TYPES;
  readonly currentIndex = signal(0);
  readonly submitting   = signal(false);
  readonly saveStatus   = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  readonly currentStep  = computed(() => this.steps[this.currentIndex()]);

  readonly form = this.fb.nonNullable.group({
    businessInfo: this.fb.nonNullable.group({
      legalName:         ['', [Validators.required, Validators.minLength(2)]],
      tradeName:         [''],
      businessType:      ['', Validators.required],
      taxId:             ['', [Validators.required, taxIdValidator]],
      incorporationDate: ['', Validators.required],
      website:           ['', urlValidator],
      description:       ['', [Validators.required, Validators.minLength(20)]],
    }),
    contactInfo: this.fb.nonNullable.group({
      ownerName:  ['', Validators.required],
      ownerEmail: ['', [Validators.required, Validators.email]],
      ownerPhone: ['', [Validators.required, phoneValidator]],
      address: this.fb.nonNullable.group({
        street:     ['', Validators.required],
        city:       ['', Validators.required],
        state:      ['', Validators.required],
        postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
        country:    ['US', Validators.required],
      }),
    }),
    bankingInfo: this.fb.nonNullable.group({
      bankName:      ['', Validators.required],
      accountNumber: ['', [Validators.required, accountNumberValidator]],
      routingNumber: ['', [Validators.required, routingNumberValidator]],
      monthlyVolume: [null as unknown as number, [Validators.required, positiveNumberValidator]],
      averageTicket: [null as unknown as number, [Validators.required, positiveNumberValidator]],
    }),
  });

  get businessInfo() { return this.form.controls.businessInfo; }
  get contactInfo()  { return this.form.controls.contactInfo; }
  get bankingInfo()  { return this.form.controls.bankingInfo; }
  get address()      { return this.contactInfo.controls.address; }

  ngOnInit(): void {
    const saved = this.draft.load<typeof this.form.value>();
    if (saved) {
      this.form.patchValue(saved);
    }

    this.form.valueChanges.pipe(
      debounceTime(800),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      this.saveStatus.set('saving');
      try {
        this.draft.save(value);
        this.saveStatus.set('saved');
        setTimeout(() => this.saveStatus.set('idle'), 2000);
      } catch {
        this.saveStatus.set('error');
      }
    });
  }

  isStepValid(index: number): boolean {
    const groups = [this.businessInfo, this.contactInfo, this.bankingInfo];
    return index < 3 ? groups[index].valid : this.form.valid;
  }

  next(): void {
    const current = this.currentIndex();
    const groups = [this.businessInfo, this.contactInfo, this.bankingInfo];
    if (current < 3) {
      groups[current].markAllAsTouched();
      if (!groups[current].valid) return;
    }
    if (current < this.steps.length - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  back(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  goToStep(index: number): void {
    if (index < this.currentIndex()) {
      this.currentIndex.set(index);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.api.createApplication(this.form.getRawValue() as any).subscribe({
      next: (app) => {
        this.draft.clear();
        this.submitting.set(false);
        this.router.navigate(['/applications', app.id]);
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }

  clearDraft(): void {
    this.draft.clear();
    this.form.reset();
    this.currentIndex.set(0);
  }

  hasDraft(): boolean {
    return this.draft.exists();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
