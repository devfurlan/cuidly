import { AsaasStatusMapper } from '@/lib/payment';
import prisma from '@/lib/prisma';
import { PaymentGateway, BillingInterval } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';
import {
  getWelcomeSubscriptionEmailTemplate,
  getRenewalEmailTemplate,
  getPaymentFailedEmailTemplate,
  getPaymentReceiptEmailTemplate,
} from '@/lib/email/react-templates';
import { config } from '@/config';
import { PLAN_LABELS } from '@cuidly/core';

export async function POST(req: NextRequest) {
  try {
    // 1. Identificar o gateway de pagamento
    const gateway = req.nextUrl.searchParams.get('gateway');

    if (!gateway) {
      return NextResponse.json(
        { error: 'Gateway não identificado' },
        { status: 400 },
      );
    }

    // 2. Processar o webhook de acordo com o gateway
    switch (gateway.toUpperCase()) {
      case 'ASAAS':
        return await processAsaasWebhook(req);
      case 'STRIPE':
        return await processStripeWebhook(req);
      default:
        return NextResponse.json(
          { error: 'Gateway não suportado' },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

async function processAsaasWebhook(req: NextRequest) {
  // Obter o corpo raw para verificação de assinatura
  const rawBody = await req.text();

  // Verificar token de autenticação do webhook
  const accessToken = process.env.ASAAS_ACCESS_TOKEN;
  const receivedToken = req.headers.get('asaas-access-token');

  if (accessToken) {
    if (receivedToken !== accessToken) {
      console.error('Webhook Asaas: token de autenticação inválido');
      return NextResponse.json(
        { error: 'Token de autenticação inválido' },
        { status: 401 }
      );
    }
  } else {
    // Log de aviso em desenvolvimento, mas não bloqueia
    console.warn('AVISO: ASAAS_ACCESS_TOKEN não configurado - validação de webhook desabilitada');
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event;

  console.log('Webhook Asaas recebido:', event);

  switch (event) {
    // Eventos de pagamento
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RECEIVED':
      await handlePaymentSuccess(payload, 'ASAAS');
      break;
    case 'PAYMENT_OVERDUE':
      await handlePaymentOverdue(payload, 'ASAAS');
      break;
    case 'PAYMENT_REFUNDED':
      await handlePaymentRefund(payload, 'ASAAS');
      break;
    case 'PAYMENT_DELETED':
      await handlePaymentDeleted(payload);
      break;
    case 'PAYMENT_REFUND_DENIED':
      await handlePaymentRefundDenied(payload);
      break;

    // Eventos de assinatura
    case 'SUBSCRIPTION_CREATED':
      await handleSubscriptionCreated(payload);
      break;
    case 'SUBSCRIPTION_UPDATED':
      await handleSubscriptionUpdate(payload);
      break;
    case 'SUBSCRIPTION_DELETED':
    case 'SUBSCRIPTION_INACTIVATED':
      await handleSubscriptionCancel(payload);
      break;

    // Eventos de Nota Fiscal
    case 'INVOICE_CANCELLED':
      await handleInvoiceCancelled(payload);
      break;
    case 'INVOICE_AUTHORIZED':
      await handleInvoiceAuthorized(payload);
      break;
  }

  return NextResponse.json({ received: true });
}

async function processStripeWebhook(_req: NextRequest) {
  // Implementação para Stripe (futuro)
  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(payload: any, gateway: PaymentGateway) {
  const externalPaymentId = payload.payment.id;
  const externalSubscriptionId = payload.payment.subscription;
  const amount = payload.payment.value;

  // Mapear status específico do gateway para status genérico
  const status = AsaasStatusMapper.toPaymentStatus(payload.payment.status);
  const paymentMethod = AsaasStatusMapper.toPaymentMethod(
    payload.payment.billingType,
  );

  // Buscar assinatura com dados do usuário
  const subscription = await prisma.subscription.findFirst({
    where: { externalSubscriptionId },
    include: {
      nanny: { select: { name: true, emailAddress: true } },
      family: { select: { name: true, emailAddress: true } },
    },
  });

  if (!subscription) {
    console.error('Assinatura não encontrada:', externalSubscriptionId);
    return;
  }

  // Verificar status anterior para determinar tipo de e-mail
  const wasIncomplete = subscription.status === 'INCOMPLETE';
  const wasActive = subscription.status === 'ACTIVE';

  // Calcular nova data de fim do período baseado no ciclo
  const newPeriodEnd = calculateNewPeriodEnd(
    new Date(payload.payment.confirmedDate || payload.payment.paymentDate),
    subscription.billingInterval
  );

  // Atualizar assinatura
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'ACTIVE',
      currentPeriodStart: new Date(
        payload.payment.confirmedDate || payload.payment.paymentDate,
      ),
      currentPeriodEnd: newPeriodEnd,
    },
  });

  // Verificar se o pagamento já existe (criado no checkout)
  const existingPayment = await prisma.payment.findFirst({
    where: { externalPaymentId },
  });

  if (existingPayment) {
    // Atualizar pagamento existente
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status,
        externalInvoiceUrl: payload.payment.invoiceUrl,
        paidAt: new Date(
          payload.payment.confirmedDate || payload.payment.paymentDate,
        ),
      },
    });
  } else {
    // Criar novo pagamento (caso não tenha sido criado no checkout)
    await prisma.payment.create({
      data: {
        nannyId: subscription.nannyId,
        familyId: subscription.familyId,
        subscriptionId: subscription.id,
        amount,
        status,
        type: 'SUBSCRIPTION',
        paymentGateway: gateway,
        externalPaymentId,
        externalInvoiceUrl: payload.payment.invoiceUrl,
        paymentMethod,
        paidAt: new Date(
          payload.payment.confirmedDate || payload.payment.paymentDate,
        ),
      },
    });
  }

  // Log para confirmar recebimento da URL da NF
  if (payload.payment.invoiceUrl) {
    console.log(`[Asaas Webhook] NF emitida para pagamento ${externalPaymentId}: ${payload.payment.invoiceUrl}`);
  }

  // Enviar e-mail apropriado baseado no status anterior
  const userType = subscription.nannyId ? 'nanny' : 'family';
  const userData = subscription.nannyId ? subscription.nanny : subscription.family;
  const email = userData?.emailAddress;
  const name = userData?.name;

  if (email && name) {
    const planLabel = PLAN_LABELS[subscription.plan as keyof typeof PLAN_LABELS] || subscription.plan;
    const billingIntervalLabel = getBillingIntervalLabel(subscription.billingInterval);
    const nextBillingDate = newPeriodEnd.toLocaleDateString('pt-BR');
    const amountFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);

    // Primeiro pagamento PIX (era INCOMPLETE) → e-mail de boas-vindas
    if (wasIncomplete) {
      const emailTemplate = await getWelcomeSubscriptionEmailTemplate({
        name: name.split(' ')[0],
        userType,
        planName: planLabel,
        billingInterval: billingIntervalLabel,
        amount: amountFormatted,
        nextBillingDate,
        dashboardUrl: `${config.site.url}/app`,
      });

      sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      }).catch((err) => console.error('Erro ao enviar e-mail de boas-vindas (webhook):', err));
    }
    // Renovação automática (já era ACTIVE e pagamento não existia) → e-mail de renovação
    else if (wasActive && !existingPayment) {
      const emailTemplate = await getRenewalEmailTemplate({
        name: name.split(' ')[0],
        userType,
        planName: planLabel,
        billingInterval: billingIntervalLabel,
        amount: amountFormatted,
        nextBillingDate,
        manageSubscriptionUrl: `${config.site.url}/app/assinatura/gerenciar`,
      });

      sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      }).catch((err) => console.error('Erro ao enviar e-mail de renovação (webhook):', err));
    }

    // Enviar recibo de pagamento (sempre, para qualquer pagamento confirmado)
    const paymentMethod = AsaasStatusMapper.toPaymentMethod(payload.payment.billingType);
    const paymentMethodLabel = paymentMethod === 'PIX' ? 'PIX' : 'Cartão de Crédito';
    const paymentDate = new Date(
      payload.payment.confirmedDate || payload.payment.paymentDate
    ).toLocaleDateString('pt-BR');

    const receiptTemplate = await getPaymentReceiptEmailTemplate({
      name: name.split(' ')[0],
      userType,
      planName: planLabel,
      billingInterval: billingIntervalLabel,
      amount: amountFormatted,
      paymentDate,
      paymentMethod: paymentMethodLabel,
      invoiceUrl: payload.payment.invoiceUrl,
      nextBillingDate,
      manageSubscriptionUrl: `${config.site.url}/app/assinatura`,
    });

    sendEmail({
      to: email,
      subject: receiptTemplate.subject,
      html: receiptTemplate.html,
      text: receiptTemplate.text,
    }).catch((err) => console.error('Erro ao enviar recibo de pagamento:', err));

    console.log(`[WEBHOOK] Recibo de pagamento enviado para ${email}`);
  }
}

