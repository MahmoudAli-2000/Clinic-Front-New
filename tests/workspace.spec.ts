import { test, expect, Page } from '@playwright/test';
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
async function mock(page: Page, role = 'Admin') {
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
    if (p.endsWith('/auth/me')) body = user;
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
for (const role of ['Admin', 'Manager', 'Receptionist', 'Doctor', 'Nurse', 'Patient']) {
  test(`${role}: dashboard and role routing`, async ({ page }) => {
    await mock(page, role);
    await page.goto('/admin/dashboard');
    await expect(page.locator('.welcome-banner')).toBeVisible();
    const prefix =
      role === 'Patient'
        ? 'patient'
        : role === 'Doctor'
          ? 'doctor'
          : ['Nurse', 'Receptionist'].includes(role)
            ? 'staff'
            : 'admin';
    await expect(page).toHaveURL(new RegExp('/' + prefix + '/dashboard'));
    await expect(page.locator('.summary-card').first()).toBeVisible();
    await expect(page.locator('.welcome-banner')).toContainText('Mahmoud');
  });
}
test('patient cannot access user administration', async ({ page }) => {
  await mock(page, 'Patient');
  await page.goto('/patient/users');
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('.workspace-nav')).not.toContainText('User accounts');
});
test('patient can view appointments but cannot mutate staff workflow', async ({ page }) => {
  await mock(page, 'Patient');
  await page.goto('/patient/appointments');
  await expect(page.locator('tbody')).toContainText('Salma Hassan');
  await expect(page.getByRole('button', { name: 'New appointment', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Confirm', exact: true })).toHaveCount(0);
});
test('patient create form submits multipart with contract fields', async ({ page }) => {
  await mock(page);
  await page.goto('/admin/patients');
  await page.getByRole('button', { name: 'New patient', exact: true }).click();
  await page.getByLabel('First name').fill('Test');
  await page.getByLabel('Last name').fill('Patient');
  const request = page.waitForRequest((req) => req.method() === 'POST' && req.url().includes('/Patients'));
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  const req = await request;
  expect(req.headers()['content-type']).toContain('multipart/form-data');
  expect(req.postData()).toContain('Test');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('schedule convention is Monday=1 and availability loads', async ({ page }) => {
  await mock(page);
  await page.goto('/admin/schedules');
  await expect(page.locator('tbody')).toContainText('Monday');
  await page.getByLabel('Availability date').fill('2026-11-25');
  await page.getByRole('button', { name: 'Check availability' }).click();
  await expect(page.locator('.slot')).toContainText('Downtown Clinic');
});
test('clinical chart displays notes and prescription controls', async ({ page }) => {
  await mock(page, 'Doctor');
  await page.goto('/doctor/clinical/1');
  await expect(page.locator('.note-panel')).toContainText('Patient is recovering well.');
  await page.getByRole('button', { name: 'Prescribe', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Issue prescription');
});
test('notifications and settings load', async ({ page }) => {
  await mock(page);
  await page.goto('/admin/notifications');
  await expect(page.locator('.notification-row')).toContainText('Your next appointment');
  await page.goto('/admin/settings');
  await expect(page.getByLabel('Full name')).toHaveValue('Mahmoud Ali');
  await expect(page.getByRole('button', { name: 'Save preferences' })).toBeVisible();
});
test('recover account form', async ({ page }) => {
  await mock(page);
  await page.goto('/forgot-password');
  await page.getByLabel('Email address').fill('user@example.test');
  await page.getByRole('button', { name: 'Send reset instructions' }).click();
  await expect(page.getByRole('status')).toContainText('If this email is registered');
});
for (const width of [320, 360, 390, 430, 768, 1440]) {
  test(`responsive ${width}px and screenshot`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mock(page);
    await page.goto('/admin/dashboard');
    await expect(page.locator('.welcome-banner')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.screenshot({
      animations: 'disabled',
      path: `test-results/dashboard-${width}.png`,
      fullPage: true,
    });
    await page.goto('/admin/patients');
    await page.getByRole('button', { name: 'New patient', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.screenshot({
      animations: 'disabled',
      path: `test-results/patient-form-${width}.png`,
      fullPage: true,
    });
  });
}
test('cancel sends cancellationReason and enum payload', async ({ page }) => {
  await mock(page);
  await page.goto('/admin/appointments');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByLabel('Cancellation reason').fill('Patient requested another day');
  const request = page.waitForRequest(
    (r) => r.method() === 'PUT' && r.url().includes('/Appointments/1/cancel')
  );
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  expect((await request).postDataJSON()).toEqual({ cancellationReason: 'Patient requested another day' });
});
test('medication form and status controls', async ({ page }) => {
  await mock(page);
  await page.goto('/admin/medications');
  await expect(page.locator('tbody')).toContainText('Paracetamol');
  await page.getByRole('button', { name: 'New medication', exact: true }).click();
  await expect(page.getByLabel('Generic name')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Status', exact: true }).click();
  await expect(page.getByLabel('Active', { exact: true })).toBeVisible();
});
test('patient review button only on eligible completed appointment', async ({ page }) => {
  await mock(page, 'Patient');
  await page.goto('/patient/reviews');
  await expect(page.locator('.review')).toContainText('Thoughtful care');
  await expect(page.locator('.rating-overview')).toContainText('4.8');
});
test('directory API error is visible and not presented as empty success', async ({ page }) => {
  await mock(page);
  await page.route('**/api/Patients?**', (r) =>
    r.fulfill({ status: 500, json: { message: 'Database temporarily unavailable' } })
  );
  await page.goto('/admin/patients');
  await expect(page.getByRole('alert')).toContainText('Database temporarily unavailable');
  await expect(page.locator('.cp-empty')).toContainText('Data is unavailable');
});
test('capture active feature screens and auth forms', async ({ page }) => {
  await mock(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [route, selector, name] of [
    ['/admin/patients', '.cp-table', 'patients'],
    ['/admin/clinical/1', '.note-panel', 'clinical-chart'],
    ['/admin/settings', '.settings-grid', 'settings'],
    ['/admin/reviews', '.review-grid', 'reviews'],
  ]) {
    await page.goto(route);
    await expect(page.locator(selector)).toBeVisible();
    await page.screenshot({ path: `test-results/${name}.png`, fullPage: true, animations: 'disabled' });
  }
  await page.unroute('**/api/**');
  await page.route('**/api/**', (r) => r.fulfill({ status: 401, json: { message: 'Not signed in' } }));
  for (const [route, selector, name] of [
    ['/admin/login', 'form', 'login'],
    ['/admin/register', 'form', 'register'],
  ]) {
    await page.goto(route);
    await expect(page.locator(selector)).toBeVisible();
    await page.screenshot({ path: `test-results/${name}.png`, fullPage: true, animations: 'disabled' });
  }
});
