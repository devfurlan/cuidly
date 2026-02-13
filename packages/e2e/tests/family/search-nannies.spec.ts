import { test, expect } from '@playwright/test';
import { loginAsFamilyPaid } from '../helpers/auth';

test.describe('Family: Search Nannies', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAsFamilyPaid(context, page);
  });

  test('should display the nanny search page heading', async ({ page }) => {
    await page.goto('/app/babas');

    // "Encontrar Babás" appears in heading (h1) — use role to avoid nav link match
    await expect(
      page.getByRole('heading', { name: /Encontrar Babás/i }),
    ).toBeVisible({ timeout: 15000 });
  });

  test('should display nanny count after loading', async ({ page }) => {
    await page.goto('/app/babas');

    // Wait for count to show (e.g. "2 babás disponíveis") — API may be slow
    await expect(page.getByText(/\d+ babás? disponíve/i)).toBeVisible({ timeout: 30000 });
  });

  test('should display nanny cards in the listing', async ({ page }) => {
    await page.goto('/app/babas');

    // Wait for nanny names to appear after API loads (Maria and Ana are seeded)
    await expect(page.getByText('Maria').first()).toBeVisible({ timeout: 30000 });
  });

  test('should show filter button', async ({ page }) => {
    await page.goto('/app/babas');

    const filterButton = page.getByRole('button', { name: /filtros/i });
    await expect(filterButton).toBeVisible({ timeout: 10000 });
  });

  test('should show filter options when filters are expanded', async ({ page }) => {
    await page.goto('/app/babas');

    const filterButton = page.getByRole('button', { name: /filtros/i });
    await expect(filterButton).toBeVisible({ timeout: 10000 });
    await filterButton.click();

    // Filter labels should be visible
    await expect(page.getByText('Localização')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Experiência mínima')).toBeVisible();
  });

  test('should show matching info for paid family with active job', async ({ page }) => {
    await page.goto('/app/babas');

    // familyPaid has an active job, so matching info should appear after load
    await expect(
      page.getByText(/compatibilidade/).first(),
    ).toBeVisible({ timeout: 30000 });
  });
});
