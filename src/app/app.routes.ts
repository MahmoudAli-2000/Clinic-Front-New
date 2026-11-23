import { Route, Routes } from '@angular/router';
import { authGuardGuard } from './core/guards/auth-guard.guard';
import { logedGuard } from './core/guards/loged.guard';
import { roleAccessGuard } from './core/guards/role-access.guard';
import { ClinicRole } from './core/auth/role-access';

const allRoles: ClinicRole[] = ['Admin', 'Manager', 'Receptionist', 'Doctor', 'Nurse', 'Patient'];
const frontDeskRoles: ClinicRole[] = ['Admin', 'Manager', 'Receptionist'];
const adminManagerRoles: ClinicRole[] = ['Admin', 'Manager'];
const patientRole: ClinicRole[] = ['Patient'];
const careRoles: ClinicRole[] = ['Doctor', 'Patient'];

function clinicPage(path: string, section: string, roles: ClinicRole[]): Route {
  return {
    path,
    loadComponent: () => import('./adminCompoents/clinic-page/clinic-page.component').then((module) => module.ClinicPageComponent),
    canActivate: [authGuardGuard, roleAccessGuard],
    data: { section, roles },
    title: section.charAt(0).toUpperCase() + section.slice(1)
  };
}

function personalPage(path: string, section: string, roles: ClinicRole[]): Route {
  return {
    path,
    loadComponent: () => import('./adminCompoents/personal-care/personal-care.component').then((module) => module.PersonalCareComponent),
    canActivate: [authGuardGuard, roleAccessGuard],
    data: { section, roles },
    title: section.charAt(0).toUpperCase() + section.slice(1)
  };
}

export const routes: Routes = [
  { path: '', redirectTo: '/admin/login', pathMatch: 'full' },
  {
    path: 'admin/login',
    loadComponent: () => import('./adminCompoents/login/login.component').then((module) => module.LoginComponent),
    canActivate: [logedGuard],
    title: 'Sign in'
  },
  {
    path: 'admin/register',
    loadComponent: () => import('./adminCompoents/register/register.component').then((module) => module.RegisterComponent),
    title: 'Register'
  },
  {
    path: 'admin',
    loadComponent: () => import('./layouts/role-workspace/role-workspace.component').then((module) => module.RoleWorkspaceComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./adminCompoents/role-dashboard/role-dashboard.component').then((module) => module.RoleDashboardComponent),
        canActivate: [authGuardGuard, roleAccessGuard],
        data: { roles: allRoles },
        title: 'Overview'
      },
      clinicPage('appointments', 'appointments', allRoles),
      clinicPage('patients', 'patients', frontDeskRoles),
      clinicPage('doctors', 'doctors', allRoles),
      clinicPage('clinics', 'clinics', allRoles),
      clinicPage('schedules', 'schedules', ['Admin', 'Manager', 'Doctor', 'Patient']),
      clinicPage('services', 'services', allRoles),
      clinicPage('staff', 'staff', adminManagerRoles),
      personalPage('visits', 'visits', patientRole),
      personalPage('prescriptions', 'prescriptions', careRoles),
      personalPage('profile', 'profile', patientRole),
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '/admin/login' }
];
