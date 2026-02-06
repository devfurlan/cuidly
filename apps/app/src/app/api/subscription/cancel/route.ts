import { PaymentGatewayFactory } from '@/lib/payment/gateway-factory';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/sendEmail';
import { getCancellationConfirmationEmailTemplate } from '@/lib/email/react-templates';
import { config } from '@/config';

const cancelSchema = z.object({
  reason: z.enum([
    'FOUND_WHAT_I_NEEDED',
    'TOO_EXPENSIVE',
    'NOT_USING',
    'MISSING_FEATURES',
    'TECHNICAL_ISSUES',
    'OTHER',
  ]),
  feedback: z.string().optional(),
}).refine(
  (data) => data.reason !== 'OTHER' || (data.feedback && data.feedback.trim().length > 0),
  { message: 'Por favor, descreva o motivo do cancelamento', path: ['feedback'] }
);

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = cancelSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 },
      );
    }

    const { reason, feedback } = validationResult.data;

    const whereClause = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    const subscription = await prisma.subscription.findFirst({
      where: whereClause,
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Você não possui uma assinatura' },
        { status: 404 },
      );
    }

    // Check if user is on a free plan
    const isFreePlan = subscription.plan === 'FAMILY_FREE' || subscription.plan === 'NANNY_FREE';
    if (isFreePlan) {
      return NextResponse.json(
        { error: 'Você não possui um plano pago' },
        { status: 400 },
      );
    }

    if (subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: 'Sua assinatura já está agendada para cancelamento' },
        { status: 400 },
      );
    }

    // Etapa 1: Buscar pagamentos com NF emitida
    const paymentsWithInvoices = await prisma.payment.findMany({
      where: {
        subscriptionId: subscription.id,
        externalInvoiceUrl: { not: null },
        status: { in: ['PENDING', 'PROCESSING', 'CONFIRMED', 'PAID'] },
      },
    });

    console.log(`[SUBSCRIPTION_CANCEL] Encontrados ${paymentsWithInvoices.length} pagamentos com NF para cancelar`);

    // Etapa 2: Cancelar assinatura no gateway de pagamento (apenas para gateways externos)
    let subscriptionCancelFailed = false;
    if (subscription.externalSubscriptionId && subscription.paymentGateway !== 'MANUAL') {
      try {
        const gateway = PaymentGatewayFactory.create(subscription.paymentGateway);
        const result = await gateway.cancelSubscription(
          subscription.externalSubscriptionId,
        );

        if (!result.success) {
          console.error('[SUBSCRIPTION_CANCEL] Erro ao cancelar no gateway:', result.error);
          subscriptionCancelFailed = true;

          // Criar operação pendente para retry
          await prisma.pendingPaymentOperation.create({
            data: {
              type: 'CANCEL_SUBSCRIPTION',
              subscriptionId: subscription.id,
              externalId: subscription.externalSubscriptionId,
              operationData: { reason, feedback },
              lastError: result.error,
            },
          });

          console.log('[RETRY_QUEUE] Operação de cancelamento de assinatura adicionada à fila de retry');
        } else {
          console.log('[SUBSCRIPTION_CANCEL] Assinatura cancelada com sucesso na Asaas');
        }
      } catch (gatewayError) {
        console.error('[SUBSCRIPTION_CANCEL] Erro ao acessar gateway de pagamento:', gatewayError);
        subscriptionCancelFailed = true;

        // Criar operação pendente para retry
        await prisma.pendingPaymentOperation.create({
          data: {
            type: 'CANCEL_SUBSCRIPTION',
            subscriptionId: subscription.id,
            externalId: subscription.externalSubscriptionId,
            operationData: { reason, feedback },
            lastError: gatewayError instanceof Error ? gatewayError.message : 'Erro desconhecido',
          },
        });

        console.log('[RETRY_QUEUE] Operação de cancelamento de assinatura adicionada à fila de retry (exceção)');
      }
    }

    // Etapa 3: Tentar cancelar cada NF
    for (const payment of paymentsWithInvoices) {
      if (!payment.externalPaymentId) continue;

      try {
        const gateway = PaymentGatewayFactory.create(subscription.paymentGateway);

        // No Asaas, o ID da NF geralmente é o mesmo ID do pagamento
        const invoiceId = payment.externalPaymentId;

        console.log(`[SUBSCRIPTION_CANCEL] Tentando cancelar NF ${invoiceId} para pagamento ${payment.id}`);

        const result = await gateway.cancelInvoice(invoiceId);

        if (!result.success) {
          console.error(`[SUBSCRIPTION_CANCEL] Erro ao cancelar NF ${invoiceId}:`, result.error);

          // Verificar se a NF já foi enviada ao SEFAZ (não pode ser cancelada)
          const isSEFAZError = result.error?.toLowerCase().includes('sefaz') ||
                               result.error?.toLowerCase().includes('enviada') ||
                               result.error?.toLowerCase().includes('autorizada');

          if (!isSEFAZError) {
            // Criar operação pendente para retry (erro de rede/temporário)
            await prisma.pendingPaymentOperation.create({
              data: {
                type: 'CANCEL_INVOICE',
                paymentId: payment.id,
                subscriptionId: subscription.id,
                externalId: invoiceId,
                lastError: result.error,
              },
            });

            console.log(`[RETRY_QUEUE] Operação de cancelamento de NF ${invoiceId} adicionada à fila de retry`);
          } else {
            console.log(`[SUBSCRIPTION_CANCEL] NF ${invoiceId} já enviada ao SEFAZ, não pode ser cancelada`);
          }
        } else {
          console.log(`[SUBSCRIPTION_CANCEL] NF ${invoiceId} cancelada com sucesso`);
        }
      } catch (error) {
        console.error(`[SUBSCRIPTION_CANCEL] Erro ao cancelar NF para pagamento ${payment.id}:`, error);

        // Criar operação pendente para retry
        await prisma.pendingPaymentOperation.create({
          data: {
            type: 'CANCEL_INVOICE',
            paymentId: payment.id,
            subscriptionId: subscription.id,
            externalId: payment.externalPaymentId,
            lastError: error instanceof Error ? error.message : 'Erro desconhecido',
          },
        });

        console.log(`[RETRY_QUEUE] Operação de cancelamento de NF adicionada à fila de retry (exceção)`);
      }
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        cancellationReason: reason,
        cancellationFeedback: feedback?.trim() || null,
      },
    });

    // Send cancellation confirmation email
    const userType = currentUser.type;
    const user = userType === 'nanny' ? currentUser.nanny : currentUser.family;
    const userEmail = user.emailAddress;
    const userName = user.name || 'Usuário';
    const planName = subscription.plan === 'FAMILY_PLUS' ? 'Cuidly Plus' : 'Cuidly Pro';
    const accessUntilDate = updatedSubscription.currentPeriodEnd.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const revertCancelUrl = `${config.site.url}/app/assinatura?action=revert-cancel`;

    if (userEmail) {
      try {
        const template = await getCancellationConfirmationEmailTemplate({
          name: userName.split(' ')[0],
          userType: userType as 'nanny' | 'family',
          planName,
          accessUntilDate,
          revertCancelUrl,
        });

        const emailResult = await sendEmail({
          to: userEmail,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        if (emailResult.success) {
          // Log the email as sent
          await prisma.cancellationEmailLog.create({
            data: {
              subscriptionId: subscription.id,
              emailType: 'CONFIRMATION',
            },
          });
        } else {
          console.error('Erro ao enviar e-mail de confirmação de cancelamento:', emailResult.error);
        }
      } catch (emailError) {
        // Don't fail the cancellation if email fails
        console.error('Erro ao enviar e-mail de confirmação de cancelamento:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada. Você terá acesso até o fim do período atual.',
      subscription: {
        id: updatedSubscription.id,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
      },
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro ao cancelar assinatura' },
      { status: 500 },
    );
  }
}
