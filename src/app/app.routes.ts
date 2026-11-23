import { Route, Routes } from '@angular/router';
import { authGuardGuard } from './core/guards/auth-guard.guard';
import { logedGuard } from './core/guards/loged.guard';
import { roleAccessGuard } from './core/guards/role-access.guard';
import { ClinicRole } from './core/auth/role-access';

const allRoles: ClinicRole[] = ['Admin', 'Manager', 'Receptionist', 'Doctor', 'Nurse', 'Patient'];
const frontDeskRoles: ClinicRole[] = ['Admin', 'Manager', 'Receptionist'];
const adminManagerRoles: ClinicRole[] = ['Admin', 'Manager'];
const patientRole: ClinicRole[] = ['Patient'];
const clinicalRoles: ClinicRole[] = ['Admin','Manager','Doctor','Nurse'];
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

function accountPage(path: string, section: string, roles: ClinicRole[]): Route {
 return {path,loadComponent:()=>import('./adminCompoents/account-center/account-center.component').then(m=>m.AccountCenterComponent),canActivate:[authGuardGuard,roleAccessGuard],data:{section,roles},title:section};
}
function chartPage(path:string, roles:ClinicRole[]):Route {
 return {path,loadComponent:()=>import('./adminCompoents/clinical-chart/clinical-chart.component').then(m=>m.ClinicalChartComponent),canActivate:[authGuardGuard,roleAccessGuard],data:{roles},title:'Clinical chart'};
}

const baseRoutes: Routes = [
  { path: '', redirectTo: '/admin/login', pathMatch: 'full' },
  ...['forgot-password','reset-password','confirm-email'].flatMap(mode => [{path:mode,loadComponent:()=>import('./adminCompoents/account-recovery/account-recovery.component').then(m=>m.AccountRecoveryComponent),data:{mode},title:'Account access'}, {path:'admin/'+mode,loadComponent:()=>import('./adminCompoents/account-recovery/account-recovery.component').then(m=>m.AccountRecoveryComponent),data:{mode},title:'Account access'}]),
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
      clinicPage('schedules', 'schedules', allRoles),
      clinicPage('services', 'services', allRoles),
      clinicPage('staff', 'staff', adminManagerRoles),
      chartPage('visits',allRoles),
      chartPage('clinical/:id',allRoles),
      accountPage('prescriptions','prescriptions',[...clinicalRoles,'Patient']),
      accountPage('profile','settings',allRoles),
      accountPage('settings','settings',allRoles),
      accountPage('notifications','notifications',allRoles),
      accountPage('reviews','reviews',allRoles),
      accountPage('time-off','time-off',allRoles),
      clinicPage('medications','medications',allRoles),
      clinicPage('users','users',adminManagerRoles),
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '/admin/login' }
];

const workspace = baseRoutes.find(route=>route.path==='admin')!;
export const routes:Routes = [
 ...baseRoutes.filter(route=>route.path!=='**'),
 ...(['patient','doctor','staff'] as const).map(role=>({
   path:role,
   loadComponent:()=>role==='patient'?import('./layouts/patient-layout/patient-layout.component').then(m=>m.PatientLayoutComponent):role==='doctor'?import('./layouts/doctor-layout/doctor-layout.component').then(m=>m.DoctorLayoutComponent):import('./layouts/staff-layout/staff-layout.component').then(m=>m.StaffLayoutComponent),
   canActivate:[authGuardGuard,roleAccessGuard],
   data:{roles:role==='patient'?['Patient']:role==='doctor'?['Doctor']:['Nurse','Receptionist']},
   children:workspace.children
 })),
 {path:'**',redirectTo:'/admin/login'}
];
