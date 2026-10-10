import { Routes } from '@angular/router';

/**
 * Auth feature routes.
 * Login page will be scaffolded in Phase 1.2.
 */
export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
