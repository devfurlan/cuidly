/**
 * Dashboard Page
 * /app/dashboard
 *
 * Server Component that renders dashboard based on user role (FAMILY or NANNY)
 * Uses Suspense for progressive loading of data-heavy sections
 */

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';
import { PageTitle } from '@/components/PageTitle';
import prisma from '@/lib/prisma';

import { NannyDashboard } from './_components/NannyDashboard';
import { FamilyDashboard } from './_components/FamilyDashboard';

export const metadata = {
  title: 'Dashboard - Cuidly',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.type === 'nanny') {
    // Get nanny with all data needed for seal calculation and dashboard
    const nanny = await prisma.nanny.findUnique({
      where: { id: user.nanny.id },
      include: {
        address: {
          select: {
            city: true,
            state: true,
            neighborhood: true,
          },
        },
        subscription: true,
        reviews: {
          where: { isPublished: true, isVisible: true },
          select: { id: true },
        },
      },
    });

    if (!nanny) {
      redirect('/login');
    }

    return (
      <>
        <PageTitle title="Dashboard - Cuidly" />
        <NannyDashboard nanny={nanny} />
      </>
    );
  }

  // Family dashboard
  return (
    <>
      <PageTitle title="Dashboard - Cuidly" />
      <FamilyDashboard family={user.family} />
    </>
  );
}
