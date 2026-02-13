import { test, expect } from '@playwright/test';
import { loginAsNanny } from '../helpers/auth';

test.describe('Nanny: Job Detail', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAsNanny(context, page);
  });

  test('should navigate to job detail page', async ({ page }) => {
    await page.goto('/app/vagas');

    // Wait for jobs to load, then click "Ver detalhes"
    const detailsLink = page.getByText('Ver detalhes').first();
    await expect(detailsLink).toBeVisible({ timeout: 30000 });
    await detailsLink.click();

    await page.waitForURL(/\/app\/vagas\/\d+/, { timeout: 10000 });
  });

  test('should show job title on detail page', async ({ page }) => {
    await page.goto('/app/vagas');

    await page.getByText('Ver detalhes').first().click({ timeout: 30000 });
    await page.waitForURL(/\/app\/vagas\/\d+/, { timeout: 10000 });

    // Should see the page heading and job title
    await expect(page.getByText('Detalhes da Vaga').first()).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText('Babá fixa para 2 crianças em São Paulo').first(),
    ).toBeVisible();
  });

  test('should show job details info', async ({ page }) => {
    await page.goto('/app/vagas');

    await page.getByText('Ver detalhes').first().click({ timeout: 30000 });
    await page.waitForURL(/\/app\/vagas\/\d+/, { timeout: 10000 });

    // Should show job type and contract info
    await expect(page.getByText('Babá Fixa').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('CLT').first()).toBeVisible();
  });

  test('should show job description', async ({ page }) => {
    await page.goto('/app/vagas');

    await page.getByText('Ver detalhes').first().click({ timeout: 30000 });
    await page.waitForURL(/\/app\/vagas\/\d+/, { timeout: 10000 });

    // Should show the description text
    await expect(
      page.getByText(/Procuramos uma babá fixa/i),
    ).toBeVisible({ timeout: 10000 });
  });
});
