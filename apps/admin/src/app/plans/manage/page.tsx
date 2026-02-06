import PageContent from '@/components/layout/PageContent';
import { requirePermission } from '@/lib/auth/checkPermission';
import prisma from '@/lib/prisma';
import { PlansDataTable } from './_components/PlansDataTable';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import CardNumberSoft from '@/components/CardNumberSoft';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Gerenciar Planos',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

async function getPlansData() {
  const plans = await prisma.plan.findMany({
    orderBy: [{ type: 'asc' }, { price: 'asc' }],
  });

  // Count subscriptions using the plan enum values
  const subscriptionCounts = await prisma.subscription.groupBy({
    by: ['plan'],
    _count: { plan: true },
  });

  const countMap = Object.fromEntries(
    subscriptionCounts.map((s) => [s.plan, s._count.plan])
  );

  return plans.map((plan) => ({
    ...plan,
    price: Number(plan.price),
    features: plan.features as Record<string, unknown>,
    subscriptionsCount: countMap[plan.name.toUpperCase()] || 0,
  }));
}

async function getPlansStats() {
  const [
    totalPlans,
    activePlans,
    familyPlans,
    nannyPlans,
    avgPrice,
  ] = await Promise.all([
    prisma.plan.count(),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.plan.count({ where: { type: 'FAMILY', isActive: true } }),
    prisma.plan.count({ where: { type: 'NANNY', isActive: true } }),
    prisma.plan.aggregate({
      where: { isActive: true, price: { gt: 0 } },
      _avg: { price: true },
    }),
  ]);

  return {
    totalPlans,
    activePlans,
    familyPlans,
    nannyPlans,
    avgPrice: avgPrice._avg.price ? Number(avgPrice._avg.price) : 0,
  };
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      <Skeleton className="h-[110px] w-full rounded-xl" />
      <Skeleton className="h-[110px] w-full rounded-xl" />
      <Skeleton className="h-[110px] w-full rounded-xl" />
      <Skeleton className="h-[110px] w-full rounded-xl" />
    </div>
  );
}

async function StatsContent() {
  const stats = await getPlansStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      <CardNumberSoft
        title="Total de Planos"
        value={stats.totalPlans}
        supportValue={`${stats.activePlans} ativos`}
        color="indigo"
        iconName="crown"
      />
      <CardNumberSoft
        title="Planos Família"
        value={stats.familyPlans}
        color="blue"
        iconName="house"
      />
      <CardNumberSoft
        title="Planos Babá"
        value={stats.nannyPlans}
        color="pink"
        iconName="first-aid-kit"
      />
      <CardNumberSoft
        title="Preço Médio"
        value={formatCurrency(stats.avgPrice)}
        color="green"
        iconName="currency"
        tooltipText="Média de preço dos planos ativos pagos"
      />
    </div>
  );
}

export default async function ManagePlansPage() {
  await requirePermission('SUBSCRIPTIONS');

  const plans = await getPlansData();

  return (
    <PageContent
      title="Gerenciar Planos"
      actions={
        <Button asChild>
          <Link href="/plans/manage/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Novo Plano
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <Suspense fallback={<StatsSkeleton />}>
          <StatsContent />
        </Suspense>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            Todos os Planos
          </h2>
          <PlansDataTable plans={plans} />
        </div>
      </div>
    </PageContent>
  );
}
