import { Routes } from '@angular/router';

/**
 * Root application routes.
 * All feature modules are lazy-loaded to keep the initial bundle small.
 * Guards will be added once the auth service is in place (Phase 1.2).
 */
export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // Auth routes (eager — needed before any guard runs)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // Dashboard — all roles, guarded
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.dashboardRoutes
      ),
    // canActivate: [authGuard]  ← wired in Phase 1.2
  },

  // Merchant Application wizard + detail
  {
    path: 'applications',
    loadChildren: () =>
      import('./features/application/application.routes').then(
        (m) => m.applicationRoutes
      ),
    // canActivate: [authGuard]
  },

  // Admin panel — ADMIN role only
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.adminRoutes),
    // canActivate: [authGuard, roleGuard('ADMIN')]
  },

  // Catch-all → redirect to dashboard
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
