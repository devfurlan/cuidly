/**
 * Webhook simulation helper for Playwright E2E tests.
 *
 * Calls the webhook endpoint directly via fetch (no tunnel needed).
 */

function getEnvOrThrow(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env var: ${name}. Check .env.test`);
  return val;
}

export async function simulatePaymentWebhook(
  baseURL: string,
  event: string,
  data: {
    paymentId?: string;
    subscriptionId?: string;
    status?: string;
    value?: number;
    billingType?: string;
    [key: string]: unknown;
  },
) {
  const accessToken = getEnvOrThrow('ASAAS_ACCESS_TOKEN');

  const response = await fetch(
    `${baseURL}/api/webhooks/payment?gateway=ASAAS`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'asaas-access-token': accessToken,
      },
      body: JSON.stringify({
        event,
        payment: {
          id: data.paymentId || `pay_test_${Date.now()}`,
          subscription: data.subscriptionId,
          status: data.status || 'CONFIRMED',
          value: data.value || 47,
          billingType: data.billingType || 'CREDIT_CARD',
          ...data,
        },
      }),
    },
  );

  return response;
}
