import { ClinicDatePipe } from '../../core/pipes/clinic-date.pipe';
import { UiPipe } from '../../core/pipes/ui.pipe';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, CurrentUser } from '../../core/services/auth.service';
import { ClinicRole, getPrimaryRole } from '../../core/auth/role-access';
import { forkJoin, of, catchError } from 'rxjs';
import { WorkspaceApiService } from '../../core/services/workspace-api.service';
import { RecordData } from '../../core/interfaces/workspace';
import { ClinicApiService } from '../../core/services/clinic-api.service';

interface DashboardAction {
  title: string;
  description: string;
  path: string;
  icon: string;
  accent: string;
}

interface DashboardContent {
  heading: string;
  description: string;
  focus: string;
  actions: DashboardAction[];
}

const DASHBOARDS: Record<ClinicRole, DashboardContent> = {
  Admin: {
    heading: 'Clinic operations',
    description: 'Manage people, services, schedules and the day-to-day clinic workflow.',
    focus: 'Administration',
    actions: [
      {
        title: 'Patient directory',
        description: 'Review and manage patient records.',
        path: '/admin/patients',
        icon: 'fa-user-injured',
        accent: 'teal',
      },
      {
        title: 'Doctor directory',
        description: 'Review specialties and doctor profiles.',
        path: '/admin/doctors',
        icon: 'fa-user-md',
        accent: 'blue',
      },
      {
        title: 'Staff management',
        description: 'Open the clinic staff directory.',
        path: '/admin/staff',
        icon: 'fa-user-nurse',
        accent: 'violet',
      },
      {
        title: 'Appointments',
        description: 'Track and coordinate clinic bookings.',
        path: '/admin/appointments',
        icon: 'fa-calendar-check',
        accent: 'amber',
      },
    ],
  },
  Manager: {
    heading: 'Clinic operations',
    description: 'Coordinate service delivery, workforce and patient flow across the clinic.',
    focus: 'Operations',
    actions: [
      {
        title: 'Appointments',
        description: 'Review the booking and visit queue.',
        path: '/admin/appointments',
        icon: 'fa-calendar-check',
        accent: 'amber',
      },
      {
        title: 'Patients',
        description: 'Find and update patient records.',
        path: '/admin/patients',
        icon: 'fa-user-injured',
        accent: 'teal',
      },
      {
        title: 'Staff',
        description: 'Review the clinic staff directory.',
        path: '/admin/staff',
        icon: 'fa-user-nurse',
        accent: 'violet',
      },
      {
        title: 'Schedules',
        description: 'Review clinic availability.',
        path: '/admin/schedules',
        icon: 'fa-clock',
        accent: 'blue',
      },
    ],
  },
  Receptionist: {
    heading: 'Front desk',
    description: 'Keep arrivals, appointments and patient registration moving smoothly.',
    focus: 'Patient coordination',
    actions: [
      {
        title: 'Appointment queue',
        description: 'Review today’s appointments and their status.',
        path: '/admin/appointments',
        icon: 'fa-calendar-check',
        accent: 'amber',
      },
      {
        title: 'Patient directory',
        description: 'Find patients and manage registration details.',
        path: '/admin/patients',
        icon: 'fa-user-injured',
        accent: 'teal',
      },
      {
        title: 'Doctors',
        description: 'Browse the doctor and specialty directory.',
        path: '/admin/doctors',
        icon: 'fa-user-md',
        accent: 'blue',
      },
      {
        title: 'Clinics',
        description: 'View clinic locations and contact details.',
        path: '/admin/clinics',
        icon: 'fa-hospital',
        accent: 'violet',
      },
    ],
  },
  Doctor: {
    heading: 'Clinical workspace',
    description: 'Review your appointment schedule and access your clinical tools.',
    focus: 'Patient care',
    actions: [
      {
        title: 'My appointments',
        description: 'Review appointments linked to your doctor account.',
        path: '/admin/appointments',
        icon: 'fa-calendar-check',
        accent: 'amber',
      },
      {
        title: 'My schedule',
        description: 'Review your clinic availability.',
        path: '/admin/schedules',
        icon: 'fa-clock',
        accent: 'blue',
      },
      {
        title: 'Prescriptions',
        description: 'Review prescriptions associated with your account.',
        path: '/admin/prescriptions',
        icon: 'fa-prescription',
        accent: 'teal',
      },
      {
        title: 'Specialties',
        description: 'Browse clinic specialties and services.',
        path: '/admin/services',
        icon: 'fa-stethoscope',
        accent: 'violet',
      },
    ],
  },
  Nurse: {
    heading: 'Care team workspace',
    description: 'Coordinate patient flow and stay connected with the care team.',
    focus: 'Care coordination',
    actions: [
      {
        title: 'Appointments',
        description: 'Review clinic appointments and arrivals.',
        path: '/admin/appointments',
        icon: 'fa-calendar-check',
        accent: 'amber',
      },
      {
        title: 'Doctors',
        description: 'Browse doctors and their specialties.',
        path: '/admin/doctors',
        icon: 'fa-user-md',
        accent: 'blue',
      },
      {
        title: 'Clinics',
        description: 'View clinic locations and details.',
        path: '/admin/clinics',
        icon: 'fa-hospital',
        accent: 'violet',
      },
    ],
  },
  Patient: {
    heading: 'Your care, in one place',
    description: 'Keep track of your appointments, care history and prescriptions.',
    focus: 'My health',
    actions: [
      {
        title: 'My appointments',
        description: 'See your upcoming and previous bookings.',
        path: '/admin/appointments',
        icon: 'fa-calendar-check',
        accent: 'amber',
      },
      {
        title: 'My visits',
        description: 'Review your visit history and clinical notes.',
        path: '/admin/visits',
        icon: 'fa-notes-medical',
        accent: 'teal',
      },
      {
        title: 'Prescriptions',
        description: 'Review your prescription history.',
        path: '/admin/prescriptions',
        icon: 'fa-prescription',
        accent: 'blue',
      },
      {
        title: 'Find a doctor',
        description: 'Browse doctors and their specialties.',
        path: '/admin/doctors',
        icon: 'fa-user-md',
        accent: 'violet',
      },
    ],
  },
};

