/**
 * Family Dashboard Container
 * Orchestrates all family dashboard sections with Suspense boundaries
 */

import { Suspense } from 'react';
import type { FamilyWithSubscription } from '@/lib/auth/getCurrentUser';
import { getFirstName } from '@/utils/slug';

import { FamilyWelcomeSection } from './FamilyWelcomeSection';
import { FamilySummaryCards } from './FamilySummaryCards';
import { FamilyJobsSection } from './FamilyJobsSection';
import { FamilyApplicationsSection } from './FamilyApplicationsSection';
import { SectionSkeleton } from './SectionSkeleton';

interface FamilyDashboardProps {
  family: FamilyWithSubscription;
}

export function FamilyDashboard({ family }: FamilyDashboardProps) {
  return (
    <>
      {/* Welcome Section - rendered immediately with server-fetched name */}
      <FamilyWelcomeSection name={getFirstName(family.name)} />

      {/* Summary Cards - streams in with Suspense */}
      <Suspense fallback={<SectionSkeleton type="summary" />}>
        <FamilySummaryCards familyId={family.id} />
      </Suspense>

      {/* Main Content Grid - Jobs and Applications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<SectionSkeleton type="list" />}>
          <FamilyJobsSection familyId={family.id} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton type="list" />}>
          <FamilyApplicationsSection familyId={family.id} />
        </Suspense>
      </div>
    </>
  );
}
