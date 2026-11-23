export type ClinicRole = 'Admin' | 'Manager' | 'Receptionist' | 'Doctor' | 'Nurse' | 'Patient';

export interface RoleNavigationItem {
  label: string;
  path: string;
  icon: string;
  roles: ClinicRole[];
}

export const CLINIC_ROLES: ClinicRole[] = [
  'Admin',
  'Manager',
  'Receptionist',
  'Doctor',
  'Nurse',
  'Patient',
];

export const ROLE_NAVIGATION: RoleNavigationItem[] = [
  { label: 'Overview', path: '/admin/dashboard', icon: 'fa-chart-pie', roles: CLINIC_ROLES },
  { label: 'Appointments', path: '/admin/appointments', icon: 'fa-calendar-check', roles: CLINIC_ROLES },
  { label: 'Patients', path: '/admin/patients', icon: 'fa-user-injured', roles: ['Admin', 'Manager', 'Receptionist'] },
  { label: 'Doctors', path: '/admin/doctors', icon: 'fa-user-md', roles: ['Admin', 'Manager', 'Receptionist', 'Doctor', 'Nurse', 'Patient'] },
  { label: 'Clinics', path: '/admin/clinics', icon: 'fa-hospital', roles: CLINIC_ROLES },
  { label: 'Schedules', path: '/admin/schedules', icon: 'fa-clock', roles: ['Admin', 'Manager', 'Doctor', 'Patient'] },
  { label: 'Specialties', path: '/admin/services', icon: 'fa-stethoscope', roles: CLINIC_ROLES },
  { label: 'Staff', path: '/admin/staff', icon: 'fa-user-nurse', roles: ['Admin', 'Manager'] },
  { label: 'My visits', path: '/admin/visits', icon: 'fa-notes-medical', roles: ['Patient'] },
  { label: 'Prescriptions', path: '/admin/prescriptions', icon: 'fa-prescription', roles: ['Doctor', 'Patient'] },
  { label: 'My profile', path: '/admin/profile', icon: 'fa-id-card', roles: ['Patient'] },
];

export function getPrimaryRole(roles: string[] | null | undefined): ClinicRole | null {
  if (!roles?.length) {
    return null;
  }

  const normalizedRoles = new Set(roles.map((role) => role.trim().toLowerCase()));
  return CLINIC_ROLES.find((role) => normalizedRoles.has(role.toLowerCase())) ?? null;
}

export function hasAnyRole(userRoles: string[] | null | undefined, allowedRoles: string[]): boolean {
  const normalizedRoles = new Set((userRoles ?? []).map((role) => role.trim().toLowerCase()));
  return allowedRoles.some((role) => normalizedRoles.has(role.toLowerCase()));
}
