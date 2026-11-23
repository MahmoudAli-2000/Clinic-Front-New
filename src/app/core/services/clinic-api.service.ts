import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PagedResponse<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}

export interface PatientListItem {
  id: number;
  patientNo: string;
  firstName: string;
  lastName: string;
  imageCover?: string | null;
  publicCode: string;
  phone?: string | null;
  email?: string | null;
  status: string;
}

export interface DoctorListItem {
  id: number;
  staffId: number;
  fullName: string;
  specialtyId: number;
  specialtyName: string;
  imageCover?: string | null;
  publicCode: string;
  licenseNo: string;
  isActive: boolean;
  consultationDurationMinutes: number;
}

export interface AppointmentListItem {
  id: number;
  patientId: number;
  patientName: string;
  doctorClinicId: number;
  doctorId: number;
  doctorName: string;
  clinicId: number;
  clinicName: string;
  scheduledStartAtUtc: string;
  scheduledEndAtUtc: string;
  status: string;
  bookingSource: string;
  reason?: string | null;
  notes?: string | null;
  visitId?: number | null;
  hasReview: boolean;
}

export interface ClinicListItem {
  id: number;
  clinicCode: string;
  clinicName: string;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  country?: string | null;
  workingHoursNotes?: string | null;
  imageCover?: string | null;
  isActive: boolean;
}

export interface ScheduleListItem {
  id: number;
  doctorClinicId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  isActive: boolean;
}

export interface SpecialtyListItem {
  id: number;
  specialtyName: string;
  description?: string | null;
  imageCover?: string | null;
}

export interface StaffListItem {
  id: number;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  roles: string[];
  jobTitle?: string | null;
  status?: string | null;
}

export interface PatientCreateRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female';
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createAccount?: boolean;
  password?: string;
  imageFile?: File;
}

export interface ClinicCreateRequest {
  clinicCode: string;
  clinicName: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  workingHoursNotes?: string;
  imageFile?: File;
}

export interface DoctorCreateRequest {
  staffId: number;
  specialtyId: number;
  licenseNo: string;
  consultationDurationMinutes?: number;
  defaultConsultationFee?: number;
  bio?: string;
  imageFile?: File;
}

export interface StaffCreateRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  primaryClinicId?: number;
  jobTitle?: string;
  hireDate?: string;
  createAccount?: boolean;
  password?: string;
  roles?: string[];
  imageFile?: File;
}

export interface SpecialtyCreateRequest {
  specialtyName: string;
  description?: string;
  imageFile?: File;
}

export interface AppointmentCreateRequest {
  patientId: number;
  doctorClinicId: number;
  scheduledStartAtUtc: string;
  scheduledEndAtUtc?: string;
  bookingSource?: 'Admin' | 'Reception' | 'Patient' | 'Phone';
  reason?: string;
  notes?: string;
}

export interface ScheduleCreateRequest {
  doctorClinicId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface PrescriptionCreateRequest {
  visitId: number;
  notes?: string;
  items: Array<{
    medicationName: string;
    dosage?: string;
    frequency?: string;
    durationDays?: number;
  }>;
}

export interface VisitListItem {
  id: number;
  appointmentId: number;
  patientId: number;
  checkInAtUtc?: string | null;
  visitStartAtUtc?: string | null;
  visitEndAtUtc?: string | null;
  chiefComplaint?: string | null;
  doctorNotes?: string | null;
  status: string;
}

export interface PrescriptionListItem {
  id: number;
  visitId: number;
  prescribedByDoctorId: number;
  status: string;
  issuedAtUtc: string;
  notes?: string | null;
  items: Array<{ medicationName?: string; dosage?: string; frequency?: string; durationDays?: number }>;
}

export interface NotificationListItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class ClinicApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';

  searchPatients(pageIndex = 1, pageSize = 10, search = ''): Observable<PagedResponse<PatientListItem>> {
    return this.http.get<PagedResponse<PatientListItem>>(`${this.apiUrl}/Patients`, {
      params: this.buildParams({ pageIndex, pageSize, search })
    });
  }

  searchDoctors(pageIndex = 1, pageSize = 10, search = ''): Observable<PagedResponse<DoctorListItem>> {
    return this.http.get<PagedResponse<DoctorListItem>>(`${this.apiUrl}/Doctors`, {
      params: this.buildParams({ pageIndex, pageSize, search })
    });
  }