function getBillingIntervalLabel(billingInterval: BillingInterval): string {
  switch (billingInterval) {
    case 'MONTH':
      return 'Mensal';
    case 'QUARTER':
      return 'Trimestral';
    case 'YEAR':
      return 'Anual';
    default:
      return 'Mensal';
  }
}

function calculateNewPeriodEnd(startDate: Date, billingInterval: BillingInterval): Date {
  const date = new Date(startDate);
  switch (billingInterval) {
    case 'MONTH':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'QUARTER':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'YEAR':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  return date;
}

async function handlePaymentOverdue(payload: any, _gateway: PaymentGateway) {
  const externalSubscriptionId = payload.payment.subscription;

  // Buscar assinatura com dados do usuário
  const subscription = await prisma.subscription.findFirst({
    where: { externalSubscriptionId },
    include: {
      nanny: { select: { name: true, emailAddress: true } },
      family: { select: { name: true, emailAddress: true } },
    },
  });

  if (!subscription) {
    console.error('Assinatura não encontrada para PAYMENT_OVERDUE:', externalSubscriptionId);
    return;
  }

  // Atualizar status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'PAST_DUE' },
  });

  // Enviar e-mail de pagamento falhou
  const userType = subscription.nannyId ? 'nanny' : 'family';
  const userData = subscription.nannyId ? subscription.nanny : subscription.family;
  const email = userData?.emailAddress;
  const name = userData?.name;

  if (email && name) {
    const planLabel = PLAN_LABELS[subscription.plan as keyof typeof PLAN_LABELS] || subscription.plan;
    const amount = payload.payment.value;
    const amountFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);

    const emailTemplate = await getPaymentFailedEmailTemplate({
      name: name.split(' ')[0],
      userType,
      planName: planLabel,
      amount: amountFormatted,
      updatePaymentUrl: `${config.site.url}/app/assinatura?action=update-payment`,
    });

    sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    }).catch((err) => console.error('Erro ao enviar e-mail de pagamento falhou:', err));

    console.log(`[WEBHOOK] E-mail de pagamento falhou enviado para ${email}`);
  }
}

