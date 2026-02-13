import { test, expect } from '@playwright/test';
import { loginAsFamily } from '../helpers/auth';

test.describe('Subscription: Family Upgrade Flow', () => {
  test('should open upgrade modal when clicking Fazer Upgrade', async ({ context, page }) => {
    await loginAsFamily(context, page);
    await page.goto('/app/assinatura');

    // Click upgrade button
    const upgradeBtn = page.getByRole('button', { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    // PremiumUpsellModal should open with Plus plan heading
    await expect(
      page.getByRole('heading', { name: /Assine o Cuidly Plus/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show Plus benefits in upgrade modal', async ({ context, page }) => {
    await loginAsFamily(context, page);
    await page.goto('/app/assinatura');

    const upgradeBtn = page.getByRole('button', { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    // Wait for modal to open
    await expect(
      page.getByText(/Assinar Plus/i).first(),
    ).toBeVisible({ timeout: 10000 });

    // Should show key benefits
    await expect(page.getByText(/compatibilidade/i).first()).toBeVisible();
    await expect(page.getByText(/mensagens/i).first()).toBeVisible();
  });

  test('should show trust message in upgrade modal', async ({ context, page }) => {
    await loginAsFamily(context, page);
    await page.goto('/app/assinatura');

    const upgradeBtn = page.getByRole('button', { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    // Wait for modal
    await expect(
      page.getByText(/Assinar Plus/i).first(),
    ).toBeVisible({ timeout: 10000 });

    // Trust message
    await expect(
      page.getByText(/Cancele quando quiser/i),
    ).toBeVisible();
  });

  test('should open checkout modal when clicking Assinar Plus', async ({ context, page }) => {
    await loginAsFamily(context, page);
    await page.goto('/app/assinatura');

    const upgradeBtn = page.getByRole('button', { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    // Wait for upsell modal
    const assinarBtn = page.getByRole('button', { name: /Assinar Plus/i });
    await expect(assinarBtn).toBeVisible({ timeout: 10000 });

    // Mock pending payments check to return no pending
    await page.route('**/api/payments/pending', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPending: false }),
      }),
    );

    await assinarBtn.click();

    // Checkout modal should open — look for payment form elements
    await expect(
      page.getByText('Cartão').first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show billing interval options in checkout', async ({ context, page }) => {
    await loginAsFamily(context, page);
    await page.goto('/app/assinatura');

    // Mock pending payments
    await page.route('**/api/payments/pending', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPending: false }),
      }),
    );

    const upgradeBtn = page.getByRole('button', { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    const assinarBtn = page.getByRole('button', { name: /Assinar Plus/i });
    await expect(assinarBtn).toBeVisible({ timeout: 10000 });
    await assinarBtn.click();

    // Should show billing interval options (Mensal and Trimestral for families)
    await expect(page.getByText('Mensal').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Trimestral').first()).toBeVisible();
  });
});
