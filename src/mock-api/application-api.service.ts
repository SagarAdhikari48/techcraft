import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AuthService } from '../app/core/auth/auth.service';
import { ApplicationSummary, ApplicationStatus, MerchantApplication } from '../app/core/models/application.model';
import { PaginatedResponse, PaginationParams } from '../app/core/models/pagination.model';
import { MOCK_APPLICATIONS } from './mock-applications';

@Injectable({ providedIn: 'root' })
export class ApplicationApiService {
  private readonly auth = inject(AuthService);

  getApplications(params: PaginationParams): Observable<PaginatedResponse<ApplicationSummary>> {
    const role = this.auth.role();
    const userId = this.auth.user()?.id;

    let filtered = MOCK_APPLICATIONS.filter((app) => {
      if (role === 'SALES') return app.createdBy === userId;
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

    const total = filtered.length;
    const totalPages = Math.ceil(total / params.pageSize);
    const start = (params.page - 1) * params.pageSize;
    const page = filtered.slice(start, start + params.pageSize);

    const summaries: ApplicationSummary[] = page.map((app) => ({
      id: app.id,
      status: app.status,
      merchantName: app.businessInfo.legalName,
      assignedReviewer: app.assignedReviewer,
      createdBy: app.createdBy,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));

    return of({ data: summaries, total, page: params.page, pageSize: params.pageSize, totalPages }).pipe(
      delay(400)
    );
  }

  getApplicationById(id: string): Observable<MerchantApplication> {
    const app = MOCK_APPLICATIONS.find((a) => a.id === id);
    if (!app) {
      return throwError(() => ({ status: 404, message: `Application ${id} not found` })).pipe(delay(200));
    }
    return of(app).pipe(delay(300));
  }

  createApplication(data: Partial<MerchantApplication>): Observable<MerchantApplication> {
    const userId = this.auth.user()?.id ?? 'unknown';
    const newApp: MerchantApplication = {
      ...data,
      id: `app-${String(MOCK_APPLICATIONS.length + 1).padStart(4, '0')}`,
      status: 'DRAFT',
      createdBy: userId,
      riskHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as MerchantApplication;
    MOCK_APPLICATIONS.push(newApp);
    return of(newApp).pipe(delay(500));
  }

  updateApplication(id: string, data: Partial<MerchantApplication>): Observable<MerchantApplication> {
    const index = MOCK_APPLICATIONS.findIndex((a) => a.id === id);
    if (index === -1) {
      return throwError(() => ({ status: 404, message: `Application ${id} not found` })).pipe(delay(200));
    }
    const updated = { ...MOCK_APPLICATIONS[index], ...data, updatedAt: new Date().toISOString() };
    MOCK_APPLICATIONS[index] = updated;
    return of(updated).pipe(delay(400));
  }

  updateStatus(id: string, status: ApplicationStatus): Observable<MerchantApplication> {
    return this.updateApplication(id, { status });
  }

  private getSortValue(app: MerchantApplication, field: string): string {
    switch (field) {
      case 'merchantName': return app.businessInfo.legalName;
      case 'status': return app.status;
      case 'createdAt': return app.createdAt;
      case 'updatedAt': return app.updatedAt;
      default: return app.id;
    }
  }
}
