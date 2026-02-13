import { test, expect } from '@playwright/test';

test.describe('Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cadastro');
  });

  test('should display the signup form', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirm-password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar Conta' })).toBeVisible();
  });

  test('should show password validation requirements', async ({ page }) => {
    await page.fill('#password', 'weak');
    await expect(page.getByText('8 caracteres')).toBeVisible();
  });

  test('should disable submit when passwords do not match', async ({ page }) => {
    await page.fill('#email', 'test-signup@cuidly.com');
    await page.fill('#password', 'TestPass123!');
    await page.fill('#confirm-password', 'Different123!');

    const submitButton = page.getByRole('button', { name: 'Criar Conta' });
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit when all requirements are met', async ({ page }) => {
    await page.fill('#email', 'test-signup-valid@test.cuidly.com');
    await page.fill('#password', 'TestPass123!');
    await page.fill('#confirm-password', 'TestPass123!');

    await expect(page.getByText('As senhas coincidem')).toBeVisible();

    const submitButton = page.getByRole('button', { name: 'Criar Conta' });
    await expect(submitButton).toBeEnabled();
  });

  test('should have link to login page', async ({ page }) => {
    await expect(
      page.getByText('Fazer login').or(page.locator('a[href*="login"]').first()),
    ).toBeVisible();
  });

  test('should show Google and Facebook signup buttons', async ({ page }) => {
    await expect(page.getByText('Cadastrar com Google')).toBeVisible();
    await expect(page.getByText('Cadastrar com Facebook')).toBeVisible();
  });
});
