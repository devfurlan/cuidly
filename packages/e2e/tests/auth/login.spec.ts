import { test, expect } from '@playwright/test';
import {
  login,
  loginAsFamily,
  loginAsFamilyPaid,
  loginAsNanny,
  loginAsNannyPro,
} from '../helpers/auth';

test.describe('Programmatic login', () => {
  test('should login as a free family and access dashboard', async ({
    page,
    context,
  }) => {
    await loginAsFamily(context, page);
    await expect(page).toHaveURL(/\/app/);
  });

  test('should login as a paid family (Plus) and access dashboard', async ({
    page,
    context,
  }) => {
    await loginAsFamilyPaid(context, page);
    await expect(page).toHaveURL(/\/app/);
  });

  test('should login as a free nanny and access dashboard', async ({
    page,
    context,
  }) => {
    await loginAsNanny(context, page);
    await expect(page).toHaveURL(/\/app/);
  });

  test('should login as a paid nanny (Pro) and access dashboard', async ({
    page,
    context,
  }) => {
    await loginAsNannyPro(context, page);
    await expect(page).toHaveURL(/\/app/);
  });
});

test.describe('UI login (e-mail/senha)', () => {
  test('should login via the login form', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input#email').fill('familia-teste@cuidly.com');
    await page.locator('input[type="password"]').fill('TestPass123!');

    await page.locator('form').locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/app/, { timeout: 15000 });
  });

  test('should show an error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input#email').fill('naoexiste@cuidly.com');
    await page.locator('input[type="password"]').fill('SenhaErrada123!');

    await page.locator('form').locator('button[type="submit"]').click();

    await expect(page.locator('[role="alert"]')).toBeVisible({
      timeout: 10000,
    });
  });
});
