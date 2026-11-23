import { Page } from '@playwright/test';
const seed = {
  id: 'test-user',
  fullName: 'Mahmoud Ali',
  email: 'user@clinic.test',
  isActive: true,
  emailConfirmed: true,
  roles: ['Admin'],
  patientId: null,
  staffId: 1,
  doctorId: null,
};
const patient = {
  id: 1,
  firstName: 'Salma',
  lastName: 'Hassan',
  patientNo: 'PAT-1001',
  phone: '+201000000001',
  email: 'salma@example.test',
  status: 'Active',
};
const doctor = {
  id: 1,
  staffId: 1,
  fullName: 'Dr. Ahmed Fouad',
  specialtyName: 'Cardiology',
  specialtyId: 1,
  licenseNo: 'EG-1001',
  isActive: true,
  consultationDurationMinutes: 30,
};
const appointment = {
  id: 1,
  patientId: 1,
  patientName: 'Salma Hassan',
  doctorId: 1,
  doctorName: 'Dr. Ahmed Fouad',
  doctorClinicId: 1,
  clinicId: 1,
  clinicName: 'Downtown Clinic',
  scheduledStartAtUtc: '2026-11-25T09:00:00Z',
  scheduledEndAtUtc: '2026-11-25T09:30:00Z',
  status: 'Scheduled',
  hasReview: false,
};
const clinic = { id: 1, clinicName: 'Downtown Clinic', clinicCode: 'DT', city: 'Cairo', isActive: true };
const visit = {
  id: 1,
  appointmentId: 1,
  patientId: 1,
  chiefComplaint: 'Follow-up consultation',
  doctorNotes: 'Patient is recovering well.',
  status: 'InProgress',
  visitStartAtUtc: '2026-11-25T09:00:00Z',
  vitalSigns: [{ id: 1, heartRateBpm: 72, temperatureC: 36.8 }],
  diagnoses: [{ id: 1, diagnosisName: 'Routine follow-up', diagnosisType: 'Primary' }],
};
export async function mock(page: Page, role = 'Admin') {
  const user = {
    ...seed,
    roles: [role],
    patientId: role === 'Patient' ? 1 : null,
    doctorId: role === 'Doctor' ? 1 : null,
  };
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const p = url.pathname.toLowerCase();
    let body: any = {};
    if (p.endsWith('/appearance'))
      body = {
        mode: 'light',
        accent: '#278575',
        density: 'comfortable',
        corners: 'rounded',
        textSize: 'default',
        font: 'system',
      };
    else if (p.endsWith('/auth/me')) body = user;
    else if (p.includes('unread-count')) body = 2;
    else if (p.includes('notifications/preferences'))
      body = { allowInApp: true, allowEmail: true, appointmentReminders: true, generalUpdates: true };
    else if (p.includes('notifications'))
      body = {
        data: [
          {
            id: 1,
            title: 'Your next appointment',
            message: 'Your appointment is confirmed. We look forward to seeing you.',
            channel: 'InApp',
            status: 'Sent',
            createdAtUtc: '2026-11-23T12:00:00Z',
            readAtUtc: null,
          },
        ],
        count: 1,
      };
    else if (p.match(/doctors\/\d+\/clinics/))
      body = [{ id: 1, doctorId: 1, clinicId: 1, clinicName: 'Downtown Clinic', isActive: true }];
    else if (p.includes('schedules/doctor'))
      body = [
        {
          id: 1,
          doctorClinicId: 1,
          dayOfWeek: 1,
          startTime: '09:00:00',
          endTime: '17:00:00',
          slotDurationMinutes: 30,
          isActive: true,
        },
      ];
    else if (p.includes('schedules/availability'))
      body = [
        {
          doctorClinicId: 1,
          clinicName: 'Downtown Clinic',
          startAtUtc: '2026-11-25T09:00:00Z',
          endAtUtc: '2026-11-25T09:30:00Z',
        },
      ];
    else if (p.includes('schedules/timeoffs')) body = [];
    else if (p.includes('visits/patient')) body = [visit];
    else if (p.match(/visits\/\d+$/)) body = visit;
    else if (p.includes('prescriptions'))
      body = [
        {
          id: 1,
          visitId: 1,
          status: 'Active',
          issuedAtUtc: '2026-11-25T09:00:00Z',
          items: [
            {
              medicationId: 1,
              medicationName: 'Paracetamol',
              dose: '500 mg',
              frequency: 'As needed',
              durationDays: 3,
            },
          ],
        },
      ];
    else if (p.includes('reviews') && p.endsWith('/stats'))
      body = { count: 1, averageDoctorRating: 4.8, averageClinicRating: 4.7, averageStaffRating: 4.9 };
    else if (p.includes('reviews'))
      body = [
        {
          id: 1,
          doctorRating: 5,
          comment: 'Thoughtful care and a welcoming team.',
          isAnonymous: true,
          reviewedAtUtc: '2026-11-23T12:00:00Z',
        },
      ];
    else {
      let data: any[] = [];
      if (p.includes('patients')) data = [patient];
      if (p.includes('doctors')) data = [doctor];
      if (p.includes('clinics')) data = [clinic];
      if (p.includes('appointments')) data = [appointment];
      if (p.includes('specialties'))
        data = [
          { id: 1, specialtyName: 'Cardiology', description: 'Heart and vascular care', isActive: true },
        ];
      if (p.includes('medications'))
        data = [{ id: 1, genericName: 'Paracetamol', strength: '500 mg', isActive: true }];
      if (p.includes('staffs'))
        data = [{ ...patient, employeeNo: 'EMP-01', jobTitle: 'Nurse', roles: ['Nurse'] }];
      if (p.includes('users')) data = [user];
      body = p.match(/\/\d+$/) ? data[0] : { data, count: data.length, pageIndex: 1, pageSize: 10 };
    }
    await route.fulfill({ json: body });
  });
}
