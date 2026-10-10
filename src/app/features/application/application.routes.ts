import { Routes } from '@angular/router';

/**
 * Merchant Application feature routes.
 * - /applications       → list (redirects to dashboard)
 * - /applications/new   → multi-step wizard (Phase 4)
 * - /applications/:id   → detail + review (Phase 6)
 */
export const applicationRoutes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./wizard/application-wizard.component').then(
        (m) => m.ApplicationWizardComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/application-detail.component').then(
        (m) => m.ApplicationDetailComponent
      ),
  },
];
