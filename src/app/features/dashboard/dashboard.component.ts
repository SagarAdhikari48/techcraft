import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError, startWith, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApplicationApiService } from '../../../mock-api/application-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { PermissionService } from '../../core/permissions/permission.service';
import { ApplicationSummary, ApplicationStatus } from '../../core/models/application.model';
import { PaginationParams } from '../../core/models/pagination.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

type LoadState = 'loading' | 'success' | 'error';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: ApplicationStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ON_HOLD', label: 'On Hold' },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, StatusBadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApplicationApiService);
  private readonly auth = inject(AuthService);
  private readonly permissions = inject(PermissionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  readonly statusOptions = STATUS_OPTIONS;

  readonly loadState = signal<LoadState>('loading');
  readonly applications = signal<ApplicationSummary[]>([]);
  readonly totalRecords = signal(0);
  readonly totalPages = signal(0);
  readonly currentPage = signal(1);

  readonly user = this.auth.user;
  readonly canCreate = computed(() => this.permissions.can('application:create'));
  readonly canViewAll = computed(() => this.permissions.can('application:view:all'));

  readonly filterForm = this.fb.nonNullable.group({
    search: [''],
    status: [''],
  });

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  ngOnInit(): void {
    combineLatest([
      this.filterForm.valueChanges.pipe(
        startWith(this.filterForm.getRawValue()),
        debounceTime(350),
        distinctUntilChanged((a, b) => a.search === b.search && a.status === b.status),
        tap(() => this.currentPage.set(1))
      ),
    ])
      .pipe(
        switchMap(([filters]) => {
          this.loadState.set('loading');
          const params: PaginationParams = {
            page: this.currentPage(),
            pageSize: PAGE_SIZE,
            search: filters.search,
            status: filters.status || undefined,
            sortBy: 'updatedAt',
            sortDir: 'desc',
          };
          return this.api.getApplications(params).pipe(
            catchError(() => {
              this.loadState.set('error');
              return of(null);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((result) => {
        if (result) {
          this.applications.set(result.data);
          this.totalRecords.set(result.total);
          this.totalPages.set(result.totalPages);
          this.loadState.set('success');
        }
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.reload();
  }

  retry(): void {
    this.filterForm.updateValueAndValidity({ emitEvent: true });
  }

  viewApplication(id: string): void {
    this.router.navigate(['/applications', id]);
  }

  createApplication(): void {
    this.router.navigate(['/applications/new']);
  }

  trackById(_: number, item: ApplicationSummary): string {
    return item.id;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  private reload(): void {
    const filters = this.filterForm.getRawValue();
    this.loadState.set('loading');
    const params: PaginationParams = {
      page: this.currentPage(),
      pageSize: PAGE_SIZE,
      search: filters.search,
      status: filters.status || undefined,
      sortBy: 'updatedAt',
      sortDir: 'desc',
    };
    this.api.getApplications(params).pipe(
      catchError(() => {
        this.loadState.set('error');
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe((result) => {
      if (result) {
        this.applications.set(result.data);
        this.totalRecords.set(result.total);
        this.totalPages.set(result.totalPages);
        this.loadState.set('success');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
