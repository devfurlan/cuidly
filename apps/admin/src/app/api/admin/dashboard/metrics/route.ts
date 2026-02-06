import { requireAdmin } from '@/lib/auth/checkPermission';
import prisma from '@/lib/prisma';
import { withAuth } from '@/proxy';
import {
  BillingInterval,
  getMonthlyEquivalentPrice,
  PLAN_LABELS,
  SubscriptionPlan,
} from '@cuidly/core';
import { PaymentStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

interface MonthlyRevenueData {
  month: string;
  year: number;
  revenue: number;
}

interface RecentActivity {
  id: string;
  type:
    | 'new_subscription'
    | 'payment_failed'
    | 'payment_success'
    | 'subscription_canceled';
  description: string;
  userName: string;
  createdAt: Date;
}

/**
 * GET /api/admin/dashboard/metrics
 * Returns vital platform metrics for the dashboard
 */
async function handleGet() {
  try {
    await requireAdmin();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    // Fetch all metrics in parallel
    const [
      // Users
      totalFamilies,
      totalNannies,
      newFamilies,
      newNannies,
      // Active subscriptions
      activeSubscriptions,
      // Subscriptions by type
      activeFamilySubscriptions,
      activeNannySubscriptions,
      // Data for MRR calculation
      subscriptionsWithPlan,
      // Gross revenue (last 30 days)
      paymentsLast30Days,
      // Data for revenue chart (last 6 months)
      paymentsLast6Months,
      // Recent activities
      recentPayments,
      recentSubscriptions,
    ] = await Promise.all([
      // Total users
      prisma.family.count({ where: { status: 'ACTIVE' } }),
      prisma.nanny.count({ where: { status: 'ACTIVE' } }),
      // New users (30 days)
      prisma.family.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.nanny.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      // Active subscriptions (total)
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      // Family subscriptions
      prisma.subscription.count({
        where: { status: 'ACTIVE', familyId: { not: null } },
      }),
      // Nanny subscriptions
      prisma.subscription.count({
        where: { status: 'ACTIVE', nannyId: { not: null } },
      }),
      // MRR data
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        select: { plan: true, billingInterval: true },
      }),
      // Gross revenue (last 30 days)
      prisma.payment.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'PAID'] as PaymentStatus[] },
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
      // Payments from last 6 months for chart
      prisma.payment.findMany({
        where: {
          status: { in: ['CONFIRMED', 'PAID'] as PaymentStatus[] },
          createdAt: { gte: sixMonthsAgo },
        },
        select: {
          amount: true,
          createdAt: true,
        },
      }),
      // Latest payments for recent activities
      prisma.payment.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          nanny: { select: { name: true, emailAddress: true } },
          family: { select: { name: true, emailAddress: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      // Latest subscriptions for recent activities
      prisma.subscription.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          nanny: { select: { name: true, emailAddress: true } },
          family: { select: { name: true, emailAddress: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0;
    for (const sub of subscriptionsWithPlan) {
      const monthlyPrice = getMonthlyEquivalentPrice(
        sub.plan as SubscriptionPlan,
        (sub.billingInterval as BillingInterval) || BillingInterval.MONTH,
      );
      mrr += monthlyPrice ?? 0;
    }

    // Calculate gross revenue for last 30 days
    const grossRevenue30Days = paymentsLast30Days._sum.amount || 0;

    // Calculate revenue chart data (last 6 months)
    const revenueByMonth: Record<string, number> = {};

    for (const payment of paymentsLast6Months) {
      const date = new Date(payment.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[key] = (revenueByMonth[key] || 0) + payment.amount;
    }

    // Generate array for last 6 months
    const revenueChartData: MonthlyRevenueData[] = [];
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

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      revenueChartData.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        revenue: revenueByMonth[key] || 0,
      });
    }


    // Build recent activities
    const activities: RecentActivity[] = [];

    // Add payments
    for (const payment of recentPayments) {
      const userName =
        payment.nanny?.name ||
        payment.family?.name ||
        payment.nanny?.emailAddress ||
        payment.family?.emailAddress ||
        'Usuário';

      if (payment.status === 'PAID' || payment.status === 'CONFIRMED') {
        activities.push({
          id: payment.id,
          type: 'payment_success',
          description: `Pagamento de R$ ${payment.amount.toFixed(2)} confirmado`,
          userName,
          createdAt: payment.createdAt,
        });
      } else if (payment.status === 'FAILED') {
        activities.push({
          id: payment.id,
          type: 'payment_failed',
          description: `Pagamento de R$ ${payment.amount.toFixed(2)} falhou`,
          userName,
          createdAt: payment.createdAt,
        });
      }
    }

    // Add new subscriptions
    for (const sub of recentSubscriptions) {
      const userName =
        sub.nanny?.name ||
        sub.family?.name ||
        sub.nanny?.emailAddress ||
        sub.family?.emailAddress ||
        'Usuário';
      const planLabel = PLAN_LABELS[sub.plan as SubscriptionPlan] || sub.plan;

      if (sub.status === 'ACTIVE') {
        activities.push({
          id: sub.id,
          type: 'new_subscription',
          description: `Nova assinatura - ${planLabel}`,
          userName,
          createdAt: sub.createdAt,
        });
      } else if (sub.status === 'CANCELED') {
        activities.push({
          id: sub.id,
          type: 'subscription_canceled',
          description: `Assinatura cancelada - ${planLabel}`,
          userName,
          createdAt: sub.canceledAt || sub.updatedAt,
        });
      }
    }

    // Sort activities by date and get 10 most recent
    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const recentActivities = activities.slice(0, 10);

    return NextResponse.json({
      users: {
        totalFamilies,
        totalNannies,
        total: totalFamilies + totalNannies,
      },
      newSignups: {
        families: newFamilies,
        nannies: newNannies,
        total: newFamilies + newNannies,
      },
      subscriptions: {
        active: activeSubscriptions,
        familyActive: activeFamilySubscriptions,
        nannyActive: activeNannySubscriptions,
      },
      revenue: {
        mrr,
        grossRevenue30Days,
      },
      revenueChart: revenueChartData,
      recentActivities,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Erro ao buscar métricas do dashboard';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
