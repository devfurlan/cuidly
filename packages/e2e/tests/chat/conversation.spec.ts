import { expect, test } from "@playwright/test";
import { loginAsFamilyPaid, loginAsNannyPro } from "../helpers/auth";

test.describe("Chat: Conversations", () => {
  test("family should see conversations page", async ({ context, page }) => {
    await loginAsFamilyPaid(context, page);
    await page.goto("/app/mensagens");

    // Should see "Mensagens" heading
    await expect(page.getByText("Mensagens").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("family should see conversation with nanny in sidebar", async ({
    context,
    page,
  }) => {
    await loginAsFamilyPaid(context, page);
    await page.goto("/app/mensagens");

    // Screenshot shows "Maria" in the sidebar with message preview
    await expect(page.getByText("Maria").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("family should see messages when clicking a conversation", async ({
    context,
    page,
  }) => {
    await loginAsFamilyPaid(context, page);
    await page.goto("/app/mensagens");

    // Wait for conversation list to load
    await expect(page.getByText("Maria").first()).toBeVisible({
      timeout: 15000,
    });

    // Click the conversation item - click the parent container that is a link
    const conversationLink = page.locator('a[href*="/app/mensagens/"]').first();
    await expect(conversationLink).toBeVisible({ timeout: 5000 });
    await conversationLink.click();

    // Should navigate to conversation detail and show messages
    await page.waitForURL(/\/app\/mensagens\//, { timeout: 10000 });

    // Should see message content
    await expect(
      page.getByText(/podemos conversar/i).or(page.getByText(/candidatou/i)),
    ).toBeVisible({ timeout: 10000 });
  });

  test("nanny should see conversations page", async ({ context, page }) => {
    await loginAsNannyPro(context, page);
    await page.goto("/app/mensagens");

    // Should see "Mensagens" heading
    await expect(page.getByText("Mensagens").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("nanny should see conversation with family in sidebar", async ({
    context,
    page,
  }) => {
    await loginAsNannyPro(context, page);
    await page.goto("/app/mensagens");

    // From nanny side, family name shows as first name only: "Família"
    await expect(page.getByText(/família/i).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
