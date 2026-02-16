import { test, expect, type BrowserContext } from '@playwright/test';
import { loginAsFamily, loginAsNanny, loginAsNannyForTrial } from '../helpers/auth';

const VALIDATE_URL = '/api/coupons/validate';

/**
 * Helper to call POST /api/coupons/validate via the browser context
 * (shares auth cookies set by loginAs*).
 */
async function validateCoupon(
  context: BrowserContext,
  data: { code: string; planId: string; billingInterval?: string },
) {
  const response = await context.request.post(VALIDATE_URL, {
    data: {
      code: data.code,
      planId: data.planId,
      billingInterval: data.billingInterval ?? 'MONTH',
    },
  });
  const body = await response.json();
  return { status: response.status(), body };
}

// ─── Valid Coupons ──────────────────────────────────────────────

test.describe('Coupon: Valid Coupons (API)', () => {
  test('should apply percentage discount (TESTE20 → 20% off R$47)', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'TESTE20',
      planId: 'FAMILY_PLUS',
      billingInterval: 'MONTH',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
    expect(body.originalAmount).toBe(47);
    expect(body.discountAmount).toBeCloseTo(9.4, 1);
    expect(body.finalAmount).toBeCloseTo(37.6, 1);
  });

  test('should cap percentage discount at maxDiscount (TESTE50CAP → 50% capped at R$10)', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'TESTE50CAP',
      planId: 'FAMILY_PLUS',
      billingInterval: 'MONTH',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
    expect(body.originalAmount).toBe(47);
    expect(body.discountAmount).toBe(10);
    expect(body.finalAmount).toBe(37);
  });

  test('should apply fixed discount (FIXO15 → R$15 off R$47)', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'FIXO15',
      planId: 'FAMILY_PLUS',
      billingInterval: 'MONTH',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
    expect(body.originalAmount).toBe(47);
    expect(body.discountAmount).toBe(15);
    expect(body.finalAmount).toBe(32);
  });

  test('should cap fixed discount at purchase amount (FIXO999 → R$999 capped at R$19)', async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'FIXO999',
      planId: 'NANNY_PRO',
      billingInterval: 'MONTH',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
    expect(body.originalAmount).toBe(19);
    expect(body.discountAmount).toBe(19);
    expect(body.finalAmount).toBe(0);
  });

  test('should apply free trial days coupon (TRIAL7 → 100% discount)', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'TRIAL7',
      planId: 'FAMILY_PLUS',
      billingInterval: 'MONTH',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
    expect(body.originalAmount).toBe(47);
    expect(body.discountAmount).toBe(47);
    expect(body.finalAmount).toBe(0);
  });

  test('should validate coupon code case-insensitively', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'teste20',
      planId: 'FAMILY_PLUS',
      billingInterval: 'MONTH',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
    expect(body.discountAmount).toBeCloseTo(9.4, 1);
  });

  test('should calculate discount for different billing intervals (TESTE20 on QUARTER R$94)', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'TESTE20',
      planId: 'FAMILY_PLUS',
      billingInterval: 'QUARTER',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
    expect(body.originalAmount).toBe(94);
    expect(body.discountAmount).toBeCloseTo(18.8, 1);
    expect(body.finalAmount).toBeCloseTo(75.2, 1);
  });
});

// ─── Invalid Coupons ────────────────────────────────────────────

