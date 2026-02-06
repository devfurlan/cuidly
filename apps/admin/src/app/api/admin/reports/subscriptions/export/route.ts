import { withAuth } from '@/proxy';
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { PLAN_LABELS, SubscriptionPlan } from '@cuidly/core';
import { SubscriptionPlan as PrismaSubscriptionPlan, SubscriptionStatus } from '@prisma/client';

/**
 * GET /api/admin/reports/subscriptions/export
 * Exporta uma lista de assinaturas em formato CSV
 *
 * Query params:
 * - plan: SubscriptionPlan | 'all' (default: 'all')
 * - status: SubscriptionStatus | 'all' (default: 'all')
 * - startDate: string (ISO date) - inicio do periodo
 * - endDate: string (ISO date) - fim do periodo
 */
async function handleGet(request: NextRequest) {
  try {
    await requirePermission('SUBSCRIPTIONS');

    const searchParams = request.nextUrl.searchParams;
    const plan = searchParams.get('plan') || 'all';
    const status = searchParams.get('status') || 'all';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Construir filtro
    const where: Record<string, unknown> = {};

    if (plan !== 'all') {
      where.plan = plan as PrismaSubscriptionPlan;
    }

    if (status !== 'all') {
      where.status = status as SubscriptionStatus;
    }

    if (startDateParam || endDateParam) {
      where.createdAt = {};
      if (startDateParam) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDateParam);
      }
      if (endDateParam) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDateParam);
      }
    }


    const statusLabels: Record<string, string> = {
      ACTIVE: 'Ativo',
      CANCELED: 'Cancelado',
      PAST_DUE: 'Atrasado',
      TRIALING: 'Trial',
      INCOMPLETE: 'Incompleto',
      EXPIRED: 'Expirado',
    };

    // Buscar assinaturas
    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        nanny: {
          select: {
            name: true,
            emailAddress: true,
          },
        },
        family: {
          select: {
            name: true,
            emailAddress: true,
          },
        },
        appliedCoupon: {
          select: {
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Gerar CSV
    const headers = [
      'ID',
      'Nome do Usuario',
      'Email',
      'Tipo Usuario',
      'Plano',
      'Status',
      'Gateway',
      'Cupom Aplicado',
      'Desconto',
      'Início do Período',
      'Fim do Período',
      'Cancelado em',
      'Data de Criacao',
    ];

    const rows = subscriptions.map((sub) => {
      const isNanny = !!sub.nannyId;
      const userName = isNanny ? (sub.nanny?.name || '') : (sub.family?.name || '');
      const userEmail = isNanny ? (sub.nanny?.emailAddress || '') : (sub.family?.emailAddress || '');
      const userType = isNanny ? 'Baba' : 'Familia';

      return [
        sub.id,
        userName,
        userEmail,
        userType,
        PLAN_LABELS[sub.plan as SubscriptionPlan] || sub.plan,
        statusLabels[sub.status] || sub.status,
        sub.paymentGateway,
        sub.appliedCoupon?.code || '-',
        sub.discountAmount ? `R$ ${sub.discountAmount.toFixed(2)}` : '-',
        new Date(sub.currentPeriodStart).toLocaleDateString('pt-BR'),
        new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR'),
        sub.canceledAt ? new Date(sub.canceledAt).toLocaleDateString('pt-BR') : '-',
        new Date(sub.createdAt).toLocaleDateString('pt-BR'),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    // Adicionar BOM para UTF-8
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="assinaturas_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting subscriptions:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao exportar assinaturas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
