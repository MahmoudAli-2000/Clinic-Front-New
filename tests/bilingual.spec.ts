import { test, expect } from '@playwright/test';
import { mock } from './fixtures';
test('Arabic instantly mirrors navigation, labels forms and persists account choice', async ({ page }) => {
  await mock(page);
  let language = 'en';
  await page.route('**/api/Profile/language', (r) => {
    if (r.request().method() === 'PUT') language = r.request().postDataJSON().language;
    return r.fulfill({ json: { language } });
  });
  await page.goto('/admin/dashboard');
  await expect(page.locator('.welcome-banner')).toContainText('Clinic operations');
  await page.locator('.header-language').selectOption('ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('.welcome-banner')).toContainText('إدارة العيادة');
  await page.goto('/admin/patients');
  await expect(page.locator('.header-language')).toHaveValue('ar');
  await page.getByRole('button', { name: 'جديد مريض', exact: true }).click();
  await expect(page.getByLabel('الاسم الأول', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'حفظ التغييرات', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'إلغاء', exact: true }).click();
  await page.locator('.header-language').selectOption('en');
  await expect(page.getByRole('button', { name: 'New patient', exact: true })).toBeVisible();
});
for (const width of [320, 390, 768, 1440])
  test(`Arabic responsive ${width}px has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mock(page);
    await page.goto('/admin/dashboard');
    await page.locator('.header-language').selectOption('ar');
    await expect(page.locator('.welcome-banner')).toContainText('إدارة العيادة');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    if (width >= 1000) {
      const box = await page.locator('.workspace-sidebar').boundingBox();
      expect(box!.x).toBeGreaterThan(width / 2);
    }
  });
test('profile photo appears in header, then initials fallback on image error', async ({ page }) => {
  await mock(page);
  await page.route(/\/api\/auth\/me$/i, (r) =>
    r.fulfill({
      json: {
        id: 'test-user',
        fullName: 'Mahmoud Ali',
        email: 'test@example.invalid',
        roles: ['Admin'],
        isActive: true,
        emailConfirmed: true,
        imageCover: '/assets/profile-test.png',
      },
    })
  );
  await page.route('**/assets/profile-test.png', (r) =>
    r.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aGmcAAAAASUVORK5CYII=',
        'base64'
      ),
    })
  );
  await page.goto('/admin/dashboard');
  await expect(page.locator('.profile-photo')).toBeVisible();
  await expect(page.locator('.user-copy strong')).toHaveText('Mahmoud Ali');
  await page.locator('.profile-photo').evaluate((img) => img.dispatchEvent(new Event('error')));
  await expect(page.locator('.user-avatar')).toHaveText('MA');
});
test('Arabic login and recovery screens translate without authentication', async ({ page }) => {
  await page.goto('/admin/login');
  await page.locator('.language-switch').selectOption('ar');
  await expect(page.getByLabel('البريد الإلكتروني')).toBeVisible();
  await expect(page.getByRole('button', { name: 'تسجيل الدخول', exact: true })).toBeVisible();
  await page.goto('/forgot-password');
  await expect(page.getByRole('button', { name: 'إرسال تعليمات إعادة التعيين' })).toBeVisible();
});
