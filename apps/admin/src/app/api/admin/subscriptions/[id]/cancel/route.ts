import { withPermission } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auditService } from '@/services/auditService';
import apiAsaas from '@/lib/asaas';
import { UserWithPermissions } from '@/lib/auth/checkPermission';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/subscriptions/[id]/cancel
 * Cancela uma assinatura manualmente
 */
async function handlePost(
  _request: Request,
  context: RouteContext | undefined,
  admin: UserWithPermissions
) {
  try {
    const { id } = await context!.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 404 }
      );
    }

    if (subscription.status === 'CANCELED') {
      return NextResponse.json(
        { error: 'Assinatura já esta cancelada' },
        { status: 400 }
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

    console.log(`[ADMIN_CANCEL] Encontrados ${paymentsWithInvoices.length} pagamentos com NF para cancelar`);

    // Etapa 2: Tentar cancelar assinatura no gateway de pagamento (Asaas)
    let gatewayError: string | null = null;
    if (subscription.externalSubscriptionId) {
      try {
        await apiAsaas.delete(
          `/v3/subscriptions/${subscription.externalSubscriptionId}`
        );
        console.log('[ADMIN_CANCEL] Assinatura cancelada com sucesso na Asaas');
      } catch (asaasError) {
        console.error('[ADMIN_CANCEL] Error canceling in Asaas:', asaasError);
        gatewayError =
          'Erro ao cancelar no gateway de pagamento. A assinatura foi cancelada localmente.';

        // Criar operação pendente para retry
        await prisma.pendingPaymentOperation.create({
          data: {
            type: 'CANCEL_SUBSCRIPTION',
            subscriptionId: subscription.id,
            externalId: subscription.externalSubscriptionId,
            operationData: { adminEmail: admin.email },
            lastError: asaasError instanceof Error ? asaasError.message : 'Erro desconhecido',
          },
        });

        console.log('[RETRY_QUEUE] Operação de cancelamento de assinatura adicionada à fila de retry');
      }
    }

    // Etapa 3: Tentar cancelar cada NF
    const invoiceCancelErrors: string[] = [];
    for (const payment of paymentsWithInvoices) {
      if (!payment.externalPaymentId) continue;

      try {
        // No Asaas, o ID da NF geralmente é o mesmo ID do pagamento
        const invoiceId = payment.externalPaymentId;

        console.log(`[ADMIN_CANCEL] Tentando cancelar NF ${invoiceId} para pagamento ${payment.id}`);

        await apiAsaas.delete(`/v3/invoices/${invoiceId}`);
        console.log(`[ADMIN_CANCEL] NF ${invoiceId} cancelada com sucesso`);
      } catch (error) {
        console.error(`[ADMIN_CANCEL] Erro ao cancelar NF para pagamento ${payment.id}:`, error);

        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

        // Verificar se a NF já foi enviada ao SEFAZ (não pode ser cancelada)
        const isSEFAZError = errorMessage.toLowerCase().includes('sefaz') ||
                             errorMessage.toLowerCase().includes('enviada') ||
                             errorMessage.toLowerCase().includes('autorizada');

        if (!isSEFAZError) {
          // Criar operação pendente para retry (erro de rede/temporário)
          await prisma.pendingPaymentOperation.create({
            data: {
              type: 'CANCEL_INVOICE',
              paymentId: payment.id,
              subscriptionId: subscription.id,
              externalId: payment.externalPaymentId,
              lastError: errorMessage,
            },
          });

          console.log(`[RETRY_QUEUE] Operação de cancelamento de NF ${payment.externalPaymentId} adicionada à fila de retry`);
          invoiceCancelErrors.push(`NF ${payment.externalPaymentId}: ${errorMessage}`);
        } else {
          console.log(`[ADMIN_CANCEL] NF ${payment.externalPaymentId} já enviada ao SEFAZ, não pode ser cancelada`);
          invoiceCancelErrors.push(`NF ${payment.externalPaymentId}: Já enviada ao SEFAZ`);
        }
      }
    }

    // Adicionar erros de NF ao gatewayError se houver
    if (invoiceCancelErrors.length > 0) {
      const invoiceErrorMessage = `Erro ao cancelar ${invoiceCancelErrors.length} NF(s). ` + invoiceCancelErrors.join('; ');
      gatewayError = gatewayError ? `${gatewayError} ${invoiceErrorMessage}` : invoiceErrorMessage;
    }

    // Atualizar status no banco
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        cancelAtPeriodEnd: false,
      },
    });

    await auditService.logSubscriptionCancel(
      id,
      {
        nannyId: subscription.nannyId,
        familyId: subscription.familyId,
        previousStatus: subscription.status,
        plan: subscription.plan,
        canceledBy: admin.email,
      },
      gatewayError ? 'Cancelamento manual (erro no gateway)' : 'Cancelamento manual'
    );

    return NextResponse.json({
      message: 'Assinatura cancelada com sucesso',
      subscription: updatedSubscription,
      warning: gatewayError,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao cancelar assinatura';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = withPermission('SUBSCRIPTIONS', handlePost);
