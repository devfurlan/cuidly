import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';
import {
  getPasswordResetEmailTemplate,
  getWelcomeSubscriptionEmailTemplate,
  getPaymentFailedEmailTemplate,
} from '@/lib/email/react-templates';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * API Route para enviar emails de teste dos novos templates React Email
 * GET /api/test-emails?to=email@example.com
 *
 * APENAS PARA DESENVOLVIMENTO - remover após validação
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get('to');

  if (!to) {
    return NextResponse.json(
      { error: 'Parâmetro "to" é obrigatório' },
      { status: 400 },
    );
  }

  const results: { template: string; success: boolean; error?: string }[] = [];

  // 1. Password Reset Email
  try {
    const passwordResetEmail = await getPasswordResetEmailTemplate({
      name: 'João',
      resetLink: 'https://cuidly.com.br/reset-password?token=abc123',
    });

    const result = await sendEmail({
      to,
      subject: `[TESTE] ${passwordResetEmail.subject}`,
      html: passwordResetEmail.html,
      text: passwordResetEmail.text,
    });

    results.push({
      template: 'Password Reset',
      success: result.success,
      error: result.error || undefined,
    });
  } catch (error) {
    results.push({
      template: 'Password Reset',
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }

  // Wait to avoid rate limit
  await sleep(1500);

  // 2. Welcome Subscription Email (Family)
  try {
    const welcomeEmail = await getWelcomeSubscriptionEmailTemplate({
      name: 'Maria',
      userType: 'family',
      planName: 'Cuidly Plus',
      billingInterval: 'Mensal',
      amount: 'R$ 47,00',
      nextBillingDate: '26 de fevereiro de 2026',
      dashboardUrl: 'https://cuidly.com.br/app',
    });

    const result = await sendEmail({
      to,
      subject: `[TESTE] ${welcomeEmail.subject}`,
      html: welcomeEmail.html,
      text: welcomeEmail.text,
    });

    results.push({
      template: 'Welcome Subscription (Family)',
      success: result.success,
      error: result.error || undefined,
    });
  } catch (error) {
    results.push({
      template: 'Welcome Subscription (Family)',
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }

  // Wait to avoid rate limit
  await sleep(1500);

  // 3. Payment Failed Email
  try {
    const paymentFailedEmail = await getPaymentFailedEmailTemplate({
      name: 'Carlos',
      userType: 'nanny',
      planName: 'Cuidly Pro',
      amount: 'R$ 19,00',
      updatePaymentUrl: 'https://cuidly.com.br/app/assinatura',
    });

    const result = await sendEmail({
      to,
      subject: `[TESTE] ${paymentFailedEmail.subject}`,
      html: paymentFailedEmail.html,
      text: paymentFailedEmail.text,
    });

    results.push({
      template: 'Payment Failed',
      success: result.success,
      error: result.error || undefined,
    });
  } catch (error) {
    results.push({
      template: 'Payment Failed',
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }

  const allSuccess = results.every((r) => r.success);

  return NextResponse.json({
    message: allSuccess
      ? 'Todos os emails de teste foram enviados com sucesso!'
      : 'Alguns emails falharam ao enviar',
    to,
    results,
  });
}
