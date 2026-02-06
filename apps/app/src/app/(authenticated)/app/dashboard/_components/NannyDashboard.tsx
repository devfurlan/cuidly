/**
 * Nanny Dashboard Container
 * Orchestrates all nanny dashboard sections with Suspense boundaries
 */

import { Suspense } from 'react';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import type { Nanny, Subscription } from '@prisma/client';

import { NannyWelcomeSection } from './NannyWelcomeSection';
import { NannySummaryCards } from './NannySummaryCards';
import { NannyAnalyticsSection } from './NannyAnalyticsSection';
import { NannyApplicationsSection } from './NannyApplicationsSection';
import { NannyRecommendedJobs } from './NannyRecommendedJobs';
import { ShareProfileCard } from './ShareProfileCard.client';
import { NannySealCard } from './NannySealCard';
import { SectionSkeleton } from './SectionSkeleton';

type NannyWithAddress = Nanny & {
  address: {
    city: string;
    state: string;
    neighborhood: string | null;
  } | null;
  subscription: Subscription | null;
  reviews: { id: number }[];
};

interface NannyDashboardProps {
  nanny: NannyWithAddress;
}

export function NannyDashboard({ nanny }: NannyDashboardProps) {
  return (
    <>
      <EmailVerificationBanner />

      {/* Welcome Section - rendered immediately with server-fetched name */}
      <NannyWelcomeSection name={nanny.name} />

      {/* Share Profile Card - client component (only shown if profile is public) */}
      {nanny.slug && nanny.isProfilePublic && (
        <ShareProfileCard
          slug={nanny.slug}
          city={nanny.address?.city ?? null}
        />
      )}

      {/* Summary Cards - streams in with Suspense */}
      <Suspense fallback={<SectionSkeleton type="summary" />}>
        <NannySummaryCards nannyId={nanny.id} />
      </Suspense>

      {/* Analytics Section - streams in with Suspense */}
      <Suspense fallback={<SectionSkeleton type="analytics" />}>
        <NannyAnalyticsSection nannyId={nanny.id} />
      </Suspense>

      {/* Main Content Grid - Applications and Recommended Jobs */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<SectionSkeleton type="list" />}>
          <NannyApplicationsSection nannyId={nanny.id} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton type="list" />}>
          <NannyRecommendedJobs nannyId={nanny.id} />
        </Suspense>
      </div>

      {/* Seal Card - shows current seal and progress (at the bottom) */}
      <NannySealCard nanny={nanny} />
    </>
  );
}
