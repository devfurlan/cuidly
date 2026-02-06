import CardNumberSoft from '@/components/CardNumberSoft';
import PageContent from '@/components/layout/PageContent';
import { Skeleton } from '@/components/ui/skeleton';
import prisma from '@/lib/prisma';
import {
  BillingInterval,
  getMonthlyEquivalentPrice,
  PLAN_LABELS,
  SubscriptionPlan,
} from '@cuidly/core';
import { Suspense } from 'react';
import { RecentActivities } from './(dashboard)/_components/RecentActivities';
import { RevenueChart } from './(dashboard)/_components/RevenueChart';

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

interface DashboardMetrics {
  users: {
    totalFamilies: number;
    totalNannies: number;
    total: number;
  };
  newSignups: {
    families: number;
    nannies: number;
    total: number;
  };
  subscriptions: {
    active: number;
    familyActive: number;
    nannyActive: number;
    userActive: number;
  };
  revenue: {
    mrr: number;
    grossRevenue30Days: number;
  };
  revenueChart: MonthlyRevenueData[];
  recentActivities: RecentActivity[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  const [
    // Usuários
    totalFamilies,
    totalNannies,
    newFamilies,
    newNannies,
    // Assinaturas ativas
    activeFamilySubscriptions,
    activeNannySubscriptions,
    // Dados para cálculo de MRR
    subscriptionsWithPlan,
    // Receita bruta (últimos 30 dias)
    paymentsLast30Days,
    // Dados para gráfico de evolução (últimos 6 meses)
    paymentsLast6Months,
    // Atividades recentes
    recentPayments,
    recentSubscriptions,
  ] = await Promise.all([
    // Total de usuários
    prisma.family.count({ where: { status: 'ACTIVE' } }),
    prisma.nanny.count({ where: { status: 'ACTIVE' } }),
    // Novos usuários (30 dias)
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
    // Assinaturas ativas de famílias
    prisma.subscription.count({
      where: { status: 'ACTIVE', familyId: { not: null } },
    }),
    // Assinaturas ativas de babás
    prisma.subscription.count({
      where: { status: 'ACTIVE', nannyId: { not: null } },
    }),
    // Dados para MRR
    prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      select: { plan: true, billingInterval: true },
    }),
    // Receita bruta (ultimos 30 dias)
    prisma.payment.aggregate({
      where: {
        status: { in: ['CONFIRMED', 'PAID'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    }),
    // Pagamentos dos ultimos 6 meses para grafico
    prisma.payment.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PAID'] },
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    }),
    // Últimos pagamentos para atividades recentes
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
    // Últimas assinaturas para atividades recentes
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

  // Calcular MRR (Receita Mensal Recorrente)
  let mrr = 0;
  for (const sub of subscriptionsWithPlan) {
    const monthlyPrice = getMonthlyEquivalentPrice(
      sub.plan as SubscriptionPlan,
      (sub.billingInterval as BillingInterval) || BillingInterval.MONTH,
    );
    mrr += monthlyPrice ?? 0;
  }

  // Calcular receita bruta dos últimos 30 dias
  const grossRevenue30Days = paymentsLast30Days._sum.amount || 0;

  // Calcular dados do gráfico de evolução de receita (últimos 6 meses)
  const revenueByMonth: Record<string, number> = {};

  for (const payment of paymentsLast6Months) {
    const date = new Date(payment.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    revenueByMonth[key] = (revenueByMonth[key] || 0) + payment.amount;
  }

  // Gerar array dos últimos 6 meses
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


  // Montar atividades recentes
  const activities: RecentActivity[] = [];

  // Adicionar pagamentos
  for (const payment of recentPayments) {
    const userName =
      payment.nanny?.name ||
      payment.family?.name ||
      payment.nanny?.emailAddress ||
      payment.family?.emailAddress ||
      'Usuario';

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

  // Adicionar novas assinaturas
  for (const sub of recentSubscriptions) {
    const userName =
      sub.nanny?.name ||
      sub.family?.name ||
      sub.nanny?.emailAddress ||
      sub.family?.emailAddress ||
      'Usuario';
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

  // Ordenar atividades por data e pegar as 10 mais recentes
  activities.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const recentActivities = activities.slice(0, 10);

  // Total de assinaturas ativas
  const totalActiveSubscriptions =
    activeFamilySubscriptions + activeNannySubscriptions;

  return {
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
      active: totalActiveSubscriptions,
      familyActive: activeFamilySubscriptions,
      nannyActive: activeNannySubscriptions,
      userActive: 0,
    },
    revenue: {
      mrr,
      grossRevenue30Days,
    },
    revenueChart: revenueChartData,
    recentActivities,
  };
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <Skeleton className="h-[110px] w-full rounded-xl" />
        <Skeleton className="h-[110px] w-full rounded-xl" />
        <Skeleton className="h-[110px] w-full rounded-xl" />
        <Skeleton className="h-[110px] w-full rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <Skeleton className="h-[110px] w-full rounded-xl" />
        <Skeleton className="h-[110px] w-full rounded-xl" />
        <Skeleton className="h-[110px] w-full rounded-xl" />
        <Skeleton className="h-[110px] w-full rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  );
}

async function DashboardContent() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="flex flex-col gap-6">
      {/* Métricas de Receita */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Financeiro</h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          <CardNumberSoft
            title="Receita Mensal (MRR)"
            value={formatCurrency(metrics.revenue.mrr)}
            color="green"
            iconName="currency"
            tooltipText="Receita Mensal Recorrente - soma dos valores de assinaturas ativas normalizadas para valor mensal"
          />
          <CardNumberSoft
            title="Receita Bruta (30 dias)"
            value={formatCurrency(metrics.revenue.grossRevenue30Days)}
            color="emerald"
            iconName="trend-up"
            tooltipText="Total de pagamentos aprovados nos últimos 30 dias"
          />
          <CardNumberSoft
            title="Assinaturas Ativas"
            value={metrics.subscriptions.active}
            color="indigo"
            iconName="crown"
            tooltipText="Total de assinaturas com status ativo"
          />
          <CardNumberSoft
            title="Novas Inscrições (30 dias)"
            value={metrics.newSignups.total}
            supportValue={`${metrics.newSignups.families} famílias / ${metrics.newSignups.nannies} babás`}
            color="blue"
            iconName="calendar-plus"
          />
        </div>
      </div>

      {/* Métricas de Usuários */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Usuários</h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          <CardNumberSoft
            title="Total de Usuários"
            value={metrics.users.total}
            color="stone"
            iconName="users"
          />
          <CardNumberSoft
            title="Famílias Ativas"
            value={metrics.users.totalFamilies}
            color="blue"
            iconName="house"
          />
          <CardNumberSoft
            title="Babás Ativas"
            value={metrics.users.totalNannies}
            color="pink"
            iconName="first-aid"
          />
          <CardNumberSoft
            title="Assinaturas por Tipo"
            value={
              metrics.subscriptions.familyActive +
              metrics.subscriptions.nannyActive
            }
            supportValue={`${metrics.subscriptions.familyActive} famílias / ${metrics.subscriptions.nannyActive} babás`}
            color="purple"
            iconName="crown"
          />
        </div>
      </div>

      {/* Gráfico e Atividades */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={metrics.revenueChart} />
        <RecentActivities activities={metrics.recentActivities} />
      </div>
    </div>
  );
}

export default async function Dashboard() {
  return (
    <PageContent title="Dashboard">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </PageContent>
  );
}
