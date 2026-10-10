import { Routes } from '@angular/router';

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
