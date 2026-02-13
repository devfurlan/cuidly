import { test, expect } from '@playwright/test';
import { loginAsNanny, loginAsNannyPro } from '../helpers/auth';

test.describe('Nanny: View Jobs', () => {
  test('should display available jobs page for a free nanny', async ({ context, page }) => {
    await loginAsNanny(context, page);
    await page.goto('/app/vagas');

    // Nanny sees "Explorar Vagas" heading (use role to avoid nav link match)
    await expect(
      page.getByRole('heading', { name: 'Explorar Vagas' }),
    ).toBeVisible({ timeout: 15000 });
  });

  test('should display the test job in the listing', async ({ context, page }) => {
    await loginAsNanny(context, page);
    await page.goto('/app/vagas');

    // Wait for skeleton to finish loading and show the actual job
    await expect(
      page.getByText('Babá fixa para 2 crianças em São Paulo'),
    ).toBeVisible({ timeout: 30000 });
  });

  test('should show job card details', async ({ context, page }) => {
    await loginAsNanny(context, page);
    await page.goto('/app/vagas');

    // Job card shows location
    await expect(
      page.getByText('Babá fixa para 2 crianças em São Paulo'),
    ).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/São Paulo/i).first()).toBeVisible();
  });

  test('should show Ver detalhes link on job card', async ({ context, page }) => {
    await loginAsNanny(context, page);
    await page.goto('/app/vagas');

    await expect(page.getByText('Ver detalhes').first()).toBeVisible({ timeout: 30000 });
  });

  test('should show filter options', async ({ context, page }) => {
    await loginAsNanny(context, page);
    await page.goto('/app/vagas');

    const filterButton = page.getByRole('button', { name: /filtros/i });
    await expect(filterButton).toBeVisible({ timeout: 15000 });
  });
});
