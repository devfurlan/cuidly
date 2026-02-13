import { test, expect } from '@playwright/test';
import { loginAsFamily, loginAsFamilyPaid, loginAsNanny, loginAsNannyPro } from '../helpers/auth';

test.describe('Subscription: Feature Gates', () => {
  test.describe('Family feature gates', () => {
    test('free family should see upgrade modal on subscription page', async ({ context, page }) => {
      await loginAsFamily(context, page);
      await page.goto('/app/assinatura');

      // Free family sees "Fazer Upgrade" button
      const upgradeBtn = page.getByRole('button', { name: /Fazer Upgrade/i });
      await expect(upgradeBtn).toBeVisible({ timeout: 15000 });

      // Click it opens PremiumUpsellModal
      await upgradeBtn.click();

      await expect(
        page.getByText(/Assinar Plus/i).first(),
      ).toBeVisible({ timeout: 10000 });
    });

    test('paid family should NOT see upgrade button on subscription page', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      // Wait for the page to load
      await expect(page.getByText('Ativa').first()).toBeVisible({ timeout: 15000 });

      // Should NOT see upgrade button
      await expect(
        page.getByRole('button', { name: /Fazer Upgrade/i }),
      ).not.toBeVisible();
    });

    test('free family should see payment history empty', async ({ context, page }) => {
      await loginAsFamily(context, page);
      await page.goto('/app/assinatura');

      // Wait for page
      await expect(
        page.getByRole('button', { name: /Fazer Upgrade/i }),
      ).toBeVisible({ timeout: 15000 });

      // Payment history section should not be visible for free plan
      await expect(
        page.getByText('Histórico de Pagamentos'),
      ).not.toBeVisible();
    });

    test('paid family should see payment history', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);

      // Mock subscription with payment history
      await page.route('**/api/subscription/me', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-sub-id',
            plan: 'FAMILY_PLUS',
            status: 'ACTIVE',
            billingInterval: 'MONTH',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            payments: [
              {
                id: 'pay-1',
                amount: 47,
                status: 'PAID',
                createdAt: new Date().toISOString(),
                paymentMethod: 'CREDIT_CARD',
              },
            ],
          }),
        }),
      );

      await page.goto('/app/assinatura');

      await expect(
        page.getByText('Histórico de Pagamentos'),
      ).toBeVisible({ timeout: 15000 });

      // Should show payment amount
      await expect(
        page.getByText('R$\u00a047,00').first(),
      ).toBeVisible();

      // Should show payment status
      await expect(
        page.getByText('Pago').first(),
      ).toBeVisible();
    });
  });

  test.describe('Nanny feature gates', () => {
    test('free nanny should see upgrade button', async ({ context, page }) => {
      await loginAsNanny(context, page);
      await page.goto('/app/assinatura');

      const upgradeBtn = page.getByRole('button', { name: /Fazer Upgrade/i });
      await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    });

    test('free nanny clicking upgrade should open NannyProUpsellModal', async ({ context, page }) => {
      await loginAsNanny(context, page);
      await page.goto('/app/assinatura');

      const upgradeBtn = page.getByRole('button', { name: /Fazer Upgrade/i });
      await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
      await upgradeBtn.click();

      // NannyProUpsellModal should open
      await expect(
        page.getByText(/Assinar Pro/i).first(),
      ).toBeVisible({ timeout: 10000 });
    });

    test('pro nanny should NOT see upgrade button', async ({ context, page }) => {
      await loginAsNannyPro(context, page);
      await page.goto('/app/assinatura');

      // Wait for page to load — nanny Pro shows "Cuidly Pro" plan name
      await expect(page.getByText('Cuidly Pro').first()).toBeVisible({ timeout: 15000 });

      // Should NOT see upgrade (Pro is already a paid plan)
      await expect(
        page.getByRole('button', { name: /Fazer Upgrade/i }),
      ).not.toBeVisible();
    });
  });

  test.describe('Subscription status indicators', () => {
    test('should show ACTIVE status correctly', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      await expect(page.getByText('Ativa').first()).toBeVisible({ timeout: 15000 });
    });

    test('should show PAST_DUE status with mock', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);

      await page.route('**/api/subscription/me', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-sub-id',
            plan: 'FAMILY_PLUS',
            status: 'PAST_DUE',
            billingInterval: 'MONTH',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            payments: [],
          }),
        }),
      );

      await page.goto('/app/assinatura');

      await expect(
        page.getByText('Pagamento Pendente').first(),
      ).toBeVisible({ timeout: 15000 });
    });

    test('should show free plan label correctly', async ({ context, page }) => {
      await loginAsFamily(context, page);

      await page.route('**/api/subscription/me', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            plan: 'FAMILY_FREE',
            status: 'ACTIVE',
            currentPeriodStart: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            payments: [],
          }),
        }),
      );

      await page.goto('/app/assinatura');

      // Should see free plan text
      await expect(
        page.getByText(/Gratuito|Free/i).first(),
      ).toBeVisible({ timeout: 15000 });

      // Should see "Sem cobrança"
      await expect(
        page.getByText(/Sem cobrança/i),
      ).toBeVisible();
    });
  });
});
