import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/payments/[id]
 * Retorna os detalhes de um pagamento especifico
 */
async function handleGet(_request: Request, context: RouteContext) {
  try {
    await requirePermission('SUBSCRIPTIONS');

    const { id } = await context.params;

    const payment = await prisma.payment.findUnique({
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
            emailAddress: true,
            photoUrl: true,
          },
        },
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            externalSubscriptionId: true,
            appliedCoupon: {
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

    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    // Gerar URL do gateway se disponivel
    let gatewayUrl: string | null = null;
    if (payment.externalPaymentId && payment.paymentGateway === 'ASAAS') {
      gatewayUrl = `https://www.asaas.com/i/${payment.externalPaymentId}`;
    }

    return NextResponse.json({
      payment: {
        ...payment,
        gatewayUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar pagamento';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
