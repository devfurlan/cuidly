import { requireAdmin } from '@/lib/auth/checkPermission';
import prisma from '@/lib/prisma';
import { withAuth } from '@/proxy';
import {
  BillingInterval,
  getMonthlyEquivalentPrice,
  PLAN_LABELS,
  SubscriptionPlan,
} from '@cuidly/core';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

interface MonthlyRevenue {
  month: string;
  revenue: number;
  subscriptions: number;
  churnRate: number;
}

interface PlanDistribution {
  plan: string;
  count: number;
  revenue: number;
  percentage: number;
}

/**
 * GET /api/admin/analytics/monetization
 * Retorna dados de monetizacao e receita
 *
 * Query params:
 * - months: number (default: 6) - quantidade de meses para o historico
 */
async function handleGet(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const monthsCount = parseInt(searchParams.get('months') || '6', 10);

    const now = new Date();


    // Buscar dados historicos de receita por mes
    const monthlyData: MonthlyRevenue[] = [];
    const monthNames = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
      );

      const [payments, activeSubscriptions, canceledSubscriptions] =
        await Promise.all([
          // Receita do mes
          prisma.payment.aggregate({
            where: {
              status: { in: ['CONFIRMED', 'PAID'] as PaymentStatus[] },
              createdAt: { gte: monthStart, lte: monthEnd },
            },
            _sum: { amount: true },
          }),
          // Assinaturas ativas no final do mes
          prisma.subscription.count({
            where: {
              status: 'ACTIVE' as SubscriptionStatus,
              createdAt: { lte: monthEnd },
            },
          }),
          // Assinaturas canceladas no mes
          prisma.subscription.count({
            where: {
              status: 'CANCELED' as SubscriptionStatus,
              canceledAt: { gte: monthStart, lte: monthEnd },
            },
          }),
        ]);

      const totalSubscriptionsAtStart = await prisma.subscription.count({
        where: {
          createdAt: { lt: monthStart },
          OR: [{ status: 'ACTIVE' }, { canceledAt: { gte: monthStart } }],
        },
      });

      const churnRate =
        totalSubscriptionsAtStart > 0
          ? Math.round(
              (canceledSubscriptions / totalSubscriptionsAtStart) * 100,
            )
          : 0;

      monthlyData.push({
        month: `${monthNames[monthStart.getMonth()]} ${monthStart.getFullYear().toString().slice(-2)}`,
        revenue: payments._sum.amount || 0,
        subscriptions: activeSubscriptions,
        churnRate,
      });
    }

    // Distribuicao por plano (atual)
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ['plan'],
      where: {
        status: 'ACTIVE',
      },
      _count: true,
    });

    const totalActiveSubscriptions = subscriptionsByPlan.reduce(
      (acc, s) => acc + s._count,
      0,
    );

    const planDistribution: PlanDistribution[] = subscriptionsByPlan.map(
      (s) => ({
        plan:
          PLAN_LABELS[s.plan as SubscriptionPlan] || s.plan,
        count: s._count,
        revenue:
          s._count *
          (getMonthlyEquivalentPrice(
            s.plan as SubscriptionPlan,
            BillingInterval.MONTH,
          ) ?? 0),
        percentage:
          totalActiveSubscriptions > 0
            ? Math.round((s._count / totalActiveSubscriptions) * 100)
            : 0,
      }),
    );

    // Metricas resumidas
    const [
      currentMRR,
      totalLifetimeRevenue,
      avgRevenuePerUser,
      payingCustomers,
    ] = await Promise.all([
      // MRR atual
      (async () => {
        const activeSubscriptions = await prisma.subscription.findMany({
          where: { status: 'ACTIVE' },
          select: { plan: true, billingInterval: true },
        });

        let mrr = 0;
        for (const sub of activeSubscriptions) {
          const monthlyPrice = getMonthlyEquivalentPrice(
            sub.plan as SubscriptionPlan,
            (sub.billingInterval as BillingInterval) || BillingInterval.MONTH,
          );
          mrr += monthlyPrice ?? 0;
        }
        return mrr;
      })(),
      // Receita total lifetime
      prisma.payment.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'PAID'] as PaymentStatus[] },
        },
        _sum: { amount: true },
      }),
      // ARPU (Average Revenue Per User)
      (async () => {
        const [totalRevenue, totalNannies, totalFamilies] = await Promise.all([
          prisma.payment.aggregate({
            where: { status: { in: ['CONFIRMED', 'PAID'] as PaymentStatus[] } },
            _sum: { amount: true },
          }),
          prisma.nanny.count({
            where: { deletedAt: null },
          }),
          prisma.family.count({
            where: { deletedAt: null },
          }),
        ]);
        const totalUsers = totalNannies + totalFamilies;
        return totalUsers > 0
          ? (totalRevenue._sum.amount || 0) / totalUsers
          : 0;
      })(),
      // Clientes pagantes (planos pagos: FAMILY_PLUS e NANNY_PRO)
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          plan: { in: ['FAMILY_PLUS', 'NANNY_PRO'] },
        },
      }),
    ]);

    // Calcular churn rate medio
    const avgChurnRate =
      monthlyData.length > 0
        ? Math.round(
            monthlyData.reduce((acc, m) => acc + m.churnRate, 0) /
              monthlyData.length,
          )
        : 0;

    return NextResponse.json({
      metrics: {
        mrr: currentMRR,
        lifetimeRevenue: totalLifetimeRevenue._sum.amount || 0,
        arpu: avgRevenuePerUser,
        payingCustomers,
        avgChurnRate,
      },
      monthlyData,
      planDistribution,
    });
  } catch (error) {
    console.error('Error fetching monetization data:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Erro ao buscar dados de monetizacao';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