@Component({
  selector: 'app-role-dashboard',
  standalone: true,
  imports: [ClinicDatePipe, UiPipe, CommonModule, RouterLink],
  templateUrl: './role-dashboard.component.html',
  styleUrl: './role-dashboard.component.css',
})
export class RoleDashboardComponent implements OnInit {
  currentUser: CurrentUser | null = null;
  role: ClinicRole = 'Patient';
  content = DASHBOARDS.Patient;
  isLoading = true;
  loadError = false;
  appointmentCount: number | null = null;
  upcoming: RecordData[] = [];
  recentNotifications: RecordData[] = [];
  today = new Date();
  dataWarning = false;
  private workspaceApi = inject(WorkspaceApiService);
  unreadNotifications: number | null = null;
  personalVisitCount: number | null = null;
  personalPrescriptionCount: number | null = null;

  private readonly auth = inject(AuthService);
  private readonly api = inject(ClinicApiService);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }
    this.auth.currentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.role = getPrimaryRole(user.roles) ?? 'Patient';
        this.content = DASHBOARDS[this.role];
        this.loadDashboardData(user);
      },
      error: () => {
        this.loadError = true;
        this.isLoading = false;
      },
    });
  }

  private loadDashboardData(user: CurrentUser): void {
    const safe = (source: any) =>
      source.pipe(
        catchError(() => {
          this.dataWarning = true;
          return of(null);
        })
      );
    forkJoin({
      appointments: safe(
        this.api.searchAppointments(1, 6, '', {
          patientId: user.patientId ?? undefined,
          doctorId: user.doctorId ?? undefined,
        })
      ),
      unread: safe(this.api.getUnreadNotificationCount()),
      notifications: safe(this.api.getNotifications(1, 4)),
      visits: user.patientId ? safe(this.api.getPatientVisits(user.patientId)) : of(null),
      prescriptions: user.patientId
        ? safe(this.api.getPatientPrescriptions(user.patientId))
        : user.doctorId
          ? safe(this.api.getDoctorPrescriptions(user.doctorId))
          : of(null),
    }).subscribe((result: any) => {
      this.appointmentCount = result.appointments?.count ?? null;
      this.upcoming = result.appointments?.data ?? [];
      this.unreadNotifications = result.unread;
      this.recentNotifications = result.notifications?.data ?? [];
      this.personalVisitCount = result.visits?.length ?? null;
      this.personalPrescriptionCount = result.prescriptions?.length ?? null;
      this.isLoading = false;
    });
  }

  get firstName(): string {
    return this.currentUser?.fullName?.trim().split(/\s+/)[0] ?? 'there';
  }
}
