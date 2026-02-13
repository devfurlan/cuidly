import { test, expect } from '@playwright/test';
import { loginAsFamilyPaid } from '../helpers/auth';

test.describe('Family: View Applications', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAsFamilyPaid(context, page);
  });

  test('should display the job list with active job', async ({ page }) => {
    await page.goto('/app/vagas');

    // Should show the seeded job
    await expect(
      page.getByText('Babá fixa para 2 crianças em São Paulo'),
    ).toBeVisible({ timeout: 15000 });
  });

  test('should show application count on job card', async ({ page }) => {
    await page.goto('/app/vagas');

    // The job has 1 application from nannyPro
    await expect(
      page.getByText('1 candidatura'),
    ).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to job detail page', async ({ page }) => {
    await page.goto('/app/vagas');

    // Click "Ver detalhes" link
    const detailsLink = page.getByText('Ver detalhes').first();
    await expect(detailsLink).toBeVisible({ timeout: 15000 });
    await detailsLink.click();

    // Should be on job detail page
    await page.waitForURL(/\/app\/vagas\/\d+/, { timeout: 10000 });
  });

  test('should show job details on detail page', async ({ page }) => {
    await page.goto('/app/vagas');

    await page.getByText('Ver detalhes').first().click();
    await page.waitForURL(/\/app\/vagas\/\d+/, { timeout: 10000 });

    // Should see job title on detail page
    await expect(
      page.getByText(/babá fixa/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