async function handlePaymentRefund(payload: any, _gateway: PaymentGateway) {
  const externalPaymentId = payload.payment.id;

  await prisma.payment.updateMany({
    where: { externalPaymentId },
    data: { status: 'REFUNDED' },
  });
}

async function handlePaymentDeleted(payload: any) {
  const externalPaymentId = payload.payment.id;

  console.log('Pagamento deletado:', externalPaymentId);

  // Atualizar status do pagamento para CANCELED
  await prisma.payment.updateMany({
    where: { externalPaymentId },
    data: { status: 'CANCELED' },
  });
}

async function handlePaymentRefundDenied(payload: any) {
  const externalPaymentId = payload.payment.id;

  console.log('Reembolso negado para pagamento:', externalPaymentId);

  // Manter o pagamento como PAID já que o reembolso foi negado
  await prisma.payment.updateMany({
    where: { externalPaymentId },
    data: { status: 'PAID' },
  });
}

async function handleSubscriptionCreated(payload: any) {
  const externalSubscriptionId = payload.subscription.id;
  const externalCustomerId = payload.subscription.customer;

  console.log('Assinatura criada no Asaas:', externalSubscriptionId);

  // Atualizar subscription existente com o ID externo (caso tenha sido criada via checkout)
  await prisma.subscription.updateMany({
    where: { externalCustomerId },
    data: {
      externalSubscriptionId,
    },
  });
}

