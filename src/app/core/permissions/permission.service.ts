import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Action, ROLE_PERMISSIONS } from './permissions';
import { UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly auth = inject(AuthService);

  private readonly allowedActions = computed<Action[]>(() => {
    const role = this.auth.role();
    if (!role) return [];
    return ROLE_PERMISSIONS[role] ?? [];
  });

  can(action: Action): boolean {
    return this.allowedActions().includes(action);
  }

  canAny(...actions: Action[]): boolean {
    return actions.some((a) => this.can(a));
  }

  canAll(...actions: Action[]): boolean {
    return actions.every((a) => this.can(a));
  }

  isRole(role: UserRole): boolean {
    return this.auth.role() === role;
  }
}
