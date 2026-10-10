import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from '../app/core/auth/auth.service';
import { ApplicationSummary, ApplicationStatus, MerchantApplication } from '../app/core/models/application.model';
import { PaginatedResponse, PaginationParams } from '../app/core/models/pagination.model';

@Injectable({ providedIn: 'root' })
export class ApplicationApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private get base(): string {
    return `${environment.apiUrl}/applications`;
  }

  getApplications(params: PaginationParams): Observable<PaginatedResponse<ApplicationSummary>> {
    const role   = this.auth.role();
    const userId = this.auth.user()?.id;

    return this.http.get<MerchantApplication[]>(this.base).pipe(
      map((all) => {
        let filtered = all.filter((app) => {
          if (role === 'SALES')    return app.createdBy === userId;
          if (role === 'REVIEWER') return app.assignedReviewer === userId;
          return true;
        });

        if (params.search?.trim()) {
          const term = params.search.toLowerCase();
          filtered = filtered.filter((app) =>
            app.businessInfo.legalName.toLowerCase().includes(term) ||
            app.id.toLowerCase().includes(term)
          );
        }

        if (params.status) {
          filtered = filtered.filter((app) => app.status === params.status);
        }

        if (params.sortBy) {
          filtered = [...filtered].sort((a, b) => {
            const dir = params.sortDir === 'desc' ? -1 : 1;
            const aVal = this.getSortValue(a, params.sortBy!);
            const bVal = this.getSortValue(b, params.sortBy!);
            return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
          });
        }

        const total      = filtered.length;
        const totalPages = Math.ceil(total / params.pageSize) || 1;
        const start      = (params.page - 1) * params.pageSize;
        const page       = filtered.slice(start, start + params.pageSize);

        const summaries: ApplicationSummary[] = page.map((app) => ({
          id:               app.id,
          status:           app.status,
          merchantName:     app.businessInfo.legalName,
          assignedReviewer: app.assignedReviewer,
          createdBy:        app.createdBy,
          createdAt:        app.createdAt,
          updatedAt:        app.updatedAt,
        }));

        return { data: summaries, total, page: params.page, pageSize: params.pageSize, totalPages };
      })
    );
  }

  getApplicationById(id: string): Observable<MerchantApplication> {
    return this.http.get<MerchantApplication>(`${this.base}/${id}`).pipe(
      catchError(() => throwError(() => ({ status: 404, message: `Application ${id} not found` })))
    );
  }

  createApplication(data: Partial<MerchantApplication>): Observable<MerchantApplication> {
    const userId = this.auth.user()?.id ?? 'unknown';
    const newApp = {
      ...data,
      id:          `app-${Date.now()}`,
      status:      'DRAFT' as ApplicationStatus,
      createdBy:   userId,
      riskHistory: [],
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    };
    return this.http.post<MerchantApplication>(this.base, newApp);
  }

  updateApplication(id: string, data: Partial<MerchantApplication>): Observable<MerchantApplication> {
    return this.http.patch<MerchantApplication>(`${this.base}/${id}`, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  updateStatus(id: string, status: ApplicationStatus): Observable<MerchantApplication> {
    return this.updateApplication(id, { status });
  }

  assignReviewer(applicationId: string, reviewerId: string | null): Observable<MerchantApplication> {
    return this.updateApplication(applicationId, {
      assignedReviewer: reviewerId ?? undefined,
      status: reviewerId ? 'UNDER_REVIEW' : 'SUBMITTED',
    });
  }

  getAllApplicationsUnpaged(): Observable<ApplicationSummary[]> {
    return this.http.get<MerchantApplication[]>(this.base).pipe(
      map((all) => all.map((app) => ({
        id:               app.id,
        status:           app.status,
        merchantName:     app.businessInfo.legalName,
        assignedReviewer: app.assignedReviewer,
        createdBy:        app.createdBy,
        createdAt:        app.createdAt,
        updatedAt:        app.updatedAt,
      })))
    );
  }

  private getSortValue(app: MerchantApplication, field: string): string {
    switch (field) {
      case 'merchantName': return app.businessInfo.legalName;
      case 'status':       return app.status;
      case 'createdAt':    return app.createdAt;
      case 'updatedAt':    return app.updatedAt;
      default:             return app.id;
    }
  }
}
