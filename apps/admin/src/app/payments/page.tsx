import PageContent from '@/components/layout/PageContent';
import { requirePermission } from '@/lib/auth/checkPermission';
import prisma from '@/lib/prisma';
import { PaymentsDataTable } from './_components/PaymentsDataTable';
import CardNumberSoft from '@/components/CardNumberSoft';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Pagamentos',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

async function getPaymentsData() {
  const payments = await prisma.payment.findMany({
    include: {
      nanny: {
        select: {
          id: true,
          name: true,
          emailAddress: true,
          photoUrl: true,
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
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 500, // Limitar para performance
  });

  return payments;
}

async function getPaymentStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalPayments,
    paidPayments,
    pendingPayments,
    failedPayments,
    totalRevenue30Days,
  ] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.count({
      where: { status: { in: ['CONFIRMED', 'PAID'] } },
    }),
    prisma.payment.count({
      where: { status: 'PENDING' },
    }),
    prisma.payment.count({
      where: { status: { in: ['FAILED', 'OVERDUE', 'CANCELED'] } },
    }),
    prisma.payment.aggregate({
      where: {
        status: { in: ['CONFIRMED', 'PAID'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalPayments,
    paidPayments,
    pendingPayments,
    failedPayments,
    totalRevenue30Days: totalRevenue30Days._sum.amount || 0,
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
  const stats = await getPaymentStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
      <CardNumberSoft
        title="Receita (30 dias)"
        value={formatCurrency(stats.totalRevenue30Days)}
        color="green"
        iconName="currency"
        tooltipText="Total de pagamentos confirmados nos últimos 30 dias"
      />
      <CardNumberSoft
        title="Total de Pagamentos"
        value={stats.totalPayments}
        color="indigo"
        iconName="currency"
      />
      <CardNumberSoft
        title="Pagos/Confirmados"
        value={stats.paidPayments}
        color="emerald"
        iconName="check-circle"
      />
      <CardNumberSoft
        title="Pendentes"
        value={stats.pendingPayments}
        color="yellow"
        iconName="clock"
      />
      <CardNumberSoft
        title="Falhas/Cancelados"
        value={stats.failedPayments}
        color="red"
        iconName="x-circle"
      />
    </div>
  );
}

export default async function PaymentsPage() {
  await requirePermission('SUBSCRIPTIONS');

  const payments = await getPaymentsData();

  return (
    <PageContent title="Pagamentos">
      <div className="flex flex-col gap-6">
        <Suspense fallback={<StatsSkeleton />}>
          <StatsContent />
        </Suspense>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            Histórico de Pagamentos
          </h2>
          <PaymentsDataTable payments={payments} />
        </div>
      </div>
    </PageContent>
  );
}
