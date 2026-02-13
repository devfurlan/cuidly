import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText('Cuidly').first()).toBeVisible();
  });

  test('should have a login link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href*="login"]').first()).toBeVisible();
  });

  test('should have a signup link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href*="cadastro"]').first()).toBeVisible();
  });
});
