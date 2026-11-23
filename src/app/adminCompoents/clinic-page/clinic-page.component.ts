import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import {
  AppointmentListItem,
  ClinicApiService,
  ClinicListItem,
  DoctorListItem,
  PatientListItem,
  ScheduleListItem,
  StaffListItem,
  SpecialtyListItem,
} from '../../core/services/clinic-api.service';

type ClinicSection = 'patients' | 'doctors' | 'appointments' | 'clinics' | 'schedules' | 'services' | 'staff';

@Component({
  selector: 'app-clinic-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './clinic-page.component.html',
  styleUrl: './clinic-page.component.css'
})
export class ClinicPageComponent implements OnInit {
  private readonly api = inject(ClinicApiService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);

  section: ClinicSection = 'appointments';
  patients: PatientListItem[] = [];
  doctors: DoctorListItem[] = [];
  appointments: AppointmentListItem[] = [];
  clinics: ClinicListItem[] = [];
  schedules: ScheduleListItem[] = [];
  services: SpecialtyListItem[] = [];
  staff: StaffListItem[] = [];
  isLoading = false;
  errorMessage = '';
  pageTitle = 'Appointments';
  totalCount = 0;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }
    this.route.data.subscribe((data) => {
      this.section = (data['section'] ?? 'appointments') as ClinicSection;
      this.pageTitle = this.formatSection(this.section);
      this.loadSection();
    });
  }

  private loadSection(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.totalCount = 0;
    this.patients = [];
    this.doctors = [];
    this.appointments = [];
    this.clinics = [];
    this.schedules = [];
    this.services = [];
    this.staff = [];

    switch (this.section) {
      case 'patients':
        this.api.searchPatients(1, 10)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: (result) => {
              this.patients = result.data;
              this.totalCount = result.count;
            },
            error: () => this.setError('Unable to load patients right now.')
          });
        break;
      case 'doctors':
        this.api.searchDoctors(1, 10)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: (result) => {
              this.doctors = result.data;
              this.totalCount = result.count;
            },
            error: () => this.setError('Unable to load doctors right now.')
          });
        break;
      case 'appointments':
        this.auth.currentUser().pipe(
          switchMap((user) => this.api.searchAppointments(1, 10, '', {
            patientId: user.patientId ?? undefined,
            doctorId: user.doctorId ?? undefined,
          })),
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: (result) => {
            this.appointments = result.data;
            this.totalCount = result.count;
          },
          error: () => this.setError('Unable to load appointments right now.')
        });
        break;
      case 'clinics':
        this.api.searchClinics(1, 10)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: (result) => {
              this.clinics = result.data;
              this.totalCount = result.count;
            },
            error: () => this.setError('Unable to load clinics right now.')
          });
        break;
      case 'schedules':
        this.auth.currentUser().pipe(
          switchMap((user) => user.doctorId
            ? this.api.getSchedulesByDoctor(user.doctorId)
            : this.api.searchClinics(1, 1).pipe(
              switchMap((clinics) => clinics.data.length
                ? this.api.getSchedulesByClinic(clinics.data[0].id)
                : of([])
              )
            )),
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: (result) => {
            this.schedules = result;
            this.totalCount = result.length;
          },
          error: () => this.setError('Unable to load schedules right now.')
        });
        break;
      case 'services':
        this.api.searchSpecialties(1, 10)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: (result) => {
              this.services = result.data;
              this.totalCount = result.count;
            },
            error: () => this.setError('Unable to load specialties right now.')
          });
        break;
      case 'staff':
        this.api.searchStaff(1, 10)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: (result) => {
              this.staff = result.data;
              this.totalCount = result.count;
            },
            error: () => this.setError('Unable to load staff right now.')
          });
        break;
    }
  }

  private setError(message: string): void {
    this.errorMessage = message;
  }

  confirmAppointment(id: number): void {
    this.api.confirmAppointment(id).subscribe({
      next: () => this.loadSection(),
      error: () => this.setError('Unable to confirm this appointment.')
    });
  }

  checkInAppointment(id: number): void {
    this.api.checkInAppointment(id).subscribe({
      next: () => this.loadSection(),
      error: () => this.setError('Unable to check in this appointment.')
    });
  }

  completeAppointment(id: number): void {
    this.api.completeAppointment(id).subscribe({
      next: () => this.loadSection(),
      error: () => this.setError('Unable to complete this appointment.')
    });
  }

  cancelAppointment(id: number): void {
    this.api.cancelAppointment(id).subscribe({
      next: () => this.loadSection(),
      error: () => this.setError('Unable to cancel this appointment.')
    });
  }

  private formatSection(section: string): string {
    const labels: Record<string, string> = {
      patients: 'Patients',
      doctors: 'Doctors',
      appointments: 'Appointments',
      clinics: 'Clinics',
      schedules: 'Schedules',
      services: 'Specialties',
      staff: 'Clinic staff',
    };
    return labels[section] ?? 'Clinic workspace';
  }
}
