import { test, expect } from '@playwright/test';
import { loginAsFamilyPaid, loginAsNannyPro } from '../helpers/auth';

test.describe('Subscription: Cancellation Flow', () => {
  test.describe('Family cancellation', () => {
    test('should open cancellation modal when clicking cancel link', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      // Click cancel link
      const cancelLink = page.getByText('Cancelar assinatura');
      await expect(cancelLink).toBeVisible({ timeout: 15000 });
      await cancelLink.click();

      // Step 1: Retention screen
      await expect(
        page.getByText('Tem certeza?'),
      ).toBeVisible({ timeout: 10000 });
    });

    test('should show retention benefits for family', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      const cancelLink = page.getByText('Cancelar assinatura');
      await expect(cancelLink).toBeVisible({ timeout: 15000 });
      await cancelLink.click();

      // Should show benefits they'll lose
      await expect(page.getByText('Tem certeza?')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/Chat ilimitado/i).first()).toBeVisible();
      await expect(page.getByText(/Matching inteligente/i).first()).toBeVisible();
    });

    test('should show "Manter meu plano" button on retention step', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      const cancelLink = page.getByText('Cancelar assinatura');
      await expect(cancelLink).toBeVisible({ timeout: 15000 });
      await cancelLink.click();

      await expect(page.getByText('Tem certeza?')).toBeVisible({ timeout: 10000 });

      await expect(
        page.getByRole('button', { name: /Manter meu plano/i }),
      ).toBeVisible();
    });

    test('should navigate to reason step when clicking "Continuar cancelando"', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      const cancelLink = page.getByText('Cancelar assinatura');
      await expect(cancelLink).toBeVisible({ timeout: 15000 });
      await cancelLink.click();

      await expect(page.getByText('Tem certeza?')).toBeVisible({ timeout: 10000 });

      // Click continue canceling
      await page.getByRole('button', { name: /Continuar cancelando/i }).click();

      // Step 2: Reason selection
      await expect(
        page.getByText(/Nos ajude a melhorar/i),
      ).toBeVisible({ timeout: 10000 });
    });

    test('should show cancellation reason options', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      const cancelLink = page.getByText('Cancelar assinatura');
      await expect(cancelLink).toBeVisible({ timeout: 15000 });
      await cancelLink.click();

      await expect(page.getByText('Tem certeza?')).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /Continuar cancelando/i }).click();

      await expect(page.getByText(/Nos ajude a melhorar/i)).toBeVisible({ timeout: 10000 });

      // Should show reason options
      await expect(page.getByText(/Encontrei o que precisava/i)).toBeVisible();
      await expect(page.getByText(/Muito caro/i)).toBeVisible();
      await expect(page.getByText(/Não estou usando/i)).toBeVisible();
    });

    test('should disable confirm button until reason is selected', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      const cancelLink = page.getByText('Cancelar assinatura');
      await expect(cancelLink).toBeVisible({ timeout: 15000 });
      await cancelLink.click();

      await expect(page.getByText('Tem certeza?')).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /Continuar cancelando/i }).click();

      await expect(page.getByText(/Nos ajude a melhorar/i)).toBeVisible({ timeout: 10000 });

      // Confirm button should be disabled initially
      const confirmBtn = page.getByRole('button', { name: /Confirmar cancelamento/i });
      await expect(confirmBtn).toBeDisabled();

      // Select a reason
      await page.getByText(/Encontrei o que precisava/i).click();

      // Now confirm should be enabled
      await expect(confirmBtn).toBeEnabled();
    });

    test('should complete cancellation and show confirmation', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      // Mock the cancel API
      await page.route('**/api/subscription/cancel', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Assinatura cancelada. Você terá acesso até o fim do período atual.',
            subscription: {
              id: 'test-sub-id',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              cancelAtPeriodEnd: true,
            },
          }),
        }),
      );

      const cancelLink = page.getByText('Cancelar assinatura');
      await expect(cancelLink).toBeVisible({ timeout: 15000 });
      await cancelLink.click();

      // Step 1: Retention
      await expect(page.getByText('Tem certeza?')).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /Continuar cancelando/i }).click();

      // Step 2: Reason
      await expect(page.getByText(/Nos ajude a melhorar/i)).toBeVisible({ timeout: 10000 });
      await page.getByText(/Encontrei o que precisava/i).click();
      await page.getByRole('button', { name: /Confirmar cancelamento/i }).click();

      // Step 3: Confirmation
      await expect(
        page.getByText(/Cancelamento agendado/i),
      ).toBeVisible({ timeout: 10000 });
    });

    test('should show "Entendi" button on confirmation step', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);
      await page.goto('/app/assinatura');

      // Mock the cancel API
      await page.route('**/api/subscription/cancel', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Assinatura cancelada.',
            subscription: {
              id: 'test-sub-id',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              cancelAtPeriodEnd: true,
            },
          }),
        }),
      );

      const cancelLink = page.getByText('Cancelar assinatura');
      await expect(cancelLink).toBeVisible({ timeout: 15000 });
      await cancelLink.click();

      await expect(page.getByText('Tem certeza?')).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /Continuar cancelando/i }).click();

      await expect(page.getByText(/Nos ajude a melhorar/i)).toBeVisible({ timeout: 10000 });
      await page.getByText(/Muito caro/i).click();
      await page.getByRole('button', { name: /Confirmar cancelamento/i }).click();

      // Should see "Entendi" button
      await expect(
        page.getByRole('button', { name: /Entendi/i }),
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Nanny cancellation', () => {
    test('should open cancellation modal for nanny Pro', async ({ context, page }) => {
      await loginAsNannyPro(context, page);
      await page.goto('/app/assinatura');

      const cancelLink = page.getByText('Cancelar assinatura');
      await expect(cancelLink).toBeVisible({ timeout: 15000 });
      await cancelLink.click();

      // Step 1: Retention
      await expect(page.getByText('Tem certeza?')).toBeVisible({ timeout: 10000 });
    });

    test('should show nanny-specific retention benefits', async ({ context, page }) => {
      await loginAsNannyPro(context, page);
      await page.goto('/app/assinatura');

      const cancelLink = page.getByText('Cancelar assinatura');
      await expect(cancelLink).toBeVisible({ timeout: 15000 });
      await cancelLink.click();

      await expect(page.getByText('Tem certeza?')).toBeVisible({ timeout: 10000 });

      // Nanny-specific benefits
      await expect(page.getByText(/Mensagens ilimitadas/i).first()).toBeVisible();
      await expect(page.getByText(/Perfil em destaque/i).first()).toBeVisible();
      await expect(page.getByText(/Matching prioritário/i).first()).toBeVisible();
    });
  });

  test.describe('Cancellation warning banner', () => {
    test('should show cancellation warning after canceling', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);

      // Mock subscription API to return a canceled subscription
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
            cancelAtPeriodEnd: true,
            canceledAt: new Date().toISOString(),
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

      // Should show cancellation warning banner
      await expect(
        page.getByText('Cancelamento agendado'),
      ).toBeVisible({ timeout: 15000 });

      // Should show "Manter meu plano" button in the banner
      await expect(
        page.getByRole('button', { name: /Manter meu plano/i }).first(),
      ).toBeVisible();
    });

    test('should show "Não haverá renovação" when cancelled', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);

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
            cancelAtPeriodEnd: true,
            canceledAt: new Date().toISOString(),
            payments: [],
          }),
        }),
      );

      await page.goto('/app/assinatura');

      await expect(
        page.getByText('Não haverá renovação'),
      ).toBeVisible({ timeout: 15000 });

      await expect(
        page.getByText('Cancelada').first(),
      ).toBeVisible();
    });

    test('should show Reativar Assinatura button when cancelled', async ({ context, page }) => {
      await loginAsFamilyPaid(context, page);

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
            cancelAtPeriodEnd: true,
            canceledAt: new Date().toISOString(),
            payments: [],
          }),
        }),
      );

      await page.goto('/app/assinatura');

      await expect(
        page.getByRole('button', { name: /Reativar Assinatura/i }),
      ).toBeVisible({ timeout: 15000 });
    });
  });
});
