/**
 * Job Details Page - Server Component
 * Route: /app/vagas/[jobId]
 *
 * Fetches job data server-side and passes to client components for interactivity
 */

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import {
  calculateMatchScore,
  toNannyProfile,
  toFamilyData,
  toJobData,
  toChildData,
} from '@/services/matching';
import { JobDetailContent } from './_components/JobDetailContent';
import type {
  Job,
  Application,
  MatchResult,
  ApplicationStats,
} from './_components/types';

interface Props {
  params: Promise<{ jobId: string }>;
}

export default async function JobDetailPage({ params }: Props) {
  const { jobId } = await params;
  const jobIdNum = parseInt(jobId, 10);

  if (isNaN(jobIdNum)) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Fetch job with all related data
  const job = await prisma.job.findUnique({
    where: { id: jobIdNum },
    include: {
      family: {
        include: {
          address: true,
          children: {
            include: {
              child: true,
            },
          },
        },
      },
      applications: {
        include: {
          nanny: {
            include: {
              address: true,
            },
          },
        },
        orderBy: [{ matchScore: 'desc' }, { createdAt: 'desc' }],
      },
    },
  });

  if (!job) {
    notFound();
  }

  const isOwner =
    currentUser.type === 'family' && currentUser.family.id === job.familyId;
  const isNanny = currentUser.type === 'nanny';

  // Get children included in job
  const jobChildren = job.family.children
    .filter((cf) => job.childrenIds.includes(cf.childId))
    .map((cf) => cf.child);

  // Base job response
  const jobData: Job = {
    id: job.id,
    title: job.title,
    description: job.description,
    jobType: job.jobType,
    schedule: job.schedule as Job['schedule'],
    requiresOvernight: job.requiresOvernight,
    contractType: job.contractType,
    benefits: job.benefits,
    paymentType: job.paymentType,
    budgetMin: Number(job.budgetMin),
    budgetMax: Number(job.budgetMax),
    mandatoryRequirements: job.mandatoryRequirements,
    photos: job.photos,
    startDate: job.startDate.toISOString(),
    status: job.status,
    createdAt: job.createdAt.toISOString(),
    children: jobChildren.map((c) => ({
      id: c.id,
      name: c.name,
      birthDate: c.birthDate?.toISOString() || null,
      hasSpecialNeeds: c.hasSpecialNeeds,
      gender: c.gender,
      carePriorities: c.carePriorities,
      routine: c.routine,
      specialNeedsTypes: c.specialNeedsTypes,
      specialNeedsDescription: c.specialNeedsDescription,
      unborn: c.unborn,
      expectedBirthDate: c.expectedBirthDate?.toISOString() || null,
    })),
    family: {
      id: job.family.id,
      name: job.family.name,
      photoUrl: job.family.photoUrl,
      familyPresentation: job.family.familyPresentation,
      city: job.family.address?.city || null,
      state: job.family.address?.state || null,
      neighborhood: job.family.address?.neighborhood || null,
      neededShifts: job.family.neededShifts,
      neededDays: job.family.neededDays,
      hasPets: job.family.hasPets,
      petTypes: job.family.petTypes,
      petsDescription: job.family.petsDescription,
      housingType: job.family.housingType,
      parentPresence: job.family.parentPresence,
      domesticHelpExpected: job.family.domesticHelpExpected,
      houseRules: job.family.houseRules,
    },
  };

  // Initialize response variables
  let applications: Application[] = [];
  let stats: ApplicationStats | null = null;
  let hasActiveSubscription = false;
  let myApplication: Application | null = null;
  let matchResult: MatchResult | null = null;

  // If user is the family owner
  if (isOwner) {
    const subscription = currentUser.family.subscription;
    hasActiveSubscription =
      subscription?.status === 'ACTIVE' &&
      subscription?.plan !== 'FAMILY_FREE' &&
      subscription?.plan !== 'NANNY_FREE' &&
      subscription?.currentPeriodEnd != null &&
      subscription.currentPeriodEnd > new Date();

    applications = job.applications.map((app) => ({
      id: app.id,
      status: app.status,
      matchScore:
        hasActiveSubscription && app.matchScore ? Number(app.matchScore) : null,
      message: app.message,
      createdAt: app.createdAt.toISOString(),
      nanny: {
        id: app.nanny.id,
        name: app.nanny.name,
        slug: app.nanny.slug,
        photoUrl: app.nanny.photoUrl,
        experienceYears: app.nanny.experienceYears,
        certifications: app.nanny.certifications,
        hasSpecialNeedsExperience: app.nanny.hasSpecialNeedsExperience,
        city: app.nanny.address?.city || null,
        state: app.nanny.address?.state || null,
        phone: app.nanny.phoneNumber,
        email: app.nanny.emailAddress,
      },
    }));

    stats = {
      total: applications.length,
      pending: applications.filter((a) => a.status === 'PENDING').length,
      accepted: applications.filter((a) => a.status === 'ACCEPTED').length,
      rejected: applications.filter((a) => a.status === 'REJECTED').length,
    };
  }

  // If user is a nanny
  if (isNanny) {
    const existingApplication = job.applications.find(
      (a) => a.nanny.id === currentUser.nanny.id
    );

    if (existingApplication) {
      myApplication = {
        id: existingApplication.id,
        status: existingApplication.status,
        matchScore: existingApplication.matchScore
          ? Number(existingApplication.matchScore)
          : null,
        message: existingApplication.message,
        createdAt: existingApplication.createdAt.toISOString(),
        nanny: {
          id: existingApplication.nanny.id,
          name: existingApplication.nanny.name,
          slug: existingApplication.nanny.slug,
          photoUrl: existingApplication.nanny.photoUrl,
          experienceYears: existingApplication.nanny.experienceYears,
          certifications: existingApplication.nanny.certifications,
          hasSpecialNeedsExperience:
            existingApplication.nanny.hasSpecialNeedsExperience,
          city: existingApplication.nanny.address?.city || null,
          state: existingApplication.nanny.address?.state || null,
          phone: existingApplication.nanny.phoneNumber,
          email: existingApplication.nanny.emailAddress,
        },
      };
    }

    // Calculate match score for this nanny
    const nanny = await prisma.nanny.findUnique({
      where: { id: currentUser.nanny.id },
      include: {
        address: true,
      },
    });

    if (nanny) {
      const reviewStats = await prisma.review.aggregate({
        where: {
          nannyId: nanny.id,
          isPublished: true,
        },
        _avg: { overallRating: true },
        _count: { id: true },
      });

      const jobDataForMatching = toJobData({
        id: job.id,
        mandatoryRequirements: job.mandatoryRequirements,
        childrenIds: job.childrenIds,
      });

      const familyData = toFamilyData({
        id: job.family.id,
        hasPets: job.family.hasPets,
        numberOfChildren: job.family.numberOfChildren,
        nannyType: job.family.nannyType,
        contractRegime: job.family.contractRegime,
        hourlyRateRange: job.family.hourlyRateRange,
        domesticHelpExpected: job.family.domesticHelpExpected,
        neededDays: (job.family.neededDays as string[]) || [],
        neededShifts: (job.family.neededShifts as string[]) || [],
        address: job.family.address
          ? {
              latitude: job.family.address.latitude,
              longitude: job.family.address.longitude,
            }
          : null,
      });

      const childrenData = jobChildren.map((c) =>
        toChildData({
          id: c.id,
          birthDate: c.birthDate,
          expectedBirthDate: c.expectedBirthDate,
          unborn: c.unborn,
          hasSpecialNeeds: c.hasSpecialNeeds,
          specialNeedsTypes: c.specialNeedsTypes || [],
          specialNeedsDescription: c.specialNeedsDescription,
        })
      );

      const nannyProfile = toNannyProfile(
        {
          id: nanny.id,
          name: nanny.name,
          gender: nanny.gender,
          birthDate: nanny.birthDate,
          isSmoker: nanny.isSmoker,
          hasCnh: nanny.hasCnh ?? false,
          experienceYears: nanny.experienceYears,
          hasSpecialNeedsExperience: nanny.hasSpecialNeedsExperience,
          specialNeedsSpecialties: nanny.specialNeedsSpecialties || [],
          specialNeedsExperienceDescription:
            nanny.specialNeedsExperienceDescription,
          certifications: nanny.certifications,
          ageRangesExperience: nanny.ageRangesExperience,
          maxTravelDistance: nanny.maxTravelDistance,
          maxChildrenCare: nanny.maxChildrenCare,
          comfortableWithPets: nanny.comfortableWithPets,
          acceptedActivities: nanny.acceptedActivities,
          nannyTypes: nanny.nannyTypes || [],
          contractRegimes: nanny.contractRegimes || [],
          hourlyRateRange: nanny.hourlyRateRange,
          documentValidated: nanny.documentValidated,
          documentExpirationDate: nanny.documentExpirationDate,
          personalDataValidated: nanny.personalDataValidated,
          criminalBackgroundValidated: nanny.criminalBackgroundValidated,
          lastActiveAt:
            (nanny as { lastActiveAt?: Date | null }).lastActiveAt ?? null,
          address: nanny.address
            ? {
                latitude: nanny.address.latitude,
                longitude: nanny.address.longitude,
              }
            : null,
        },
        {
          averageRating: reviewStats._avg.overallRating,
          reviewCount: reviewStats._count.id,
        }
      );

      const result = calculateMatchScore(
        jobDataForMatching,
        familyData,
        childrenData,
        nannyProfile
      );

      matchResult = {
        score: result.score,
        isEligible: result.isEligible,
        eliminationReasons: result.eliminationReasons,
        breakdown: result.breakdown as MatchResult['breakdown'],
      };
    }
  }

  return (
    <JobDetailContent
      job={jobData}
      jobId={jobId}
      isOwner={isOwner}
      hasActiveSubscription={hasActiveSubscription}
      applications={applications}
      stats={stats}
      myApplication={myApplication}
      matchResult={matchResult}
    />
  );
}
