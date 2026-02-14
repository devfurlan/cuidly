import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { loginAsFamily, loginAsFamilyPaid, loginAsNanny, loginAsNannyPro } from '../helpers/auth';

const ELIGIBILITY_URL = '/api/subscription/trial-eligibility';
const ACTIVATE_URL = '/api/subscription/activate-trigger-trial';

/**
 * Helper to call GET /api/subscription/trial-eligibility via the browser context
 * (shares auth cookies set by loginAs*).
 */
async function checkEligibility(context: BrowserContext) {
  const response = await context.request.get(ELIGIBILITY_URL);
  const body = await response.json();
  return { status: response.status(), body };
}

/**
 * Helper to call POST /api/subscription/activate-trigger-trial via the browser context.
 */
async function activateTriggerTrial(context: BrowserContext) {
  const response = await context.request.post(ACTIVATE_URL);
  const body = await response.json();
  return { status: response.status(), body };
}

// ─── Trial Eligibility (API) ──────────────────────────────────

test.describe('Trigger Trial: Eligibility (API)', () => {
  test('free family should be eligible for trigger trial', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await checkEligibility(context);

    expect(status).toBe(200);
    expect(body.eligible).toBe(true);
    expect(body.trialDays).toBe(7);
    expect(body.plan).toBe('FAMILY_PLUS');
  });

  test('free nanny should be eligible for trigger trial', async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);

    const { status, body } = await checkEligibility(context);

    expect(status).toBe(200);
    expect(body.eligible).toBe(true);
    expect(body.trialDays).toBe(7);
    expect(body.plan).toBe('NANNY_PRO');
  });

  test('paid family should NOT be eligible for trigger trial', async ({
    context,
    page,
  }) => {
    await loginAsFamilyPaid(context, page);

    const { status, body } = await checkEligibility(context);

    expect(status).toBe(200);
    expect(body.eligible).toBe(false);
    expect(body.reason).toBeDefined();
  });

  test('pro nanny should NOT be eligible for trigger trial', async ({
    context,
    page,
  }) => {
    await loginAsNannyPro(context, page);

    const { status, body } = await checkEligibility(context);

    expect(status).toBe(200);
    expect(body.eligible).toBe(false);
    expect(body.reason).toBeDefined();
  });

  test('unauthenticated request should return 401', async ({ context }) => {
    const response = await context.request.get(ELIGIBILITY_URL);
    expect(response.status()).toBe(401);
  });
});

// ─── Trial Activation (API) ──────────────────────────────────
// NOTE: These tests modify database state (upgrade subscription, mark trial as used).
// They should run after eligibility tests to avoid affecting other tests.

test.describe('Trigger Trial: Activation (API)', () => {
  test('free family should activate trigger trial successfully', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await activateTriggerTrial(context);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.status).toBe('TRIALING');
    expect(body.plan).toBe('FAMILY_PLUS');
    expect(body.trialDays).toBe(7);
    expect(body.trialEndDate).toBeDefined();
  });

  test('family should NOT be able to activate trigger trial twice', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    // Family already activated in the previous test
    const { status, body } = await activateTriggerTrial(context);

    expect(status).toBe(400);
    expect(body.error).toBeDefined();
  });

  test('family should no longer be eligible after using trigger trial', async ({
    context,
    page,
  }) => {
    await loginAsFamily(context, page);

    const { status, body } = await checkEligibility(context);

    expect(status).toBe(200);
    expect(body.eligible).toBe(false);
  });

  test('paid family should NOT be able to activate trigger trial', async ({
    context,
    page,
  }) => {
    await loginAsFamilyPaid(context, page);

    const { status, body } = await activateTriggerTrial(context);

    expect(status).toBe(400);
    expect(body.error).toBeDefined();
  });

  test('pro nanny should NOT be able to activate trigger trial', async ({
    context,
    page,
  }) => {
    await loginAsNannyPro(context, page);

    const { status, body } = await activateTriggerTrial(context);

    expect(status).toBe(400);
    expect(body.error).toBeDefined();
  });

  test('unauthenticated request should return 401', async ({ context }) => {
    const response = await context.request.post(ACTIVATE_URL);
    expect(response.status()).toBe(401);
  });
});

// ─── Nanny Trigger Trial Activation ───────────────────────────
// Separate describe block so nanny activation doesn't interfere with family tests.

test.describe('Trigger Trial: Nanny Activation (API)', () => {
  test('free nanny should activate trigger trial successfully', async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);

    const { status, body } = await activateTriggerTrial(context);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.status).toBe('TRIALING');
    expect(body.plan).toBe('NANNY_PRO');
    expect(body.trialDays).toBe(7);
    expect(body.trialEndDate).toBeDefined();
  });

  test('nanny should NOT be able to activate trigger trial twice', async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);

    const { status, body } = await activateTriggerTrial(context);

    expect(status).toBe(400);
    expect(body.error).toBeDefined();
  });

  test('nanny should no longer be eligible after using trigger trial', async ({
    context,
    page,
  }) => {
    await loginAsNanny(context, page);

    const { status, body } = await checkEligibility(context);

    expect(status).toBe(200);
    expect(body.eligible).toBe(false);
  });
});
