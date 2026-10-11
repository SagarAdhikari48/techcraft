import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApplicationApiService } from '../../../mock-api/application-api.service';
import { UsersApiService } from '../../../mock-api/users-api.service';
import { ApplicationSummary } from '../../core/models/application.model';
import { User } from '../../core/models/user.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, StatusBadgeComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private readonly api       = inject(ApplicationApiService);
  private readonly usersApi  = inject(UsersApiService);
  private readonly router    = inject(Router);
  private readonly fb        = inject(FormBuilder);

  readonly loadState    = signal<LoadState>('loading');
  readonly applications = signal<ApplicationSummary[]>([]);
  readonly reviewers    = signal<User[]>([]);
  readonly saving       = signal<string | null>(null);
  readonly reviewerMap  = signal<Record<string, string>>({});

  private readonly filterValues = signal({ search: '', status: '', reviewer: '' });

  readonly filterForm = this.fb.nonNullable.group({
    search:   [''],
    status:   [''],
    reviewer: [''],
  });

  readonly filtered = computed(() => {
    const { search, status, reviewer } = this.filterValues();
    return this.applications().filter((app) => {
      const matchSearch = !search ||
        app.merchantName.toLowerCase().includes(search.toLowerCase()) ||
        app.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus   = !status   || app.status === status;
      const matchReviewer = !reviewer || app.assignedReviewer === reviewer;
      return matchSearch && matchStatus && matchReviewer;
    });
  });

  readonly statusCounts = computed(() => {
    const apps = this.applications();
    return {
      total:       apps.length,
      draft:       apps.filter((a) => a.status === 'DRAFT').length,
      submitted:   apps.filter((a) => a.status === 'SUBMITTED').length,
      underReview: apps.filter((a) => a.status === 'UNDER_REVIEW').length,
      approved:    apps.filter((a) => a.status === 'APPROVED').length,
      rejected:    apps.filter((a) => a.status === 'REJECTED').length,
      onHold:      apps.filter((a) => a.status === 'ON_HOLD').length,
    };
  });

  constructor() {
    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) =>
        this.filterValues.set({
          search:   v.search   ?? '',
          status:   v.status   ?? '',
          reviewer: v.reviewer ?? '',
        })
      );
  }

  ngOnInit(): void {
    forkJoin({
      applications: this.api.getAllApplicationsUnpaged(),
      reviewers:    this.usersApi.getReviewers(),
    }).subscribe({
      next: ({ applications, reviewers }) => {
        this.applications.set(applications);
        this.reviewers.set(reviewers);
        // Build reviewer map for two-way binding in dropdowns
        const map: Record<string, string> = {};
        applications.forEach(a => { map[a.id] = a.assignedReviewer ?? ''; });
        this.reviewerMap.set(map);
        this.loadState.set('success');
      },
      error: () => this.loadState.set('error'),
    });
  }

  assignReviewer(applicationId: string, reviewerId: string): void {
    this.saving.set(applicationId);
    const id = reviewerId || null;
    const newStatus = reviewerId ? 'UNDER_REVIEW' as const : 'SUBMITTED' as const;

    this.api.assignReviewer(applicationId, id).subscribe({
      next: () => {
        // Update the applications signal
        this.applications.update((apps) =>
          apps.map((a) =>
            a.id === applicationId
              ? { ...a, assignedReviewer: id ?? undefined, status: newStatus, updatedAt: new Date().toISOString() }
              : a
          )
        );
        // Update the reviewer map signal so ngModel reflects the new value
        this.reviewerMap.update(m => ({ ...m, [applicationId]: id ?? '' }));
        this.saving.set(null);
      },
      error: () => this.saving.set(null),
    });
  }

  getReviewerValue(appId: string): string {
    return this.reviewerMap()[appId] ?? '';
  }

  onReviewerChange(appId: string, value: string): void {
    this.assignReviewer(appId, value);
  }

  viewApplication(id: string): void {
    this.router.navigate(['/applications', id]);
  }

  reviewerName(reviewerId: string | undefined): string {
    if (!reviewerId) return 'Unassigned';
    return this.reviewers().find((r) => r.id === reviewerId)?.name ?? reviewerId;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  trackById(_: number, item: ApplicationSummary): string {
    return item.id;
  }
}
