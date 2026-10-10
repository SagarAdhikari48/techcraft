import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

/**
 * Root application configuration.
 * Providers here are available application-wide (singleton scope).
 *
 * Interceptors will be registered here once built:
 *   withInterceptors([authInterceptor])
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(), // bind route params to @Input()
      withViewTransitions()        // smooth route transitions
    ),
    provideHttpClient(
      withInterceptors([
        // authInterceptor  ← wired in Phase 1.3
      ])
    ),
  ],
};
