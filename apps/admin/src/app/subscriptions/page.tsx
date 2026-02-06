import PageContent from '@/components/layout/PageContent';
import { requirePermission } from '@/lib/auth/checkPermission';
import prisma from '@/lib/prisma';
import { SubscriptionsDataTable } from './_components/SubscriptionsDataTable';
import CardNumberSoft from '@/components/CardNumberSoft';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SubscriptionListItem } from '@/schemas/subscriptionSchemas';

export const metadata = {
  title: 'Assinaturas',
};

async function getSubscriptionsData(): Promise<SubscriptionListItem[]> {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      nanny: {
        select: {
          id: true,
          name: true,
          slug: true,
          emailAddress: true,
          phoneNumber: true,
          status: true,
        },
      },
      family: {
        select: {
          id: true,
          name: true,
          emailAddress: true,
          phoneNumber: true,
          status: true,
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          paidAt: true,
        },
      },
      appliedCoupon: {
        select: {
          id: true,
          code: true,
          discountType: true,
          discountValue: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return subscriptions.map((sub) => ({
    id: sub.id,
    nannyId: sub.nannyId,
    familyId: sub.familyId,
    nannyName: sub.nanny?.name || null,
    nannySlug: sub.nanny?.slug || null,
    nannyEmail: sub.nanny?.emailAddress || null,
    nannyPhone: sub.nanny?.phoneNumber || null,
    nannyStatus: sub.nanny?.status || null,
    familyName: sub.family?.name || null,
    familyEmail: sub.family?.emailAddress || null,
    familyPhone: sub.family?.phoneNumber || null,
    familyStatus: sub.family?.status || null,
    plan: sub.plan,
    billingInterval: sub.billingInterval,
    status: sub.status,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    createdAt: sub.createdAt,
  }));
}

async function getSubscriptionStats() {
  const [
    totalSubscriptions,
    activeSubscriptions,
    canceledSubscriptions,
    pastDueSubscriptions,
  ] = await Promise.all([
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.subscription.count({ where: { status: 'CANCELED' } }),
    prisma.subscription.count({ where: { status: 'PAST_DUE' } }),
  ]);

  return {
    totalSubscriptions,
    activeSubscriptions,
    canceledSubscriptions,
    pastDueSubscriptions,
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
  const stats = await getSubscriptionStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      <CardNumberSoft
        title="Total de Assinaturas"
        value={stats.totalSubscriptions}
        color="indigo"
        iconName="crown"
      />
      <CardNumberSoft
        title="Assinaturas Ativas"
        value={stats.activeSubscriptions}
        color="green"
        iconName="check-circle"
      />
      <CardNumberSoft
        title="Canceladas"
        value={stats.canceledSubscriptions}
        color="red"
        iconName="x-circle"
      />
      <CardNumberSoft
        title="Em Atraso"
        value={stats.pastDueSubscriptions}
        color="orange"
        iconName="clock"
        tooltipText="Assinaturas com pagamento pendente ou atrasado"
      />
    </div>
  );
}

export default async function SubscriptionsPage() {
  await requirePermission('SUBSCRIPTIONS');

  const subscriptions = await getSubscriptionsData();

  return (
    <PageContent title="Assinaturas">
      <div className="flex flex-col gap-6">
        <Suspense fallback={<StatsSkeleton />}>
          <StatsContent />
        </Suspense>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            Todas as Assinaturas
          </h2>
          <SubscriptionsDataTable subscriptions={subscriptions} />
        </div>
      </div>
    </PageContent>
  );
}
