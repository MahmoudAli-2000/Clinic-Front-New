import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, Subject } from 'rxjs';

export interface CurrentUser {
  id: string;
  imageCover?: string;
  fullName: string;
  email: string;
  isActive: boolean;
  emailConfirmed: boolean;
  roles: string[];
  patientId: number | null;
  staffId: number | null;
  doctorId: number | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = '/api/auth';
  profileChanged = new Subject<CurrentUser>();

  login(credentials: { email: string; password: string }): Observable<unknown> {
    return this.http.post(`${this.authUrl}/login`, credentials, { withCredentials: true });
  }

  Login(credentials: { email: string; password: string }): Observable<unknown> {
    return this.login(credentials);
  }

  register(data: { fullName: string; email: string; password: string; phone?: string }): Observable<unknown> {
    return this.http.post(`${this.authUrl}/register`, data, { withCredentials: true });
  }

  Register(data: { fullName: string; email: string; password: string; phone?: string }): Observable<unknown> {
    return this.register(data);
  }

  currentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.authUrl}/me`, { withCredentials: true });
  }

  checkAuth(): Observable<boolean> {
    return this.currentUser().pipe(
      map((user) => !!user && user.isActive),
      catchError(() => of(false))
    );
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.authUrl}/logout`, {}, { withCredentials: true });
  }

  LogOut(): Observable<unknown> {
    return this.logout();
  }
}