  searchAppointments(
    pageIndex = 1,
    pageSize = 10,
    search = '',
    filters: { patientId?: number; doctorId?: number } = {}
  ): Observable<PagedResponse<AppointmentListItem>> {
    return this.http.get<PagedResponse<AppointmentListItem>>(`${this.apiUrl}/Appointments`, {
      params: this.buildParams({ pageIndex, pageSize, search, ...filters })
    });
  }

  searchClinics(pageIndex = 1, pageSize = 10, search = ''): Observable<PagedResponse<ClinicListItem>> {
    return this.http.get<PagedResponse<ClinicListItem>>(`${this.apiUrl}/Clinics`, {
      params: this.buildParams({ pageIndex, pageSize, search })
    });
  }

  searchSpecialties(pageIndex = 1, pageSize = 10, search = ''): Observable<PagedResponse<SpecialtyListItem>> {
    return this.http.get<PagedResponse<SpecialtyListItem>>(`${this.apiUrl}/Specialties`, {
      params: this.buildParams({ pageIndex, pageSize, search })
    });
  }

  getSchedulesByClinic(clinicId: number): Observable<ScheduleListItem[]> {
    return this.http.get<ScheduleListItem[]>(`${this.apiUrl}/Schedules/clinic/${clinicId}`);
  }

  getSchedulesByDoctor(doctorId: number): Observable<ScheduleListItem[]> {
    return this.http.get<ScheduleListItem[]>(`${this.apiUrl}/Schedules/doctor/${doctorId}`);
  }

  getPatient(patientId: number): Observable<PatientListItem> {
    return this.http.get<PatientListItem>(`${this.apiUrl}/Patients/${patientId}`);
  }

  searchStaff(pageIndex = 1, pageSize = 10, search = ''): Observable<PagedResponse<StaffListItem>> {
    return this.http.get<PagedResponse<StaffListItem>>(`${this.apiUrl}/Staffs`, {
      params: this.buildParams({ pageIndex, pageSize, search })
    });
  }

  getPatientVisits(patientId: number): Observable<VisitListItem[]> {
    return this.http.get<VisitListItem[]>(`${this.apiUrl}/Visits/patient/${patientId}`);
  }

  getPatientPrescriptions(patientId: number): Observable<PrescriptionListItem[]> {
    return this.http.get<PrescriptionListItem[]>(`${this.apiUrl}/Prescriptions/patient/${patientId}`);
  }

  getDoctorPrescriptions(doctorId: number): Observable<PrescriptionListItem[]> {
    return this.http.get<PrescriptionListItem[]>(`${this.apiUrl}/Prescriptions/doctor/${doctorId}`);
  }

  createPatient(request: PatientCreateRequest): Observable<PatientListItem> {
    return this.http.post<PatientListItem>(`${this.apiUrl}/Patients`, this.toFormData(request));
  }

  updatePatient(id: number, request: PatientCreateRequest & { status?: string }): Observable<PatientListItem> {
    return this.http.put<PatientListItem>(`${this.apiUrl}/Patients/${id}`, this.toFormData(request));
  }

