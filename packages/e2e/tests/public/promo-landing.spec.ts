import { test, expect } from '@playwright/test';

test.describe('Promo Landing: Famílias', () => {
  test('should load /promo/familias page', async ({ page }) => {
    await page.goto('/promo/familias');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display hero with promotional offer', async ({ page }) => {
    await page.goto('/promo/familias');

    // Hero title
    await expect(
      page.getByText('Encontre a babá ideal').first(),
    ).toBeVisible({ timeout: 15000 });

    // Promo badge
    await expect(
      page.getByText('Oferta de lançamento').first(),
    ).toBeVisible();

    // Free trial mention
    await expect(
      page.getByText(/1 mês grátis/i).first(),
    ).toBeVisible();
  });

  test('should have CTA linking to checkout with coupon', async ({ page }) => {
    await page.goto('/promo/familias');

    // Find a CTA button
    const ctaLink = page.locator('a[href*="coupon=VIP30"]').first();
    await expect(ctaLink).toBeVisible({ timeout: 15000 });

    // Verify it points to checkout with correct plan and coupon
    const href = await ctaLink.getAttribute('href');
    expect(href).toContain('plan=FAMILY_PLUS');
    expect(href).toContain('coupon=VIP30');
  });

  test('should display benefits section', async ({ page }) => {
    await page.goto('/promo/familias');

    await expect(page.getByText('Chat ilimitado').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Matching inteligente').first()).toBeVisible();
  });

  test('should display comparison section (Free vs Plus)', async ({ page }) => {
    await page.goto('/promo/familias');

    await expect(page.getByText('Free vs Plus').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Cuidly Free').first()).toBeVisible();
    await expect(page.getByText('Cuidly Plus').first()).toBeVisible();
  });

  test('should display FAQ section', async ({ page }) => {
    await page.goto('/promo/familias');

    await expect(
      page.getByText('Perguntas frequentes').first(),
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.getByText('Posso cancelar a qualquer momento?').first(),
    ).toBeVisible();
  });

  test('should have a signup link', async ({ page }) => {
    await page.goto('/promo/familias');

    const signupLink = page.locator('a[href="/cadastro"]').first();
    await expect(signupLink).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Promo Landing: Babás', () => {
  test('should load /promo/babas page', async ({ page }) => {
    await page.goto('/promo/babas');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display hero with promotional offer', async ({ page }) => {
    await page.goto('/promo/babas');

    // Hero title
    await expect(
      page.getByText('Destaque seu perfil').first(),
    ).toBeVisible({ timeout: 15000 });

    // Promo badge
    await expect(
      page.getByText('Oferta de lançamento').first(),
    ).toBeVisible();

    // Free trial mention
    await expect(
      page.getByText(/1 mês grátis/i).first(),
    ).toBeVisible();
  });

  test('should have CTA linking to checkout with coupon', async ({ page }) => {
    await page.goto('/promo/babas');

    // Find a CTA button
    const ctaLink = page.locator('a[href*="coupon=VIP30"]').first();
    await expect(ctaLink).toBeVisible({ timeout: 15000 });

    // Verify it points to checkout with correct plan and coupon
    const href = await ctaLink.getAttribute('href');
    expect(href).toContain('plan=NANNY_PRO');
    expect(href).toContain('coupon=VIP30');
  });

  test('should display benefits section', async ({ page }) => {
    await page.goto('/promo/babas');

    await expect(page.getByText('Perfil em destaque').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Matching prioritário').first()).toBeVisible();
    await expect(page.getByText('Mensagens ilimitadas').first()).toBeVisible();
  });

  test('should display comparison section (Básico vs Pro)', async ({ page }) => {
    await page.goto('/promo/babas');

    await expect(page.getByText('Básico vs Pro').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Cuidly Básico').first()).toBeVisible();
    await expect(page.getByText('Cuidly Pro').first()).toBeVisible();
  });

  test('should mention seals during trial in FAQ', async ({ page }) => {
    await page.goto('/promo/babas');

    await expect(
      page.getByText('Vou ganhar o selo Verificada durante o trial?').first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test('should have a signup link', async ({ page }) => {
    await page.goto('/promo/babas');

    const signupLink = page.locator('a[href="/cadastro"]').first();
    await expect(signupLink).toBeVisible({ timeout: 15000 });
  });
});
