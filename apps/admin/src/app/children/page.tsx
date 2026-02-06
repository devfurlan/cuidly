import PageContent from '@/components/layout/PageContent';
import prisma from '@/lib/prisma';
import ChildrenCounters from './_components/ChildrenCounters';
import ChildrenActionsPage from './_components/ChildrenActionsPage';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChildrenDataTable } from './_components/ChildrenDataTable';

export const metadata = {
  title: 'Crianças',
};

async function getChildren() {
  const children = await prisma.child.findMany({
    select: {
      id: true,
      name: true,
      birthDate: true,
      gender: true,
      allergies: true,
      specialNeeds: true,
      notes: true,
      status: true,
      createdAt: true,
      families: {
        select: {
          family: {
            select: {
              id: true,
              name: true,
            },
          },
          relationshipType: true,
          isMain: true,
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

  return children.map((child) => ({
    id: child.id,
    name: child.name,
    birthDate: child.birthDate?.toISOString() || null,
    gender: child.gender,
    allergies: child.allergies,
    specialNeeds: child.specialNeeds,
    notes: child.notes,
    status: child.status.toLowerCase(),
    createdAt: child.createdAt.toISOString(),
    families: child.families.map((f) => ({
      id: f.family.id,
      name: f.family.name,
      relationshipType: f.relationshipType,
      isMain: f.isMain,
    })),
  }));
}

export default async function ChildrenPage() {
  const childrenData = await getChildren();

  return (
    <PageContent title="Crianças" actions={<ChildrenActionsPage />}>
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            <Skeleton className="h-[110px] w-full rounded-xl" />
            <Skeleton className="h-[110px] w-full rounded-xl" />
            <Skeleton className="h-[110px] w-full rounded-xl" />
          </div>
        }
      >
        <ChildrenCounters />
      </Suspense>
      <div className="mt-2">
        <ChildrenDataTable data={childrenData} />
      </div>
    </PageContent>
  );
}