  setPatientStatus(id: number, status: 'Active' | 'Inactive' | 'Archived'): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/Patients/${id}/status`, null, { params: { status } });
  }

  createAppointment(request: AppointmentCreateRequest): Observable<AppointmentListItem> {
    return this.http.post<AppointmentListItem>(`${this.apiUrl}/Appointments`, request);
  }

  rescheduleAppointment(id: number, scheduledStartAtUtc: string, scheduledEndAtUtc?: string): Observable<AppointmentListItem> {
    return this.http.put<AppointmentListItem>(`${this.apiUrl}/Appointments/${id}/reschedule`, {
      scheduledStartAtUtc,
      scheduledEndAtUtc: scheduledEndAtUtc || null
    });
  }

  cancelAppointment(id: number, reason?: string): Observable<AppointmentListItem> {
    return this.http.put<AppointmentListItem>(`${this.apiUrl}/Appointments/${id}/cancel`, { reason: reason || null });
  }

  confirmAppointment(id: number): Observable<AppointmentListItem> {
    return this.http.put<AppointmentListItem>(`${this.apiUrl}/Appointments/${id}/confirm`, {});
  }

  checkInAppointment(id: number): Observable<AppointmentListItem> {
    return this.http.put<AppointmentListItem>(`${this.apiUrl}/Appointments/${id}/checkin`, {});
  }

  completeAppointment(id: number): Observable<AppointmentListItem> {
    return this.http.put<AppointmentListItem>(`${this.apiUrl}/Appointments/${id}/complete`, {});
  }

  markAppointmentNoShow(id: number): Observable<AppointmentListItem> {
    return this.http.put<AppointmentListItem>(`${this.apiUrl}/Appointments/${id}/no-show`, {});
  }

  createClinic(request: ClinicCreateRequest): Observable<ClinicListItem> {
    return this.http.post<ClinicListItem>(`${this.apiUrl}/Clinics`, this.toFormData(request));
  }

  updateClinic(id: number, request: ClinicCreateRequest): Observable<ClinicListItem> {
    return this.http.put<ClinicListItem>(`${this.apiUrl}/Clinics/${id}`, this.toFormData(request));
  }

  setClinicActive(id: number, isActive: boolean): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/Clinics/${id}/status`, null, { params: { isActive } });
  }

  createDoctor(request: DoctorCreateRequest): Observable<DoctorListItem> {
    return this.http.post<DoctorListItem>(`${this.apiUrl}/Doctors`, this.toFormData(request));
  }

  updateDoctor(id: number, request: Partial<DoctorCreateRequest>): Observable<DoctorListItem> {
    return this.http.put<DoctorListItem>(`${this.apiUrl}/Doctors/${id}`, this.toFormData(request));
  }

  createStaff(request: StaffCreateRequest): Observable<StaffListItem> {
    return this.http.post<StaffListItem>(`${this.apiUrl}/Staffs`, this.toFormData(request));
  }

  updateStaff(id: number, request: Partial<StaffCreateRequest>): Observable<StaffListItem> {
    return this.http.put<StaffListItem>(`${this.apiUrl}/Staffs/${id}`, this.toFormData(request));
  }

  setStaffStatus(id: number, status: 'Active' | 'Inactive' | 'Terminated'): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/Staffs/${id}/status`, null, { params: { status } });
  }

  createSpecialty(request: SpecialtyCreateRequest): Observable<SpecialtyListItem> {
    return this.http.post<SpecialtyListItem>(`${this.apiUrl}/Specialties`, this.toFormData(request));
  }

  updateSpecialty(id: number, request: SpecialtyCreateRequest): Observable<SpecialtyListItem> {
    return this.http.put<SpecialtyListItem>(`${this.apiUrl}/Specialties/${id}`, this.toFormData(request));
  }

  deleteSpecialty(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/Specialties/${id}`);
  }

  createSchedule(request: ScheduleCreateRequest): Observable<ScheduleListItem> {
    return this.http.post<ScheduleListItem>(`${this.apiUrl}/Schedules`, request);
  }

  updateSchedule(id: number, request: Partial<ScheduleCreateRequest>): Observable<ScheduleListItem> {
    return this.http.put<ScheduleListItem>(`${this.apiUrl}/Schedules/${id}`, request);
  }

  deleteSchedule(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/Schedules/${id}`);
  }

  createPrescription(request: PrescriptionCreateRequest): Observable<PrescriptionListItem> {
    return this.http.post<PrescriptionListItem>(`${this.apiUrl}/Prescriptions`, request);
  }

  updatePrescriptionStatus(id: number, status: 'Active' | 'Dispensed' | 'Cancelled'): Observable<PrescriptionListItem> {
    return this.http.put<PrescriptionListItem>(`${this.apiUrl}/Prescriptions/${id}/status`, null, { params: { status } });
  }

  startVisit(appointmentId: number, chiefComplaint?: string): Observable<VisitListItem> {
    return this.http.post<VisitListItem>(`${this.apiUrl}/Visits/from-appointment/${appointmentId}`, {
      chiefComplaint: chiefComplaint || null
    });
  }

  completeVisit(id: number, visitUpdate: { chiefComplaint?: string; doctorNotes?: string; status?: string }): Observable<VisitListItem> {
    return this.http.put<VisitListItem>(`${this.apiUrl}/Visits/${id}/complete`, visitUpdate);
  }

  getUnreadNotificationCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/Notifications/unread-count`);
  }

  getNotifications(pageIndex = 1, pageSize = 5): Observable<PagedResponse<NotificationListItem>> {
    return this.http.get<PagedResponse<NotificationListItem>>(`${this.apiUrl}/Notifications`, {
      params: this.buildParams({ pageIndex, pageSize })
    });
  }

  markNotificationRead(id: number): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/Notifications/${id}/read`, {});
  }

  private toFormData(request: object): FormData {
    const form = new FormData();
    Object.entries(request).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (value instanceof File) {
        form.append(key, value);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item) => form.append(key, item.toString()));
        return;
      }
      form.append(key, value.toString());
    });
    return form;
  }

  private buildParams(values: Record<string, string | number | null | undefined>): HttpParams {
    let params = new HttpParams();

    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return params;
  }
}
