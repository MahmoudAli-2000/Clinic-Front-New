import { ClinicDatePipe } from '../../core/pipes/clinic-date.pipe';
import { UiPipe } from '../../core/pipes/ui.pipe';
import { AppearanceService, Appearance, DEFAULT_APPEARANCE } from '../../core/services/appearance.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService, CurrentUser } from '../../core/services/auth.service';
import { WorkspaceApiService, apiError } from '../../core/services/workspace-api.service';
import { FormField, RecordData } from '../../core/interfaces/workspace';
import { EntityFormComponent } from '../../shared/entity-form/entity-form.component';
@Component({
  selector: 'app-account-center',
  standalone: true,
  imports: [ClinicDatePipe, UiPipe, CommonModule, FormsModule, RouterLink, EntityFormComponent],
  templateUrl: './account-center.component.html',
  styleUrl: './account-center.component.css',
})
export class AccountCenterComponent implements OnInit {
  api = inject(WorkspaceApiService);
  auth = inject(AuthService);
  route = inject(ActivatedRoute);
  platform = inject(PLATFORM_ID);
  appearanceService = inject(AppearanceService);
  appearance: Appearance = { ...DEFAULT_APPEARANCE };
  section = 'notifications';
  user: CurrentUser | null = null;
  loading = true;
  busy = false;
  error = '';
  success = '';
  rows: RecordData[] = [];
  preferences: RecordData = {};
  profile: RecordData = {};
  password: RecordData = {};
  doctors: RecordData[] = [];
  clinics: RecordData[] = [];
  doctorId = 0;
  clinicId = 0;
  patientId: number | null = null;
  reviewType = 'doctor';
  stats: RecordData = {};
  page = 1;
  total = 0;
  unreadOnly = false;
  modal = false;
  fields: FormField[] = [];
  value: RecordData = {};
  modalTitle = '';
  action = '';
  target: RecordData = {};
  preferenceKeys = [
    'allowInApp',
    'allowEmail',
    'allowSMS',
    'allowPush',
    'allowWhatsApp',
    'appointmentReminders',
    'generalUpdates',
  ];
  async ngOnInit() {
    if (!isPlatformBrowser(this.platform)) {
      this.loading = false;
      return;
    }
    try {
      this.user = await firstValueFrom(this.auth.currentUser());
      this.patientId = this.user.patientId;
      this.route.data.subscribe((data) => {
        this.section = data['section'];
        this.page = 1;
        this.rows = [];
        this.error = '';
        this.init();
      });
    } catch (e) {
      this.fail(e);
    }
  }
  get title() {
    return (
      (
        {
          notifications: 'Notifications',
          settings: 'Account settings',
          reviews: 'Patient feedback',
          'time-off': 'Doctor time off',
          prescriptions: 'Prescriptions',
        } as Record<string, string>
      )[this.section] || this.section
    );
  }
  get clinical() {
    return this.user?.roles.some((r) => ['Admin', 'Manager', 'Doctor', 'Nurse'].includes(r)) ?? false;
  }
  get desk() {
    return this.user?.roles.some((r) => ['Admin', 'Manager', 'Receptionist'].includes(r)) ?? false;
  }
  async init() {
    this.loading = true;
    try {
      if (this.section === 'settings') {
        this.appearance = await firstValueFrom(this.api.get<Appearance>('Appearance'));
        this.appearanceService.apply(this.appearance);
        this.profile = { fullName: this.user?.fullName };
        this.preferences = await firstValueFrom(this.api.get('Notifications/preferences'));
      }
      if (['time-off', 'reviews'].includes(this.section)) {
        this.doctors = (await firstValueFrom(this.api.get('Doctors', { pageSize: 100 }))).data;
        this.clinics = (await firstValueFrom(this.api.get('Clinics', { pageSize: 100 }))).data;
        this.doctorId = this.user?.doctorId || this.doctors[0]?.['id'] || 0;
        this.clinicId = this.clinics[0]?.['id'] || 0;
      }
      await this.load();
    } catch (e) {
      this.fail(e);
    } finally {
      this.loading = false;
    }
  }
  async load() {
    this.error = '';
    this.loading = true;
    try {
      if (this.section === 'notifications') {
        const r = await firstValueFrom(
          this.api.get('Notifications', { pageIndex: this.page, pageSize: 10, unreadOnly: this.unreadOnly })
        );
        this.rows = r.data;
        this.total = r.count;
      }
      if (this.section === 'time-off')
        this.rows = this.doctorId
          ? await firstValueFrom(this.api.get(`Schedules/timeoffs/${this.doctorId}`))
          : [];
      if (this.section === 'reviews') {
        const id = this.reviewType === 'doctor' ? this.doctorId : this.clinicId;
        if (id) {
          const path = `Reviews/${this.reviewType}/${id}`;
          [this.rows, this.stats] = await Promise.all([
            firstValueFrom(this.api.get(path)),
            firstValueFrom(this.api.get(`${path}/stats`)),
          ]);
        }
      }
      if (this.section === 'prescriptions') {
        if (this.user?.doctorId)
          this.rows = await firstValueFrom(this.api.get(`Prescriptions/doctor/${this.user.doctorId}`));
        else if (this.patientId)
          this.rows = await firstValueFrom(this.api.get(`Prescriptions/patient/${this.patientId}`));
      }
    } catch (e) {
      this.fail(e);
    } finally {
      this.loading = false;
    }
  }
  async markRead(row?: RecordData) {
    this.busy = true;
    try {
      await firstValueFrom(
        this.api.put(row ? `Notifications/${row['id']}/read` : 'Notifications/read-all', {})
      );
      await this.load();
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy = false;
    }
  }
  previewAppearance() {
    this.appearanceService.apply(this.appearance);
  }
  resetAppearance() {
    this.appearance = { ...DEFAULT_APPEARANCE };
    this.previewAppearance();
  }
  async saveAppearance() {
    this.busy = true;
    this.error = '';
    try {
      this.appearance = await firstValueFrom(this.appearanceService.save(this.appearance));
      this.appearanceService.apply(this.appearance);
      this.success = 'Your appearance settings are saved to your account.';
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy = false;
    }
  }
  async uploadPhoto(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('image', file);
    this.busy = true;
    this.error = '';
    try {
      this.user = await firstValueFrom(this.api.post<CurrentUser>('Profile/photo', form));
      this.auth.profileChanged.next(this.user);
      this.success = 'Photo uploaded.';
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy = false;
    }
  }
  async saveSettings(kind: string) {
    this.busy = true;
    this.error = '';
    try {
      const path =
        kind === 'preferences'
          ? 'Notifications/preferences'
          : kind === 'profile'
            ? 'Auth/me'
            : 'Auth/change-password';
      const data =
        kind === 'preferences' ? this.preferences : kind === 'profile' ? this.profile : this.password;
      if (kind === 'password') await firstValueFrom(this.api.post(path, data));
      else {
        const result = await firstValueFrom(this.api.put(path, data));
        if (kind === 'profile') {
          this.user = result;
          this.auth.profileChanged.next(result);
        }
      }
      this.success = kind === 'password' ? 'Password changed.' : 'Settings saved.';
      this.password = {};
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy = false;
    }
  }
  async removeTimeOff(id: number) {
    if (!confirm('Delete this time-off entry?')) return;
    try {
      await firstValueFrom(this.api.delete(`Schedules/timeoffs/${id}`));
      await this.load();
    } catch (e) {
      this.fail(e);
    }
  }
  label(key: string) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
  }
  openStatus(row: RecordData) {
    this.target = row;
    this.fields = [
      {
        key: 'status',
        label: 'Prescription status',
        type: 'select',
        required: true,
        options: ['Active', 'Completed', 'Cancelled', 'Expired'].map((value) => ({ value, label: value })),
      },
    ];
    this.value = { status: row['status'] };
    this.modalTitle = 'Update prescription status';
    this.modal = true;
  }
  async saveStatus(value: RecordData) {
    this.busy = true;
    try {
      await firstValueFrom(this.api.put(`Prescriptions/${this.target['id']}/status`, null, value));
      this.modal = false;
      await this.load();
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy = false;
    }
  }
  print() {
    window.print();
  }
  fail(e: any) {
    this.error = apiError(e);
    this.loading = false;
  }
}
