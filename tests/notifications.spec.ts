import { test, expect } from '@playwright/test';
import { mock } from './fixtures';
test('notification filters and own hide restore delete call the API', async ({ page }) => {
  await mock(page);
  await page.goto('/admin/notifications');
  const filter = page.waitForRequest(
    (r) => r.url().includes('/Notifications?') && r.url().includes('category=reminders')
  );
  await page.getByRole('button', { name: 'Reminders', exact: true }).click();
  await filter;
  const hide = page.waitForRequest(
    (r) => r.method() === 'PUT' && r.url().includes('/visibility?hidden=true')
  );
  await page.getByRole('button', { name: 'Hide', exact: true }).first().click();
  await hide;
  await page.getByLabel('Hidden notifications', { exact: true }).check();
  const restore = page.waitForRequest(
    (r) => r.method() === 'PUT' && r.url().includes('/visibility?hidden=false')
  );
  await page.getByRole('button', { name: 'Restore', exact: true }).first().click();
  await restore;
  page.once('dialog', (d) => d.accept());
  const deletion = page.waitForRequest((r) => r.method() === 'DELETE' && r.url().includes('/Notifications/'));
  await page.getByRole('button', { name: 'Delete', exact: true }).first().click();
  await deletion;
});
test('modern login toast replaces old library and can be dismissed', async ({ page }) => {
  await mock(page);
  await page.route(/\/api\/auth\/me$/i, (r) => r.fulfill({ status: 401, json: { message: 'Signed out' } }));
  await page.goto('/admin/login');
  await page.getByLabel('Email address').fill('test@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('Testing@123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('.clinic-toast')).toContainText('Login successful!');
  await expect(page.locator('.toast-success')).toHaveCount(0);
  await page.screenshot({path:'test-results/modern-toast.png',fullPage:true,animations:'disabled'});
  await page.locator('.clinic-toast button').click();
  await expect(page.locator('.clinic-toast')).toHaveCount(0);
});
test('notification center fits Arabic mobile and supports reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mock(page);
  await page.goto('/admin/notifications');
  await page.locator('.header-language').selectOption('ar');
  await expect(page.getByRole('heading', { name: 'تحديثات تهمك' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  const duration = await page.locator('.cp-page').evaluate((el) => getComputedStyle(el).animationDuration);
  expect(parseFloat(duration)).toBeLessThan(0.01);
});
