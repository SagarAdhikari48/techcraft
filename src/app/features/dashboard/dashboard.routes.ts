import { Routes } from '@angular/router';

/**
 * Dashboard feature routes.
 * Full component scaffolded in Phase 3.
 */
export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
  },
];
