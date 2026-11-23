import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve checkAuth to true when user is active', () => {
    let result: boolean | undefined;

    service.checkAuth().subscribe((value) => {
      result = value;
    });

    const req = httpMock.expectOne('/api/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush({
      id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
      isActive: true,
      emailConfirmed: true,
      roles: ['Admin'],
      patientId: null,
      staffId: null,
      doctorId: null,
    });

    expect(result).toBeTrue();
  });

  it('should resolve checkAuth to false when the current user request fails', () => {
    let result: boolean | undefined;

    service.checkAuth().subscribe((value) => {
      result = value;
    });

    const req = httpMock.expectOne('/api/auth/me');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(result).toBeFalse();
  });
});