async function handleSubscriptionUpdate(payload: any) {
  const externalSubscriptionId = payload.subscription.id;
  const asaasStatus = payload.subscription.status;

  console.log('Assinatura atualizada:', externalSubscriptionId, 'Status:', asaasStatus);

  // Mapear status do Asaas para status interno
  let status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' = 'ACTIVE';
  if (asaasStatus === 'INACTIVE' || asaasStatus === 'EXPIRED') {
    status = 'CANCELED';
  } else if (asaasStatus === 'OVERDUE') {
    status = 'PAST_DUE';
  }

  await prisma.subscription.updateMany({
    where: { externalSubscriptionId },
    data: { status },
  });
}

async function handleSubscriptionCancel(payload: any) {
  const externalSubscriptionId = payload.subscription.id;

  console.log('Assinatura cancelada/inativada:', externalSubscriptionId);

  await prisma.subscription.updateMany({
    where: { externalSubscriptionId },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  });

  // Marcar operações pendentes de cancelamento como completadas
  const completedOperations = await prisma.pendingPaymentOperation.updateMany({
    where: {
      externalId: externalSubscriptionId,
      type: 'CANCEL_SUBSCRIPTION',
      status: { in: ['PENDING', 'RETRYING'] },
    },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  if (completedOperations.count > 0) {
    console.log(
      `[WEBHOOK] Marcadas ${completedOperations.count} operações pendentes de CANCEL_SUBSCRIPTION como completadas`
    );
  }
}

/**
 * Handler para evento INVOICE_CANCELLED
 * Marca operações pendentes de CANCEL_INVOICE como completadas
 */
async function handleInvoiceCancelled(payload: any) {
  const invoiceId = payload.invoice.id;
  const paymentId = payload.invoice.payment;

  console.log('[WEBHOOK] NF cancelada:', invoiceId, 'Payment:', paymentId);

  // Marcar operações pendentes de CANCEL_INVOICE como completadas
  const completedOperations = await prisma.pendingPaymentOperation.updateMany({
    where: {
      externalId: invoiceId,
      type: 'CANCEL_INVOICE',
      status: { in: ['PENDING', 'RETRYING'] },
    },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  if (completedOperations.count > 0) {
    console.log(
      `[WEBHOOK] Marcadas ${completedOperations.count} operações de CANCEL_INVOICE como completadas`
    );
  }

  // Atualizar metadata do pagamento (opcional - para tracking)
  try {
    const payment = await prisma.payment.findFirst({
      where: { externalPaymentId: paymentId },
    });

    if (payment) {
      const existingMetadata = (payment.metadata as Record<string, any>) || {};
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          metadata: {
            ...existingMetadata,
            invoiceCancelled: true,
            invoiceCancelledAt: new Date().toISOString(),
          },
        },
      });
    }
  } catch (error) {
    console.error('[WEBHOOK] Erro ao atualizar metadata do pagamento:', error);
    // Não falha o webhook se atualização de metadata falhar
  }
}

/**
 * Handler para evento INVOICE_AUTHORIZED
 * Marca operações pendentes de CANCEL_INVOICE como SKIPPED
 * (NF autorizada pela SEFAZ não pode mais ser cancelada)
 */
async function handleInvoiceAuthorized(payload: any) {
  const invoiceId = payload.invoice.id;
  const paymentId = payload.invoice.payment;

  console.log('[WEBHOOK] NF autorizada pela SEFAZ:', invoiceId, 'Payment:', paymentId);

  // Marcar operações pendentes de CANCEL_INVOICE como SKIPPED
  // Não pode mais cancelar NF após autorização pela SEFAZ
  const skippedOperations = await prisma.pendingPaymentOperation.updateMany({
    where: {
      externalId: invoiceId,
      type: 'CANCEL_INVOICE',
      status: { in: ['PENDING', 'RETRYING'] },
    },
    data: {
      status: 'SKIPPED',
      completedAt: new Date(),
      lastError: 'NF autorizada pela SEFAZ - não pode mais ser cancelada',
    },
  });

  if (skippedOperations.count > 0) {
    console.log(
      `[WEBHOOK] Marcadas ${skippedOperations.count} operações de CANCEL_INVOICE como SKIPPED (NF autorizada)`
    );
  }
}
