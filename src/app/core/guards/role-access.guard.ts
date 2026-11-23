import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { hasAnyRole } from '../auth/role-access';
import { AuthService } from '../services/auth.service';

export const roleAccessGuard: CanActivateFn = (route) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as string[] | undefined;

  if (!allowedRoles?.length) {
    return true;
  }

  return authService.currentUser().pipe(
    map((user) => (hasAnyRole(user.roles, allowedRoles) ? true : router.createUrlTree(['/admin/dashboard']))),
    catchError(() => of(router.createUrlTree(['/admin/login'])))
  );
};