test.describe('Coupon: Invalid Coupons (API)', () => {
  test('should reject non-existent coupon code', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'INEXISTENTE',
      planId: 'FAMILY_PLUS',
    });

    expect(status).toBe(400);
    expect(body.isValid).toBe(false);
    expect(body.errorCode).toBe('COUPON_NOT_FOUND');
  });

  test('should reject inactive coupon', async ({ context, page }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'INATIVO',
      planId: 'FAMILY_PLUS',
    });

    expect(status).toBe(400);
    expect(body.isValid).toBe(false);
    expect(body.errorCode).toBe('COUPON_INACTIVE');
  });

  test('should reject expired coupon', async ({ context, page }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'EXPIRADO',
      planId: 'FAMILY_PLUS',
    });

    expect(status).toBe(400);
    expect(body.isValid).toBe(false);
    expect(body.errorCode).toBe('COUPON_EXPIRED');
  });

  test('should reject coupon that has not started yet', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'FUTURO',
      planId: 'FAMILY_PLUS',
    });

    expect(status).toBe(400);
    expect(body.isValid).toBe(false);
    expect(body.errorCode).toBe('COUPON_NOT_STARTED');
  });

  test('should reject coupon with exhausted usage limit', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'LIMITADO',
      planId: 'FAMILY_PLUS',
    });

    expect(status).toBe(400);
    expect(body.isValid).toBe(false);
    expect(body.errorCode).toBe('COUPON_USAGE_LIMIT');
  });

  test('should return 400 for empty coupon code', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: '',
      planId: 'FAMILY_PLUS',
    });

    expect(status).toBe(400);
    expect(body.error).toBeDefined();
  });
});

// ─── Applicability ──────────────────────────────────────────────

test.describe('Coupon: Applicability (API)', () => {
  test('FAMILIES-only coupon should be valid for family user', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'FAMILIA10',
      planId: 'FAMILY_PLUS',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
  });

  test('FAMILIES-only coupon should be rejected for nanny user', async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'FAMILIA10',
      planId: 'NANNY_PRO',
    });

    expect(status).toBe(400);
    expect(body.isValid).toBe(false);
    expect(body.errorCode).toBe('COUPON_NOT_APPLICABLE');
  });

  test('NANNIES-only coupon should be valid for nanny user', async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'BABA10',
      planId: 'NANNY_PRO',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
  });

  test('NANNIES-only coupon should be rejected for family user', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'BABA10',
      planId: 'FAMILY_PLUS',
    });

    expect(status).toBe(400);
    expect(body.isValid).toBe(false);
    expect(body.errorCode).toBe('COUPON_NOT_APPLICABLE');
  });

  test('SPECIFIC_PLAN coupon should be valid for matching plan', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'PLUSONLY',
      planId: 'FAMILY_PLUS',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
    expect(body.discountAmount).toBeCloseTo(7.05, 1);
  });

  test('SPECIFIC_PLAN coupon should be rejected for non-matching plan', async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'PLUSONLY',
      planId: 'NANNY_PRO',
    });

    expect(status).toBe(400);
    expect(body.isValid).toBe(false);
    expect(body.errorCode).toBe('COUPON_NOT_APPLICABLE');
  });
});

// ─── Constraints ────────────────────────────────────────────────

test.describe('Coupon: Constraints (API)', () => {
  test('should reject coupon when minimum purchase amount is not met', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    // FAMILY_PLUS MONTH = R$47, min purchase = R$100
    const { status, body } = await validateCoupon(context, {
      code: 'MIN100',
      planId: 'FAMILY_PLUS',
      billingInterval: 'MONTH',
    });

    expect(status).toBe(400);
    expect(body.isValid).toBe(false);
    expect(body.errorCode).toBe('COUPON_MIN_PURCHASE');
  });

  test('should accept coupon when minimum purchase amount is met', async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);

    // NANNY_PRO YEAR = R$119 > R$100 min
    const { status, body } = await validateCoupon(context, {
      code: 'MIN100',
      planId: 'NANNY_PRO',
      billingInterval: 'YEAR',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
    expect(body.originalAmount).toBe(119);
    expect(body.discountAmount).toBeCloseTo(11.9, 1);
  });
});

// ─── Checkout Form UI ───────────────────────────────────────────

