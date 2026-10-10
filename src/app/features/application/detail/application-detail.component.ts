import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApplicationApiService } from '../../../../mock-api/application-api.service';
import { PermissionService } from '../../../core/permissions/permission.service';
import { MerchantApplication, RiskDecision } from '../../../core/models/application.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { MaskPipe } from '../../../shared/pipes/mask.pipe';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [ReactiveFormsModule, StatusBadgeComponent, MaskPipe],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss',
})
export class ApplicationDetailComponent implements OnInit {
  private readonly route      = inject(ActivatedRoute);
  private readonly router     = inject(Router);
  private readonly api        = inject(ApplicationApiService);
  private readonly permissions = inject(PermissionService);
  private readonly fb         = inject(FormBuilder);

  readonly loadState    = signal<LoadState>('loading');
  readonly application  = signal<MerchantApplication | null>(null);
  readonly submitting   = signal(false);
  readonly revealMap    = signal<Record<string, boolean>>({});

  readonly canReview    = computed(() => this.permissions.can('application:review'));
  readonly canReveal    = computed(() => this.permissions.can('sensitive:reveal'));

  readonly reviewForm = this.fb.nonNullable.group({
    decision: ['', Validators.required],
    notes:    ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.api.getApplicationById(id).subscribe({
      next:  (app) => { this.application.set(app); this.loadState.set('success'); },
      error: ()    => this.loadState.set('error'),
    });
  }

  toggleReveal(field: string): void {
    this.revealMap.update(m => ({ ...m, [field]: !m[field] }));
  }

  isRevealed(field: string): boolean {
    return this.revealMap()[field] ?? false;
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    const app = this.application();
    if (!app) return;

    const { decision, notes } = this.reviewForm.getRawValue();
    const statusMap: Record<string, 'APPROVED' | 'REJECTED' | 'ON_HOLD'> = {
      APPROVE: 'APPROVED',
      REJECT:  'REJECTED',
      HOLD:    'ON_HOLD',
    };

    this.submitting.set(true);
    this.api.updateStatus(app.id, statusMap[decision]).subscribe({
      next: (updated) => {
        this.application.set(updated);
        this.submitting.set(false);
        this.reviewForm.reset();
      },
      error: () => this.submitting.set(false),
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  decisionLabel(d: RiskDecision): string {
    return { APPROVE: 'Approved', REJECT: 'Rejected', HOLD: 'On Hold' }[d] ?? d;
  }

  decisionClass(d: RiskDecision): string {
    return { APPROVE: 'text-success', REJECT: 'text-danger', HOLD: 'text-warning' }[d] ?? '';
  }
}
