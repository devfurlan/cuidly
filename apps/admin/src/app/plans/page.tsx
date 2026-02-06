import PageContent from '@/components/layout/PageContent';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import CardNumberSoft from '@/components/CardNumberSoft';
import {
  HouseIcon,
  FirstAidKitIcon,
} from '@phosphor-icons/react/dist/ssr';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FamilySubscriptionsDataTable } from './_components/FamilySubscriptionsDataTable';
import { NannySubscriptionsDataTable } from './_components/NannySubscriptionsDataTable';
import {
  FamilySubscriptionListItem,
  NannySubscriptionListItem,
} from '@/schemas/subscriptionSchemas';
import { PLAN_PRICES as CORE_PLAN_PRICES } from '@cuidly/core/subscriptions';

// Plan price mapping (since plan is now an enum)
// Uses core pricing as source of truth, with legacy plans for backwards compatibility
const PLAN_PRICES: Record<string, { monthly: number; quarterly?: number; yearly?: number }> = {
  // Current plans - sourced from @cuidly/core
  FAMILY_FREE: { monthly: 0 },
  FAMILY_PLUS: { monthly: CORE_PLAN_PRICES.FAMILY_PLUS.MONTH.price, quarterly: CORE_PLAN_PRICES.FAMILY_PLUS.QUARTER.price },
  NANNY_FREE: { monthly: 0 },
  NANNY_PRO: { monthly: CORE_PLAN_PRICES.NANNY_PRO.MONTH.price, yearly: CORE_PLAN_PRICES.NANNY_PRO.YEAR.price },
  // Legacy plans (for backwards compatibility with old data)
  FREE: { monthly: 0, yearly: 0 },
  BASIC: { monthly: 29.9, yearly: 299 },
  PREMIUM: { monthly: 49.9, yearly: 499 },
  PROFESSIONAL: { monthly: 79.9, yearly: 799 },
};

export const metadata = {
  title: 'Planos e Assinaturas',
};

async function getSubscriptionStats() {
  const [
    totalFamilySubscriptions,
    activeFamilySubscriptions,
    totalNannySubscriptions,
    activeNannySubscriptions,
    totalPlans,
  ] = await Promise.all([
    prisma.subscription.count({ where: { familyId: { not: null } } }),
    prisma.subscription.count({ where: { familyId: { not: null }, status: 'ACTIVE' } }),
    prisma.subscription.count({ where: { nannyId: { not: null } } }),
    prisma.subscription.count({ where: { nannyId: { not: null }, status: 'ACTIVE' } }),
    // Count unique plans in use
    prisma.subscription.groupBy({
      by: ['plan'],
      where: { status: 'ACTIVE' },
    }),
  ]);

  // Calculate monthly revenue from active subscriptions
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' },
    select: { plan: true, billingInterval: true, familyId: true, nannyId: true },
  });

  let monthlyFamilyRevenue = 0;
  let monthlyNannyRevenue = 0;

  activeSubscriptions.forEach((sub) => {
    const prices = PLAN_PRICES[sub.plan] || { monthly: 0 };
    let monthlyPrice = prices.monthly;

    if (sub.billingInterval === 'YEAR' && prices.yearly) {
      monthlyPrice = prices.yearly / 12;
    } else if (sub.billingInterval === 'QUARTER' && prices.quarterly) {
      monthlyPrice = prices.quarterly / 3;
    }

    if (sub.familyId) {
      monthlyFamilyRevenue += monthlyPrice;
    } else if (sub.nannyId) {
      monthlyNannyRevenue += monthlyPrice;
    }
  });

  return {
    totalFamilySubscriptions,
    activeFamilySubscriptions,
    totalNannySubscriptions,
    activeNannySubscriptions,
    monthlyFamilyRevenue,
    monthlyNannyRevenue,
    totalMonthlyRevenue: monthlyFamilyRevenue + monthlyNannyRevenue,
    plansCount: totalPlans.length,
  };
}

