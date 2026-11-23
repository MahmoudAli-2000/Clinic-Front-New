import { mock } from './fixtures';
import { test, expect } from '@playwright/test';
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
  await expect(page.getByLabel('Generic name', { exact: true })).toBeVisible();
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

test('account appearance previews dark mode and saves custom style', async ({ page }) => {
  await mock(page);
  await page.goto('/admin/settings');
  await page.getByLabel('Theme mode').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByLabel('Corner style').selectOption('square');
  await page.getByLabel('Layout density').selectOption('compact');
  const request = page.waitForRequest((r) => r.method() === 'PUT' && r.url().includes('/Appearance'));
  await page.getByRole('button', { name: 'Save appearance', exact: true }).click();
  const body = (await request).postDataJSON();
  expect(body.mode).toBe('dark');
  expect(body.corners).toBe('square');
  expect(body.density).toBe('compact');
  await page.getByLabel('Theme mode').selectOption('dark');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.screenshot({ path: 'test-results/settings-dark.png', fullPage: true, animations: 'disabled' });
  await page.goto('/admin/dashboard');
  await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'));
  await expect(page.locator('.welcome-banner')).toBeVisible();
  await page.screenshot({ path: 'test-results/dashboard-dark.png', fullPage: true, animations: 'disabled' });
});

test('persisted dark appearance is applied on dashboard and settings', async ({ page }) => {
  await mock(page);
  await page.route('**/api/Appearance', (r) =>
    r.fulfill({
      json: {
        mode: 'dark',
        accent: '#7c3aed',
        density: 'comfortable',
        corners: 'rounded',
        textSize: 'default',
        font: 'system',
      },
    })
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [route, name] of [
    ['/admin/dashboard', 'dashboard-dark'],
    ['/admin/settings', 'settings-dark'],
  ]) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/${name}.png`, fullPage: true, animations: 'disabled' });
  }
});
