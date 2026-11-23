import { AppearanceService } from '../../core/services/appearance.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CurrentUser, AuthService } from '../../core/services/auth.service';
import { getPrimaryRole, ROLE_NAVIGATION, RoleNavigationItem } from '../../core/auth/role-access';

@Component({
  selector: 'app-role-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './role-workspace.component.html',
  styleUrl: './role-workspace.component.css',
})
export class RoleWorkspaceComponent implements OnInit {
  private appearance = inject(AppearanceService);
  currentUser: CurrentUser | null = null;
  isMenuOpen = false;
  readonly navigation = ROLE_NAVIGATION;
  visibleNavigation: RoleNavigationItem[] = [];

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.auth.currentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.appearance.load(user.id);
        const prefix = this.rolePrefix;
        this.visibleNavigation = this.navigation
          .filter((item) => item.roles.some((role) => user.roles.includes(role)))
          .map((item) => ({ ...item, path: item.path.replace('/admin', prefix) }));
        if (this.router.url.startsWith('/admin/') && prefix !== '/admin')
          this.router.navigateByUrl(this.router.url.replace('/admin/', prefix + '/'));
      },
      error: () => {
        this.currentUser = null;
        this.router.navigate(['/admin/login']);
      },
    });
  }

  get rolePrefix(): string {
    const role = getPrimaryRole(this.currentUser?.roles);
    return role === 'Patient'
      ? '/patient'
      : role === 'Doctor'
        ? '/doctor'
        : role === 'Nurse' || role === 'Receptionist'
          ? '/staff'
          : '/admin';
  }
  get roleLabel(): string {
    return getPrimaryRole(this.currentUser?.roles) ?? 'Clinic user';
  }

  get initials(): string {
    return (this.currentUser?.fullName ?? 'CU')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onLogout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.appearance.reset();
        this.toast.success('You have been signed out.', 'Signed out');
        this.router.navigate(['/admin/login']);
      },
      error: () => this.toast.error('Unable to end your session. Please try again.', 'Sign out failed'),
    });
  }
}
