import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApplicationApiService } from '../../../mock-api/application-api.service';
import { UsersApiService } from '../../../mock-api/users-api.service';
import { ApplicationSummary } from '../../core/models/application.model';
import { User } from '../../core/models/user.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule, StatusBadgeComponent],
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

  readonly filterForm = this.fb.nonNullable.group({
    search:   [''],
    status:   [''],
    reviewer: [''],
  });

  readonly filtered = computed(() => {
    const { search, status, reviewer } = this.filterForm.getRawValue();
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

  ngOnInit(): void {
    forkJoin({
      applications: this.api.getAllApplicationsUnpaged(),
      reviewers:    this.usersApi.getReviewers(),
    }).subscribe({
      next: ({ applications, reviewers }) => {
        this.applications.set(applications);
        this.reviewers.set(reviewers);
        this.loadState.set('success');
      },
      error: () => this.loadState.set('error'),
    });

    this.filterForm.valueChanges.subscribe(() => {});
  }

  assignReviewer(applicationId: string, reviewerId: string): void {
    this.saving.set(applicationId);
    const id = reviewerId || null;
    this.api.assignReviewer(applicationId, id).subscribe({
      next: (updated) => {
        this.applications.update((apps) =>
          apps.map((a) =>
            a.id === applicationId
              ? { ...a, assignedReviewer: updated.assignedReviewer, status: updated.status }
              : a
          )
        );
        this.saving.set(null);
      },
      error: () => this.saving.set(null),
    });
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
