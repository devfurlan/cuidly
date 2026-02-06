import PageContent from '@/components/layout/PageContent';
import prisma from '@/lib/prisma';
import FamiliesCounters from './_components/FamiliesCounters';
import { FamilyListItem } from '../../schemas/familySchemas';
import FamiliesActionsPage from './_components/FamiliesActionsPage';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FamiliesDataTable } from './_components/FamiliesDataTable';

export const metadata = {
  title: 'Famílias',
};

async function getFamilies() {
  const families = await prisma.family.findMany({
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      emailAddress: true,
      status: true,
      address: {
        select: { neighborhood: true, city: true, state: true },
      },
      children: {
        select: {
          child: {
            select: { id: true, name: true },
          },
        },
      },
      subscription: {
        select: {
          status: true,
          plan: true,
        },
      },
      createdAt: true,
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

  // Map plan enum to display names
  const planNames: Record<string, string> = {
    FAMILY_FREE: 'Explorar',
    FAMILY_PLUS: 'Plus',
  };

  const results: FamilyListItem[] = families.map((family) => {
    return {
      id: family.id,
      name: family.name,
      phoneNumber: family.phoneNumber,
      emailAddress: family.emailAddress,
      status: family.status,
      address: family.address
        ? {
            city: family.address.city,
            state: family.address.state,
            neighborhood: family.address.neighborhood,
          }
        : null,
      children: family.children.map((c) => c.child),
      subscription: family.subscription
        ? {
            status: family.subscription.status,
            plan: {
              name: planNames[family.subscription.plan] || 'Explorar',
            },
          }
        : null,
    };
  });

  return results;
}

export default async function FamiliesPage() {
  const familiesData = await getFamilies();

  return (
    <PageContent title="Famílias" actions={<FamiliesActionsPage />}>
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
        <FamiliesCounters />
      </Suspense>
      <div className="mt-2">
        <FamiliesDataTable families={familiesData} />
      </div>
    </PageContent>
  );
}
