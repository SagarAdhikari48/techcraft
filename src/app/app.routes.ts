import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.dashboardRoutes
      ),
  },
  {
    path: 'applications',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/application/application.routes').then(
        (m) => m.applicationRoutes
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('ADMIN')],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
