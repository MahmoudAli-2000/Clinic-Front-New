import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CurrentUser } from '../../core/services/auth.service';
import {
  ClinicApiService,
  PrescriptionListItem,
  VisitListItem,
} from '../../core/services/clinic-api.service';

type CareSection = 'visits' | 'prescriptions' | 'profile';

@Component({
  selector: 'app-personal-care',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personal-care.component.html',
  styleUrl: './personal-care.component.css'
})
export class PersonalCareComponent implements OnInit {
  section: CareSection = 'visits';
  currentUser: CurrentUser | null = null;
  visits: VisitListItem[] = [];
  prescriptions: PrescriptionListItem[] = [];
  isLoading = true;
  errorMessage = '';
  pageTitle = 'My care';

  private readonly auth = inject(AuthService);
  private readonly api = inject(ClinicApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }
    this.route.data.subscribe((data) => {
      this.section = (data['section'] ?? 'visits') as CareSection;
      this.pageTitle = this.section === 'profile'
        ? 'My profile'
        : this.section === 'prescriptions' ? 'Prescriptions' : 'My visits';
      this.load();
    });
  }

  private load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.auth.currentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        if (this.section === 'profile') {
          this.isLoading = false;
          return;
        }

        const patientId = user.patientId;
        if (this.section === 'visits' && patientId) {
          this.api.getPatientVisits(patientId).subscribe({
            next: (result) => {
              this.visits = result;
              this.isLoading = false;
            },
            error: () => this.fail('Unable to load your visit history.')
          });
          return;
        }

        if (this.section === 'prescriptions' && patientId) {
          this.api.getPatientPrescriptions(patientId).subscribe({
            next: (result) => {
              this.prescriptions = result;
              this.isLoading = false;
            },
            error: () => this.fail('Unable to load your prescriptions.')
          });
          return;
        }

        if (this.section === 'prescriptions' && user.doctorId) {
          this.api.getDoctorPrescriptions(user.doctorId).subscribe({
            next: (result) => {
              this.prescriptions = result;
              this.isLoading = false;
            },
            error: () => this.fail('Unable to load your prescription history.')
          });
          return;
        }

        this.fail('Your account is not linked to the required clinic record yet.');
      },
      error: () => this.fail('Unable to load your account details.')
    });
  }

  private fail(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }
}
