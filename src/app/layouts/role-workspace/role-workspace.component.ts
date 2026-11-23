import { NotificationCenterService } from '../../core/services/notification-center.service';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';
import { FormsModule } from '@angular/forms';
import { UiPipe } from '../../core/pipes/ui.pipe';
import { AppearanceService } from '../../core/services/appearance.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { CurrentUser, AuthService } from '../../core/services/auth.service';
import { getPrimaryRole, ROLE_NAVIGATION, RoleNavigationItem } from '../../core/auth/role-access';

@Component({
  selector: 'app-role-workspace',
  standalone: true,
  imports: [FormsModule, UiPipe, CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './role-workspace.component.html',
  styleUrl: './role-workspace.component.css',
})
export class RoleWorkspaceComponent implements OnInit, OnDestroy {
  notificationCenter = inject(NotificationCenterService);
  language = inject(LanguageService);
  private appearance = inject(AppearanceService);
  currentUser: CurrentUser | null = null;
  isMenuOpen = false;
  readonly navigation = ROLE_NAVIGATION;
  visibleNavigation: RoleNavigationItem[] = [];

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);

  private profileSubscription?: Subscription;
  ngOnDestroy() {
    this.profileSubscription?.unsubscribe();
  }
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.auth.currentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.appearance.load(user.id);
        this.notificationCenter.refresh();
        this.language.load(user.id);
        this.profileSubscription = this.auth.profileChanged.subscribe((updated) => {
          this.currentUser = updated;
          this.photoFailed = false;
        });
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

  photoFailed = false;
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
        this.notificationCenter.reset();
        this.language.reset();
        this.toast.success(this.language.t('You have been signed out.'), this.language.t('Signed out'));
        this.router.navigate(['/admin/login']);
      },
      error: () =>
        this.toast.error(
          this.language.t('Unable to end your session. Please try again.'),
          this.language.t('Sign out failed')
        ),
    });
  }
}
