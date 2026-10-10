import { Component, inject, input, output, signal, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  sidebarCollapsed = input(false);
  toggleSidebar    = output<void>();

  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly user        = this.auth.user;
  readonly menuOpen    = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.app-header__user-wrap')) {
      this.menuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
  }

  getPageTitle(): string {
    const path = this.router.url.split('?')[0];
    if (path.startsWith('/dashboard'))        return 'Dashboard';
    if (path.startsWith('/applications/new')) return 'New Application';
    if (path.match(/\/applications\/.+/))     return 'Application Detail';
    if (path.startsWith('/admin'))            return 'Admin Panel';
    return 'TechCraft Portal';
  }
}
