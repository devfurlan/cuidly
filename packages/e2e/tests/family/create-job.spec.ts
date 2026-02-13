import { test, expect } from '@playwright/test';
import { loginAsFamilyPaid } from '../helpers/auth';

test.describe('Family: Create Job', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAsFamilyPaid(context, page);
  });

  test('should display the create job page heading', async ({ page }) => {
    await page.goto('/app/vagas/criar');

    // Page heading "Criar Vaga" loads immediately
    await expect(page.getByText('Criar Vaga').first()).toBeVisible({ timeout: 15000 });
  });

  test('should load the create job form', async ({ page }) => {
    await page.goto('/app/vagas/criar');

    // Wait for the form to load (it fetches children data first, shows spinner)
    await expect(
      page.getByText(/Informações Básicas/i).or(page.getByText(/informações básicas/i)),
    ).toBeVisible({ timeout: 30000 });
  });

  test('should show child selection cards after loading', async ({ page }) => {
    await page.goto('/app/vagas/criar');

    // familyPaid has 2 children (Lucas, Sofia) — wait for form + children to load
    await expect(page.getByText('Lucas')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Sofia')).toBeVisible();
  });

  test('should navigate to job list from vagas page', async ({ page }) => {
    await page.goto('/app/vagas');

    // familyPaid should see their active job
    await expect(
      page.getByText('Babá fixa para 2 crianças em São Paulo'),
    ).toBeVisible({ timeout: 15000 });

    // Should have a "Criar Vaga" button
    await expect(page.getByText('Criar Vaga').first()).toBeVisible();
  });
});
