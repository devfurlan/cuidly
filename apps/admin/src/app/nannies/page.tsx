import PageContent from '@/components/layout/PageContent';
import prisma from '@/lib/prisma';
import NanniesCounters from './_components/NanniesCounters';
import { Nanny } from '../../schemas/nannySchemas';
import NanniesActionsPage from './_components/NanniesActionsPage';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { NanniesDataTable } from './_components/NanniesDataTable';

export const metadata = {
  title: 'Babás',
};

async function getNannies() {
  const nannies = await prisma.nanny.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      phoneNumber: true,
      addressId: true,
      address: {
        select: { neighborhood: true, city: true, state: true },
      },
      status: true,
      birthDate: true,
      gender: true,
      photoUrl: true,
      emailAddress: true,
      experienceYears: true,
      hourlyRate: true,
      createdAt: true,
      updatedAt: true,
      subscription: {
        select: {
          status: true,
          plan: true,
        },
      },
    },
    where: {
      status: {
        not: 'DELETED',
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get all nanny IDs to fetch analytics in batch
  const nannyIds = nannies.map((n) => n.id);

  // Fetch analytics counts for all nannies at once
  const viewsCounts = await prisma.profileAnalytics.groupBy({
    by: ['nannyId'],
    where: {
      nannyId: { in: nannyIds },
      actionType: 'VIEW',
    },
    _count: {
      nannyId: true,
    },
  });

  const hireClicksCounts = await prisma.profileAnalytics.groupBy({
    by: ['nannyId'],
    where: {
      nannyId: { in: nannyIds },
      actionType: 'HIRE_CLICK',
    },
    _count: {
      nannyId: true,
    },
  });

  // Create maps for quick lookup
  const viewsMap = new Map(
    viewsCounts.map((v) => [v.nannyId, v._count.nannyId]),
  );
  const hireClicksMap = new Map(
    hireClicksCounts.map((h) => [h.nannyId, h._count.nannyId]),
  );

  const results: Nanny[] = nannies.map((nanny) => {
    return {
      id: nanny.id,
      name: nanny.name,
      slug: nanny.slug,
      phoneNumber: nanny.phoneNumber,
      addressId: nanny.addressId ?? 0,
      neighborhood: nanny.address?.neighborhood,
      city: nanny.address?.city ?? '',
      state: nanny.address?.state ?? '',
      status: nanny.status.toLowerCase() as 'pending' | 'active' | 'inactive',
      birthDate: nanny.birthDate?.toISOString(),
      gender: nanny.gender,
      photoUrl: nanny.photoUrl,
      emailAddress: nanny.emailAddress,
      experienceYears: nanny.experienceYears,
      hourlyRate: nanny.hourlyRate ? Number(nanny.hourlyRate) : null,
      createdAt: nanny.createdAt.toISOString(),
      updatedAt: nanny.updatedAt?.toISOString(),
      viewsCount: viewsMap.get(nanny.id) || 0,
      hireClicksCount: hireClicksMap.get(nanny.id) || 0,
      subscription: nanny.subscription
        ? {
            status: nanny.subscription.status,
            planName: nanny.subscription.plan,
          }
        : null,
    };
  });

  return results;
}

export default async function NanniesPage() {
  const nanniesData = await getNannies();

  return (
    <PageContent title="Babás" actions={<NanniesActionsPage />}>
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            <Skeleton className="h-[110px] w-full rounded-xl" />
            <Skeleton className="h-[110px] w-full rounded-xl" />
            <Skeleton className="h-[110px] w-full rounded-xl" />
            <Skeleton className="h-[110px] w-full rounded-xl" />
          </div>
        }
      >
        <NanniesCounters />
      </Suspense>
      <div className="mt-2">
        <NanniesDataTable nannies={nanniesData} />
      </div>
    </PageContent>
  );
}