async function getFamilySubscriptions(): Promise<FamilySubscriptionListItem[]> {
  const subscriptions = await prisma.subscription.findMany({
    where: { familyId: { not: null } },
    include: {
      family: {
        select: {
          id: true,
          name: true,
          emailAddress: true,
          phoneNumber: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return subscriptions.map((sub) => ({
    id: sub.id,
    nannyId: null,
    familyId: sub.familyId,
    nannyName: null,
    nannySlug: null,
    nannyEmail: null,
    nannyPhone: null,
    nannyStatus: null,
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

async function getNannySubscriptions(): Promise<NannySubscriptionListItem[]> {
  const subscriptions = await prisma.subscription.findMany({
    where: { nannyId: { not: null } },
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
    },
    orderBy: { createdAt: 'desc' },
  });

  return subscriptions.map((sub) => ({
    id: sub.id,
    nannyId: sub.nannyId,
    familyId: null,
    nannyName: sub.nanny?.name || null,
    nannySlug: sub.nanny?.slug || null,
    nannyEmail: sub.nanny?.emailAddress || null,
    nannyPhone: sub.nanny?.phoneNumber || null,
    nannyStatus: sub.nanny?.status || null,
    familyName: null,
    familyEmail: null,
    familyPhone: null,
    familyStatus: null,
    plan: sub.plan,
    billingInterval: sub.billingInterval,
    status: sub.status,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    createdAt: sub.createdAt,
  }));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
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
    <div className="flex flex-col gap-6">
      {/* Receita */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Receita Mensal</h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          <CardNumberSoft
            title="Receita Total"
            value={formatCurrency(stats.totalMonthlyRevenue)}
            color="green"
            iconName="currency"
            tooltipText="Soma da receita mensal de famílias e babás ativas"
          />
          <CardNumberSoft
            title="Receita Famílias"
            value={formatCurrency(stats.monthlyFamilyRevenue)}
            color="blue"
            iconName="house"
            tooltipText="Receita mensal de assinaturas de famílias"
          />
          <CardNumberSoft
            title="Receita Babás"
            value={formatCurrency(stats.monthlyNannyRevenue)}
            color="pink"
            iconName="first-aid-kit"
            tooltipText="Receita mensal de assinaturas de babás"
          />
        </div>
      </div>

      {/* Assinaturas */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Assinaturas</h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          <CardNumberSoft
            title="Famílias Ativas"
            value={stats.activeFamilySubscriptions}
            supportValue={`de ${stats.totalFamilySubscriptions}`}
            color="blue"
            iconName="house"
          />
          <CardNumberSoft
            title="Babás Ativas"
            value={stats.activeNannySubscriptions}
            supportValue={`de ${stats.totalNannySubscriptions}`}
            color="pink"
            iconName="first-aid-kit"
          />
          <CardNumberSoft
            title="Total Ativas"
            value={stats.activeFamilySubscriptions + stats.activeNannySubscriptions}
            color="indigo"
            iconName="crown"
          />
          <CardNumberSoft
            title="Planos em Uso"
            value={stats.plansCount}
            color="amber"
            iconName="trend-up"
          />
        </div>
      </div>
    </div>
  );
}

export default async function PlansPage() {
  await requirePermission('SUBSCRIPTIONS');

  const [familySubscriptions, nannySubscriptions] = await Promise.all([
    getFamilySubscriptions(),
    getNannySubscriptions(),
  ]);

  return (
    <PageContent title="Planos e Assinaturas">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent />
      </Suspense>

      <div className="mt-8">
        <Tabs defaultValue="families" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="families" className="flex items-center gap-2">
              <HouseIcon className="size-4" />
              Famílias ({familySubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="nannies" className="flex items-center gap-2">
              <FirstAidKitIcon className="size-4" />
              Babás ({nannySubscriptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="families" className="mt-4">
            <FamilySubscriptionsDataTable subscriptions={familySubscriptions} />
          </TabsContent>

          <TabsContent value="nannies" className="mt-4">
            <NannySubscriptionsDataTable subscriptions={nannySubscriptions} />
          </TabsContent>
        </Tabs>
      </div>
    </PageContent>
  );
}