test.describe('Coupon: Checkout Form UI', () => {
  /**
   * Helper: Login as free family, navigate to subscription page,
   * open upsell modal, and then open checkout modal.
   */
  async function openFamilyCheckout(
    context: BrowserContext,
    page: import('@playwright/test').Page,
  ) {
    // Mock pending payments to avoid real API call
    await page.route('**/api/payments/pending', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPending: false }),
      }),
    );

    await loginAsFamily(context, page);
    await page.goto('/app/assinatura');

    // Open upsell modal
    const upgradeBtn = page.getByRole('button', { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    // Click "Assinar Plus" to open checkout
    const assinarBtn = page.getByRole('button', { name: /Assinar Plus/i });
    await expect(assinarBtn).toBeVisible({ timeout: 10000 });
    await assinarBtn.click();

    // Wait for checkout form to load (use button role to avoid matching "Sem cartão" text)
    await expect(page.getByRole('button', { name: /Cartão/i })).toBeVisible({
      timeout: 10000,
    });
  }

  test('should show "Adicionar cupom" link in checkout', async ({
    context,
    page,
  }) => {
    await openFamilyCheckout(context, page);

    await expect(page.getByText('Adicionar cupom')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show coupon input when clicking "Adicionar cupom"', async ({
    context,
    page,
  }) => {
    await openFamilyCheckout(context, page);

    await page.getByText('Adicionar cupom').click();

    // Coupon input and apply button should appear
    await expect(page.getByPlaceholder('Código')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Aplicar/i }),
    ).toBeVisible();
  });

  test('should show discount when valid coupon is applied', async ({
    context,
    page,
  }) => {
    await openFamilyCheckout(context, page);

    // Open coupon input
    await page.getByText('Adicionar cupom').click();

    // Type coupon code
    const couponInput = page.getByPlaceholder('Código');
    await couponInput.fill('TESTE20');

    // Click apply
    await page.getByRole('button', { name: /Aplicar/i }).click();

    // Should show applied coupon badge (green)
    await expect(page.getByText('TESTE20').first()).toBeVisible({
      timeout: 10000,
    });

    // Should show discount line in summary
    await expect(page.getByText(/Desconto/).first()).toBeVisible();
  });

  test('should show error message for invalid coupon', async ({
    context,
    page,
  }) => {
    await openFamilyCheckout(context, page);

    // Open coupon input
    await page.getByText('Adicionar cupom').click();

    // Type invalid coupon code
    const couponInput = page.getByPlaceholder('Código');
    await couponInput.fill('INEXISTENTE');

    // Click apply
    await page.getByRole('button', { name: /Aplicar/i }).click();

    // Should show error message
    await expect(
      page.getByText(/não encontrado/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should remove coupon and revert price when clicking X', async ({
    context,
    page,
  }) => {
    await openFamilyCheckout(context, page);

    // Apply valid coupon
    await page.getByText('Adicionar cupom').click();
    const couponInput = page.getByPlaceholder('Código');
    await couponInput.fill('TESTE20');
    await page.getByRole('button', { name: /Aplicar/i }).click();

    // Wait for coupon to be applied
    await expect(page.getByText('TESTE20').first()).toBeVisible({
      timeout: 10000,
    });

    // Should show discount line
    await expect(page.getByText(/Desconto/).first()).toBeVisible();

    // Click remove (X button next to applied coupon)
    const removeBtn = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .filter({ hasText: '' })
      .last();

    // Find the green coupon badge and click the X button inside it
    const couponBadge = page.locator('.bg-green-100');
    await couponBadge.locator('button').click();

    // Discount line should disappear and "Adicionar cupom" should return
    await expect(page.getByText('Adicionar cupom')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show error for inactive coupon in UI', async ({
    context,
    page,
  }) => {
    await openFamilyCheckout(context, page);

    await page.getByText('Adicionar cupom').click();
    const couponInput = page.getByPlaceholder('Código');
    await couponInput.fill('INATIVO');
    await page.getByRole('button', { name: /Aplicar/i }).click();

    // Should show specific error
    await expect(
      page.getByText(/inativo/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show error for expired coupon in UI', async ({
    context,
    page,
  }) => {
    await openFamilyCheckout(context, page);

    await page.getByText('Adicionar cupom').click();
    const couponInput = page.getByPlaceholder('Código');
    await couponInput.fill('EXPIRADO');
    await page.getByRole('button', { name: /Aplicar/i }).click();

    await expect(
      page.getByText(/expirou/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });
});

// ─── Cardless Trial ───────────────────────────────────────────

const ACTIVATE_TRIAL_URL = '/api/subscription/activate-trial';

test.describe('Coupon: Cardless Trial (API)', () => {
  test('should return isFreeTrial and requiresCreditCard fields for cardless trial coupon', async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'TRIAL90NOCARD',
      planId: 'NANNY_PRO',
      billingInterval: 'MONTH',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
    expect(body.isFreeTrial).toBe(true);
    expect(body.trialDays).toBe(90);
    expect(body.requiresCreditCard).toBe(false);
    expect(body.finalAmount).toBe(0);
  });

  test('should activate trial without credit card via activate-trial endpoint', async ({
    context,
    page,
  }) => {
    // Use dedicated trial user to avoid mutating the shared nanny user's subscription state
    await loginAsNannyForTrial(context, page);

    const response = await context.request.post(ACTIVATE_TRIAL_URL, {
      data: {
        plan: 'NANNY_PRO',
        billingInterval: 'MONTH',
        couponCode: 'TRIAL90NOCARD',
      },
    });

    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.status).toBe('TRIALING');
    expect(body.trialDays).toBe(90);
    expect(body.trialEndDate).toBeDefined();
  });

  test('should reject cardless trial for family user (NANNIES-only coupon)', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const response = await context.request.post(ACTIVATE_TRIAL_URL, {
      data: {
        plan: 'FAMILY_PLUS',
        billingInterval: 'MONTH',
        couponCode: 'TRIAL90NOCARD',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('should return isFreeTrial with requiresCreditCard true for regular trial coupon', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await validateCoupon(context, {
      code: 'TRIAL7',
      planId: 'FAMILY_PLUS',
      billingInterval: 'MONTH',
    });

    expect(status).toBe(200);
    expect(body.isValid).toBe(true);
    expect(body.isFreeTrial).toBe(true);
    expect(body.trialDays).toBe(7);
    expect(body.requiresCreditCard).toBe(true);
  });
});

// ─── Cardless Trial: Checkout UI ─────────────────────────────

test.describe('Coupon: Cardless Trial Checkout UI', () => {
  async function openNannyCheckout(
    context: import('@playwright/test').BrowserContext,
    page: import('@playwright/test').Page,
  ) {
    await page.route('**/api/payments/pending', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPending: false }),
      }),
    );

    // Mock trial eligibility so the "Assinar Pro" button shows instead of trial offer
    await page.route('**/api/subscription/trial-eligibility', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ eligible: false, reason: 'mocked_for_test' }),
      }),
    );

    await loginAsNanny(context, page);
    await page.goto('/app/assinatura');

    // Open upsell modal
    const upgradeBtn = page.getByRole('button', { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    // Click "Assinar Pro" to open checkout (wait for modal to settle)
    const assinarBtn = page.getByRole('button', { name: /Assinar Pro/i });
    await expect(assinarBtn).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    await assinarBtn.click();

    // Wait for checkout form to load (use button role to avoid matching "Sem cartão" text)
    await expect(page.getByRole('button', { name: /Cartão/i })).toBeVisible({
      timeout: 10000,
    });
  }

  test('should hide payment fields when cardless trial coupon is applied', async ({
    context,
    page,
  }) => {
    await openNannyCheckout(context, page);

    // Open coupon input
    await page.getByText('Adicionar cupom').click();

    // Type coupon code
    const couponInput = page.getByPlaceholder('Código');
    await couponInput.fill('TRIAL90NOCARD');

    // Click apply
    await page.getByRole('button', { name: /Aplicar/i }).click();

    // Should show applied coupon badge
    await expect(page.getByText('TRIAL90NOCARD').first()).toBeVisible({
      timeout: 10000,
    });

    // Payment tabs (Cartão/PIX) should be hidden
    await expect(page.getByRole('button', { name: /Cartão/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /PIX/i })).not.toBeVisible();

    // Should show trial activation button
    await expect(
      page.getByRole('button', { name: /Ativar Período de Teste Gratuito/i }),
    ).toBeVisible();

    // Should show trial days info
    await expect(page.getByText(/90 dias/).first()).toBeVisible();

    // Should show "Grátis" instead of price
    await expect(page.getByText('Grátis').first()).toBeVisible();
  });
});
