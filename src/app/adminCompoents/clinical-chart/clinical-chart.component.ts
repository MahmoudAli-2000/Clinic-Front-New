import { ClinicDatePipe } from '../../core/pipes/clinic-date.pipe';
import { UiPipe } from '../../core/pipes/ui.pipe';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { WorkspaceApiService, apiError } from '../../core/services/workspace-api.service';
import { AuthService, CurrentUser } from '../../core/services/auth.service';
import { FormField, RecordData } from '../../core/interfaces/workspace';
import { EntityFormComponent } from '../../shared/entity-form/entity-form.component';
@Component({
  selector: 'app-clinical-chart',
  standalone: true,
  imports: [ClinicDatePipe, UiPipe, CommonModule, FormsModule, RouterLink, EntityFormComponent],
  templateUrl: './clinical-chart.component.html',
  styleUrl: './clinical-chart.component.css',
})
export class ClinicalChartComponent implements OnInit {
  api = inject(WorkspaceApiService);
  auth = inject(AuthService);
  route = inject(ActivatedRoute);
  platform = inject(PLATFORM_ID);
  user: CurrentUser | null = null;
  visits: RecordData[] = [];
  visit: RecordData | null = null;
  prescriptions: RecordData[] = [];
  medications: RecordData[] = [];
  patientId: number | null = null;
  loading = true;
  busy = false;
  error = '';
  success = '';
  modal = false;
  fields: FormField[] = [];
  value: RecordData = {};
  action = '';
  editId?: number;
  items: RecordData[] = [{ medicationId: undefined, dose: '', frequency: '', durationDays: 1 }];
  prescriptionNotes = '';
  prescribe = false;
  get clinical() {
    return this.user?.roles.some((r) => ['Admin', 'Manager', 'Doctor', 'Nurse'].includes(r)) ?? false;
  }
  get doctor() {
    return this.user?.roles.includes('Doctor') ?? false;
  }
  async ngOnInit() {
    if (!isPlatformBrowser(this.platform)) {
      this.loading = false;
      return;
    }
    try {
      this.user = await firstValueFrom(this.auth.currentUser());
      this.patientId = this.user.patientId;
      const id = this.route.snapshot.paramMap.get('id');
      if (id) await this.openVisit(Number(id));
      else if (this.patientId) await this.history();
      else this.loading = false;
    } catch (e) {
      this.fail(e);
    }
  }
  async history() {
    if (!this.patientId) return;
    this.loading = true;
    this.error = '';
    try {
      this.visits = await firstValueFrom(this.api.get(`Visits/patient/${this.patientId}`));
      this.prescriptions = await firstValueFrom(this.api.get(`Prescriptions/patient/${this.patientId}`));
    } catch (e) {
      this.fail(e);
    } finally {
      this.loading = false;
    }
  }
  async openVisit(id: number) {
    this.loading = true;
    this.error = '';
    try {
      this.visit = await firstValueFrom(this.api.get(`Visits/${id}`));
      this.patientId = this.visit!['patientId'];
    } catch (e) {
      this.fail(e);
    } finally {
      this.loading = false;
    }
  }
  field(key: string, label: string, type = 'text', required = false, min?: number, max?: number): FormField {
    return { key, label, type, required, min, max };
  }
  open(action: string, row?: RecordData) {
    this.action = action;
    this.editId = row?.['id'];
    this.value = row ? { ...row } : {};
    if (action === 'notes') {
      this.fields = [
        this.field('chiefComplaint', 'Chief complaint', 'textarea'),
        this.field('doctorNotes', 'Clinical notes', 'textarea'),
      ];
      this.value = { ...this.visit };
    }
    if (action === 'complete') {
      this.fields = [
        this.field('chiefComplaint', 'Chief complaint', 'textarea'),
        this.field('doctorNotes', 'Final clinical notes', 'textarea'),
      ];
      this.value = { ...this.visit };
    }
    if (action === 'vitals')
      this.fields = [
        this.field('weightKg', 'Weight (kg)', 'number', false, 1, 500),
        this.field('heightCm', 'Height (cm)', 'number', false, 20, 300),
        this.field('systolicBP', 'Systolic BP', 'number', false, 50, 250),
        this.field('diastolicBP', 'Diastolic BP', 'number', false, 30, 150),
        this.field('heartRateBpm', 'Heart rate (bpm)', 'number', false, 20, 250),
        this.field('temperatureC', 'Temperature (°C)', 'number', false, 30, 45),
        this.field('oxygenSaturationPct', 'Oxygen saturation (%)', 'number', false, 50, 100),
        this.field('respiratoryRate', 'Respiratory rate', 'number', false, 5, 80),
        this.field('notes', 'Notes', 'textarea'),
      ];
    if (action === 'diagnoses')
      this.fields = [
        this.field('diagnosisName', 'Diagnosis name', 'text', true),
        this.field('diagnosisCode', 'Code'),
        {
          key: 'diagnosisType',
          label: 'Type',
          type: 'select',
          options: ['Primary', 'Secondary', 'Chronic', 'Acute'].map((value) => ({ value, label: value })),
        },
        this.field('notes', 'Notes', 'textarea'),
      ];
    this.modal = true;
  }
  async save(value: RecordData) {
    if (!this.visit) return;
    this.busy = true;
    this.error = '';
    try {
      const id = this.visit['id'];
      if (['notes', 'complete'].includes(this.action))
        await firstValueFrom(
          this.api.put(`Visits/${id}/${this.action}`, {
            chiefComplaint: value['chiefComplaint'],
            doctorNotes: value['doctorNotes'],
          })
        );
      else if (this.editId) await firstValueFrom(this.api.put(`Visits/${this.action}/${this.editId}`, value));
      else await firstValueFrom(this.api.post(`Visits/${id}/${this.action}`, value));
      this.modal = false;
      this.success = 'Clinical record saved.';
      await this.openVisit(id);
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy = false;
    }
  }
  async remove(type: string, id: number) {
    if (!confirm('Delete this clinical record? This cannot be undone.')) return;
    try {
      await firstValueFrom(this.api.delete(`Visits/${type}/${id}`));
      await this.openVisit(this.visit!['id']);
    } catch (e) {
      this.fail(e);
    }
  }
  async prescription() {
    this.error = '';
    try {
      const result = await firstValueFrom(this.api.get('Medications', { pageSize: 100 }));
      this.medications = result.data.filter((m: RecordData) => m['isActive']);
      this.items = [{ medicationId: undefined, dose: '', frequency: '', durationDays: 1 }];
      this.prescribe = true;
    } catch (e) {
      this.fail(e);
    }
  }
  addItem() {
    this.items.push({ medicationId: undefined, dose: '', frequency: '', durationDays: 1 });
  }
  async savePrescription() {
    if (!this.visit || this.items.some((i) => !i['medicationId'])) return;
    this.busy = true;
    try {
      await firstValueFrom(
        this.api.post('Prescriptions', {
          visitId: this.visit['id'],
          notes: this.prescriptionNotes,
          items: this.items,
        })
      );
      this.prescribe = false;
      this.success = 'Prescription issued.';
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy = false;
    }
  }
  entries(row: RecordData) {
    return Object.entries(row).filter(
      ([k, v]) =>
        !['id', 'visitId', 'recordedByStaffId', 'diagnosedByDoctorId'].includes(k) &&
        v !== null &&
        v !== undefined
    );
  }
  label(key: string) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
  }
  fail(e: any) {
    this.error = apiError(e);
    this.loading = false;
  }
}
