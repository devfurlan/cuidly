import { expect, test } from "@playwright/test";
import { loginAsNanny } from "../helpers/auth";

test.describe("Subscription: Nanny Upgrade Flow", () => {
  test("should open Pro upgrade modal when clicking Fazer Upgrade", async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);
    await page.goto("/app/assinatura");

    const upgradeBtn = page.getByRole("button", { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    // NannyProUpsellModal should open with heading
    await expect(
      page.getByRole("heading", { name: /Assine o Cuidly Pro/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show Pro benefits in upgrade modal", async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);
    await page.goto("/app/assinatura");

    const upgradeBtn = page.getByRole("button", { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    // Wait for modal
    await expect(page.getByText(/Assinar Pro/i).first()).toBeVisible({
      timeout: 10000,
    });

    // Should show key benefits
    await expect(page.getByText(/Mensagens/i).first()).toBeVisible();
    await expect(page.getByText(/destaque/i).first()).toBeVisible();
  });

  test("should show billing interval toggle (Mensal / Anual)", async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);
    await page.goto("/app/assinatura");

    const upgradeBtn = page.getByRole("button", { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    // Wait for modal
    await expect(page.getByText(/Assinar Pro/i).first()).toBeVisible({
      timeout: 10000,
    });

    // Nanny has Mensal and Anual options
    await expect(page.getByText("Mensal").first()).toBeVisible();
    await expect(page.getByText("Anual").first()).toBeVisible();
  });

  test("should show annual discount info", async ({ context, page }) => {
    await loginAsNanny(context, page);
    await page.goto("/app/assinatura");

    const upgradeBtn = page.getByRole("button", { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    // Wait for modal
    await expect(page.getByText(/Assinar Pro/i).first()).toBeVisible({
      timeout: 10000,
    });

    // Should show discount percentage
    await expect(page.getByText(/Economize/i).first()).toBeVisible();
  });

  test("should show trust message", async ({ context, page }) => {
    await loginAsNanny(context, page);
    await page.goto("/app/assinatura");

    const upgradeBtn = page.getByRole("button", { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    // Wait for modal
    await expect(page.getByText(/Assinar Pro/i).first()).toBeVisible({
      timeout: 10000,
    });

    await expect(page.getByText(/Cancele quando quiser/i)).toBeVisible();
  });

  test("should open checkout modal when clicking Assinar Pro", async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);
    await page.goto("/app/assinatura");

    // Mock pending payments
    await page.route("**/api/payments/pending", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ hasPending: false }),
      }),
    );

    const upgradeBtn = page.getByRole("button", { name: /Fazer Upgrade/i });
    await expect(upgradeBtn).toBeVisible({ timeout: 15000 });
    await upgradeBtn.click();

    const assinarBtn = page.getByRole("button", { name: /Assinar Pro/i });
    await expect(assinarBtn).toBeVisible({ timeout: 10000 });
    await assinarBtn.click();

    // Checkout modal should open - look for payment form elements
    await expect(page.getByText("Cartão").first()).toBeVisible({
      timeout: 10000,
    });
  });
});
