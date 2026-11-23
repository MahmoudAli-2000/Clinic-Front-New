import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { authGuardGuard } from './auth-guard.guard';

describe('authGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { checkAuth: jasmine.createSpy('checkAuth').and.returnValue(of(true)) } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    });
  });

  it('should allow the user through when authenticated', async () => {
    const allowed = await firstValueFrom(executeGuard({} as any, { url: '/admin/dashboard' } as any) as any);
    expect(allowed).toBeTrue();
  });

  it('should redirect unauthenticated users to the login page', async () => {
    const authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.checkAuth.and.returnValue(of(false));

    const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    const allowed = await firstValueFrom(executeGuard({} as any, { url: '/admin/patients' } as any) as any);

    expect(allowed).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login'], { queryParams: { returnUrl: '/admin/patients' } });
  });
});
