import { test, expect } from '@playwright/test';

test.describe('Public: Nanny Profile', () => {
  test('should display a nanny public profile page', async ({ page }) => {
    await page.goto('/baba/sao-paulo/maria-test-nannypro');

    // Shows "Maria, 35" (first name + age)
    await expect(page.getByText(/Maria,?\s*\d+/).first()).toBeVisible({ timeout: 15000 });
  });

  test('should show nanny experience info', async ({ page }) => {
    await page.goto('/baba/sao-paulo/maria-test-nannypro');

    // Shows "10 anos de exp."
    await expect(page.getByText(/10 anos/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('should show about me section', async ({ page }) => {
    await page.goto('/baba/sao-paulo/maria-test-nannypro');

    await expect(page.getByText('Sobre mim')).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByText(/babá profissional/i),
    ).toBeVisible();
  });

  test('should show verification section', async ({ page }) => {
    await page.goto('/baba/sao-paulo/maria-test-nannypro');

    await expect(page.getByText('Verificações')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Documento validado')).toBeVisible();
  });

  test('should show hourly rate', async ({ page }) => {
    await page.goto('/baba/sao-paulo/maria-test-nannypro');

    await expect(page.getByText(/R\$ 50\/hora/i)).toBeVisible({ timeout: 15000 });
  });

  test('should show contact CTA section', async ({ page }) => {
    await page.goto('/baba/sao-paulo/maria-test-nannypro');

    // The sidebar shows "Falar com Maria" heading
    await expect(page.getByText('Falar com Maria')).toBeVisible({ timeout: 15000 });
  });

  test('should show special needs experience', async ({ page }) => {
    await page.goto('/baba/sao-paulo/maria-test-nannypro');

    // Use .first() to avoid strict mode with badge + heading
    await expect(
      page.getByText('Nec. Especiais').first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test('should display the free nanny public profile', async ({ page }) => {
    await page.goto('/baba/sao-paulo/ana-test-nanny');

    // Shows "Ana, XX" (first name + age)
    await expect(page.getByText(/Ana,?\s*\d+/).first()).toBeVisible({ timeout: 15000 });
  });

  test('should show location info', async ({ page }) => {
    await page.goto('/baba/sao-paulo/maria-test-nannypro');

    await expect(
      page.getByText(/São Paulo/i).first(),
    ).toBeVisible({ timeout: 15000 });
  });
});
