import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { logAudit } from '@/utils/auditLog';
import apiAsaas from '@/lib/asaas';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/subscriptions/[id]
 * Retorna os detalhes de uma assinatura especifica, incluindo historico de pagamentos
 */
async function handleGet(_request: Request, context: RouteContext) {
  try {
    await requirePermission('SUBSCRIPTIONS');

    const { id } = await context.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        nanny: {
          select: {
            id: true,
            name: true,
            emailAddress: true,
            photoUrl: true,
            slug: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
            name: true,
            emailAddress: true,
            photoUrl: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            type: true,
            description: true,
            paymentGateway: true,
            externalPaymentId: true,
            externalInvoiceUrl: true,
            paymentMethod: true,
            paidAt: true,
            createdAt: true,
          },
        },
        appliedCoupon: {
          select: {
            id: true,
            code: true,
            description: true,
            discountType: true,
            discountValue: true,
          },
        },
        couponUsages: {
          include: {
            coupon: {
              select: {
                id: true,
                code: true,
                discountType: true,
                discountValue: true,
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar assinatura';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/subscriptions/[id]/cancel
 * Cancela uma assinatura manualmente
 */
async function handlePost(request: Request, context: RouteContext) {
  try {
    await requirePermission('SUBSCRIPTIONS');

    const { id } = await context.params;

    // Verificar se a URL termina com /cancel
    const url = new URL(request.url);
    if (!url.pathname.endsWith('/cancel')) {
      return NextResponse.json(
        { error: 'Endpoint inválido' },
        { status: 400 }
      );
    }

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

    // Tentar cancelar no gateway de pagamento (Asaas)
    let gatewayError: string | null = null;
    if (subscription.externalSubscriptionId) {
      try {
        await apiAsaas.delete(
          `/v3/subscriptions/${subscription.externalSubscriptionId}`
        );
      } catch (asaasError) {
        console.error('Error canceling in Asaas:', asaasError);
        gatewayError =
          'Erro ao cancelar no gateway de pagamento. A assinatura foi cancelada localmente.';
      }
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

    await logAudit({
      action: 'UPDATE',
      table: 'subscriptions',
      recordId: id,
      data: {
        action: 'manual_cancel',
        previousStatus: subscription.status,
        newStatus: 'CANCELED',
        gatewayError,
      },
    });

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

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
