import { test, expect } from '@playwright/test';
import { simulatePaymentWebhook } from '../helpers/webhook';

test.describe('Subscription: Webhook Handler', () => {
  const baseURL = 'http://localhost:3300';

  test('should accept PAYMENT_OVERDUE webhook', async () => {
    // PAYMENT_OVERDUE doesn't crash even without a real subscription
    // because it only tries to find/update the subscription
    const response = await simulatePaymentWebhook(baseURL, 'PAYMENT_OVERDUE', {
      paymentId: `pay_test_overdue_${Date.now()}`,
      value: 47,
      status: 'OVERDUE',
    });

    // Handler returns 200 after processing (even if no subscription found)
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('received', true);
  });

  test('should reject webhook with invalid token', async () => {
    const response = await fetch(
      `${baseURL}/api/webhooks/payment?gateway=ASAAS`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'asaas-access-token': 'invalid-token',
        },
        body: JSON.stringify({
          event: 'PAYMENT_CONFIRMED',
          payment: { id: 'test', status: 'CONFIRMED', value: 47 },
        }),
      },
    );

    // Should return 401 for invalid token
    expect(response.status).toBe(401);
  });

  test('should return 400 for missing gateway parameter', async () => {
    const accessToken = process.env.ASAAS_ACCESS_TOKEN;

    const response = await fetch(`${baseURL}/api/webhooks/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'asaas-access-token': accessToken } : {}),
      },
      body: JSON.stringify({
        event: 'PAYMENT_CONFIRMED',
        payment: { id: 'test', status: 'CONFIRMED', value: 47 },
      }),
    });

    expect(response.status).toBe(400);
  });

  test('should accept webhook with valid token and return received', async () => {
    // Use an unknown event type — it goes through auth but isn't handled
    const accessToken = process.env.ASAAS_ACCESS_TOKEN;
    if (!accessToken) {
      test.skip();
      return;
    }

    const response = await fetch(
      `${baseURL}/api/webhooks/payment?gateway=ASAAS`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'asaas-access-token': accessToken,
        },
        body: JSON.stringify({
          event: 'UNKNOWN_EVENT_TYPE',
          payment: { id: 'test' },
        }),
      },
    );

    // Should return 200 (unhandled events are silently accepted)
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('received', true);
  });
});
