import { test, expect } from '@playwright/test';
import { loginAsFamilyPaid, loginAsNannyPro, loginAsFamily, loginAsNanny } from '../helpers/auth';

test.describe('Subscription: Management Page', () => {
  test.describe('Family with Plus plan', () => {
    test('should show current plan name and status', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      // Should see the plan name
      await expect(
        page.getByText(/Plus/i).first(),
      ).toBeVisible({ timeout: 15000 });

      // Should see active status badge
      await expect(page.getByText('Ativa').first()).toBeVisible();
    });

    test('should show pricing info', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      // Should see "por mês" in the plan description
      await expect(
        page.getByText(/por mês/i).first(),
      ).toBeVisible({ timeout: 15000 });
    });

    test('should show renewal and charge info', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      // Should see next renewal section
      await expect(
        page.getByText('Próxima renovação').first(),
      ).toBeVisible({ timeout: 15000 });

      // Should see next charge section
      await expect(
        page.getByText('Próxima cobrança').first(),
      ).toBeVisible();
    });

    test('should show cancel subscription link', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      await expect(
        page.getByText('Cancelar assinatura'),
      ).toBeVisible({ timeout: 15000 });
    });

    test('should NOT show Fazer Upgrade button for paid plan', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      // Wait for page to load
      await expect(page.getByText('Ativa').first()).toBeVisible({ timeout: 15000 });

      // Should NOT see upgrade button
      await expect(
        page.getByRole('button', { name: /Fazer Upgrade/i }),
      ).not.toBeVisible();
    });
  });

  test.describe('Family with free plan', () => {
    test('should show free plan name', async ({ context, page }) => {
      await loginAsFamily(context, page);
      await page.goto('/app/assinatura');

      // Should see free plan indicator
      await expect(
        page.getByText(/Gratuito|Free/i).first(),
      ).toBeVisible({ timeout: 15000 });
    });

    test('should show Fazer Upgrade button', async ({ context, page }) => {
      await loginAsFamily(context, page);
      await page.goto('/app/assinatura');

      await expect(
        page.getByRole('button', { name: /Fazer Upgrade/i }),
      ).toBeVisible({ timeout: 15000 });
    });

    test('should NOT show cancel subscription link', async ({ context, page }) => {
      await loginAsFamily(context, page);
      await page.goto('/app/assinatura');

      // Wait for page to load
      await expect(
        page.getByRole('button', { name: /Fazer Upgrade/i }),
      ).toBeVisible({ timeout: 15000 });

      // Cancel link should not be visible for free plan
      await expect(
        page.getByText('Cancelar assinatura'),
      ).not.toBeVisible();
    });
  });

  test.describe('Nanny with Pro plan', () => {
    test('should show Pro plan name and status', async ({ context, page }) => {
      await loginAsNannyPro(context, page);
      await page.goto('/app/assinatura');

      // Should show "Cuidly Pro" plan name
      await expect(
        page.getByText('Cuidly Pro').first(),
      ).toBeVisible({ timeout: 15000 });

      // Should show a status badge (Ativa or Pagamento Pendente)
      await expect(
        page.getByText('Ativa').or(page.getByText('Pagamento Pendente')).first(),
      ).toBeVisible();
    });

    test('should show cancel subscription link', async ({ context, page }) => {
      await loginAsNannyPro(context, page);
      await page.goto('/app/assinatura');

      await expect(
        page.getByText('Cancelar assinatura'),
      ).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Nanny with free plan', () => {
    test('should show free plan and upgrade button', async ({ context, page }) => {
      await loginAsNanny(context, page);
      await page.goto('/app/assinatura');

      await expect(
        page.getByRole('button', { name: /Fazer Upgrade/i }),
      ).toBeVisible({ timeout: 15000 });
    });
  });
});
