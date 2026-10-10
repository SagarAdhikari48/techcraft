import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PermissionService } from '../../core/permissions/permission.service';
import { AuthService } from '../../core/auth/auth.service';

interface NavLink {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  collapsed = input(false);
  closeMobile = output<void>();

  private readonly permissions = inject(PermissionService);
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;

  readonly navLinks = computed<NavLink[]>(() => {
    const links: NavLink[] = [
      { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/dashboard', exact: true },
    ];

    if (this.permissions.can('application:create')) {
      links.push({ label: 'New Application', icon: 'bi-plus-circle', route: '/applications/new' });
    }

    if (this.permissions.can('admin:access')) {
      links.push({ label: 'Admin', icon: 'bi-shield-lock', route: '/admin' });
    }

    return links;
  });
}
