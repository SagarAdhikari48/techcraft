import { Routes } from '@angular/router';

/**
 * Admin feature routes — ADMIN role only.
 * Full implementation (assignment management, all applications) in Phase 9.
 */
export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin.component').then((m) => m.AdminComponent),
  },
];
