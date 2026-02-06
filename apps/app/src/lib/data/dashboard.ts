/**
 * Dashboard Data Fetching Functions
 * Server-side data fetching for dashboard components
 */

import prisma from '@/lib/prisma';
import {
  calculateMatchScore,
  type NannyProfile,
  type JobData,
  type FamilyData,
  type ChildData,
} from '@/services/matching';
import { getFirstName } from '@/utils/slug';

// Types
export interface NannySummary {
  totalApplications: number;
  acceptedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  compatibleJobs: number;
}

export interface NannyRecentApplication {
  id: number;
  status: string;
  matchScore: number | null;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
  job: {
    id: number;
    title: string;
    jobType: string;
    status: string;
    budgetMin: number;
    budgetMax: number;
    paymentType: string;
    familyName: string;
    city: string | null;
    state: string | null;
  };
}

export interface RecommendedJob {
  id: number;
  title: string;
  jobType: string;
  budgetMin: number;
  budgetMax: number;
  paymentType: string;
  childrenCount: number;
  createdAt: Date;
  city: string | null;
  state: string | null;
  matchScore: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalHireClicks: number;
  conversionRate: string;
}

export interface FamilySummary {
  activeJobs: number;
  pendingApplications: number;
  favorites: number;
}

export interface FamilyRecentJob {
  id: number;
  title: string;
  jobType: string;
  status: string;
  createdAt: Date;
  startDate: Date | null;
  applicationsCount: number;
}

export interface FamilyRecentApplication {
  id: number;
  createdAt: Date;
  matchScore: number | null;
  message: string | null;
  jobId: number;
  jobTitle: string;
  nanny: {
    id: number;
    name: string;
    photoUrl: string | null;
    experienceYears: number | null;
    city: string | null;
    state: string | null;
  };
}

/**
 * Get nanny summary data (applications counts and compatible jobs)
 */
export async function getNannySummary(nannyId: number): Promise<NannySummary> {
  const nanny = await prisma.nanny.findUnique({
    where: { id: nannyId },
    include: {
      address: true,
      availability: true,
    },
  });

  if (!nanny) {
    return {
      totalApplications: 0,
      acceptedApplications: 0,
      pendingApplications: 0,
      rejectedApplications: 0,
      compatibleJobs: 0,
    };
  }

  const [
    totalApplications,
    acceptedApplications,
    pendingApplications,
    rejectedApplications,
    activeJobs,
  ] = await Promise.all([
    prisma.jobApplication.count({ where: { nannyId } }),
    prisma.jobApplication.count({ where: { nannyId, status: 'ACCEPTED' } }),
    prisma.jobApplication.count({ where: { nannyId, status: 'PENDING' } }),
    prisma.jobApplication.count({ where: { nannyId, status: 'REJECTED' } }),
    prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        applications: { none: { nannyId } },
      },
      include: {
        family: {
          include: {
            address: true,
            children: { include: { child: true } },
          },
        },
      },
    }),
  ]);

  // Get review stats
  const reviewStats = await prisma.review.aggregate({
    where: { nannyId: nanny.id, isPublished: true },
    _avg: { overallRating: true },
    _count: { id: true },
  });

  // Parse availability slots
  let availabilitySlots: string[] | null = null;
  if (nanny.availability?.schedule) {
    const schedule = nanny.availability.schedule as Record<string, { enabled: boolean; periods?: string[] }>;
    availabilitySlots = [];
    for (const [day, data] of Object.entries(schedule)) {
      if (data.enabled && data.periods) {
        for (const period of data.periods) {
          availabilitySlots.push(`${day.toUpperCase()}_${period.toUpperCase()}`);
        }
      }
    }
  }

  // Prepare nanny profile for matching
  const nannyProfile: NannyProfile = {
    id: nanny.id,
    name: nanny.name || '',
    gender: nanny.gender,
    birthDate: nanny.birthDate,
    isSmoker: nanny.isSmoker,
    hasCnh: nanny.hasCnh,
    experienceYears: nanny.experienceYears,
    hasSpecialNeedsExperience: nanny.hasSpecialNeedsExperience,
    specialNeedsExperienceDescription: nanny.specialNeedsExperienceDescription,
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
    averageRating: reviewStats._avg.overallRating,
    reviewCount: reviewStats._count.id,
    lastActiveAt: (nanny as { lastActiveAt?: Date | null }).lastActiveAt ?? null,
    address: nanny.address
      ? { latitude: nanny.address.latitude, longitude: nanny.address.longitude }
      : null,
    availabilitySlots,
  };

  // Calculate compatible jobs
  let compatibleJobsCount = 0;
  for (const job of activeJobs) {
    const jobChildren = job.family.children
      .filter((cf) => job.childrenIds.includes(cf.childId))
      .map((cf) => cf.child);

    const jobData: JobData = {
      id: job.id,
      mandatoryRequirements: job.mandatoryRequirements,
      childrenIds: job.childrenIds,
    };

    let familyAvailabilitySlots: string[] | null = null;
    if (job.family.neededDays && job.family.neededShifts) {
      familyAvailabilitySlots = (job.family.neededDays as string[]).flatMap((day: string) =>
        (job.family.neededShifts as string[]).map((shift: string) => `${day}_${shift}`)
      );
    }

    const familyData: FamilyData = {
      id: job.family.id,
      hasPets: job.family.hasPets,
      numberOfChildren: job.family.numberOfChildren,
      nannyType: job.family.nannyType,
      contractRegime: job.family.contractRegime,
      hourlyRateRange: job.family.hourlyRateRange,
      domesticHelpExpected: job.family.domesticHelpExpected,
      availabilitySlots: familyAvailabilitySlots,
      address: job.family.address
        ? { latitude: job.family.address.latitude, longitude: job.family.address.longitude }
        : null,
    };

    const childrenData: ChildData[] = jobChildren.map((c) => ({
      id: c.id,
      birthDate: c.birthDate,
      expectedBirthDate: c.expectedBirthDate,
      unborn: c.unborn,
      hasSpecialNeeds: c.hasSpecialNeeds,
      specialNeedsDescription: c.specialNeedsDescription,
    }));

    const result = calculateMatchScore(jobData, familyData, childrenData, nannyProfile);
    if (result.isEligible) {
      compatibleJobsCount++;
    }
  }

  return {
    totalApplications,
    acceptedApplications,
    pendingApplications,
    rejectedApplications,
    compatibleJobs: compatibleJobsCount,
  };
}

/**
 * Get nanny recent applications
 */
export async function getNannyRecentApplications(nannyId: number): Promise<NannyRecentApplication[]> {
  const applications = await prisma.jobApplication.findMany({
    where: { nannyId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      status: true,
      matchScore: true,
      message: true,
      createdAt: true,
      updatedAt: true,
      job: {
        select: {
          id: true,
          title: true,
          jobType: true,
          status: true,
          budgetMin: true,
          budgetMax: true,
          paymentType: true,
          family: {
            select: {
              name: true,
              address: {
                select: { city: true, state: true },
              },
            },
          },
        },
      },
    },
  });

  return applications.map((app) => ({
    id: app.id,
    status: app.status,
    matchScore: app.matchScore ? Number(app.matchScore) : null,
    message: app.message,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    job: {
      id: app.job.id,
      title: app.job.title,
      jobType: app.job.jobType,
      status: app.job.status,
      budgetMin: Number(app.job.budgetMin),
      budgetMax: Number(app.job.budgetMax),
      paymentType: app.job.paymentType,
      familyName: app.job.family.name,
      city: app.job.family.address?.city ?? null,
      state: app.job.family.address?.state ?? null,
    },
  }));
}

/**
 * Get recommended jobs for nanny
 */
export async function getRecommendedJobs(nannyId: number): Promise<RecommendedJob[]> {
  const nanny = await prisma.nanny.findUnique({
    where: { id: nannyId },
    include: {
      address: true,
      availability: true,
    },
  });

  if (!nanny) return [];

  const activeJobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      applications: { none: { nannyId } },
    },
    include: {
      family: {
        include: {
          address: true,
          children: { include: { child: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get review stats
  const reviewStats = await prisma.review.aggregate({
    where: { nannyId: nanny.id, isPublished: true },
    _avg: { overallRating: true },
    _count: { id: true },
  });

  // Parse availability slots
  let availabilitySlots: string[] | null = null;
  if (nanny.availability?.schedule) {
    const schedule = nanny.availability.schedule as Record<string, { enabled: boolean; periods?: string[] }>;
    availabilitySlots = [];
    for (const [day, data] of Object.entries(schedule)) {
      if (data.enabled && data.periods) {
        for (const period of data.periods) {
          availabilitySlots.push(`${day.toUpperCase()}_${period.toUpperCase()}`);
        }
      }
    }
  }

  const nannyProfile: NannyProfile = {
    id: nanny.id,
    name: nanny.name || '',
    gender: nanny.gender,
    birthDate: nanny.birthDate,
    isSmoker: nanny.isSmoker,
    hasCnh: nanny.hasCnh,
    experienceYears: nanny.experienceYears,
    hasSpecialNeedsExperience: nanny.hasSpecialNeedsExperience,
    specialNeedsExperienceDescription: nanny.specialNeedsExperienceDescription,
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
    averageRating: reviewStats._avg.overallRating,
    reviewCount: reviewStats._count.id,
    lastActiveAt: (nanny as { lastActiveAt?: Date | null }).lastActiveAt ?? null,
    address: nanny.address
      ? { latitude: nanny.address.latitude, longitude: nanny.address.longitude }
      : null,
    availabilitySlots,
  };

  const jobsWithScores = activeJobs.map((job) => {
    const jobChildren = job.family.children
      .filter((cf) => job.childrenIds.includes(cf.childId))
      .map((cf) => cf.child);

    const jobData: JobData = {
      id: job.id,
      mandatoryRequirements: job.mandatoryRequirements,
      childrenIds: job.childrenIds,
    };

    let familyAvailabilitySlots: string[] | null = null;
    if (job.family.neededDays && job.family.neededShifts) {
      familyAvailabilitySlots = (job.family.neededDays as string[]).flatMap((day: string) =>
        (job.family.neededShifts as string[]).map((shift: string) => `${day}_${shift}`)
      );
    }

    const familyData: FamilyData = {
      id: job.family.id,
      hasPets: job.family.hasPets,
      numberOfChildren: job.family.numberOfChildren,
      nannyType: job.family.nannyType,
      contractRegime: job.family.contractRegime,
      hourlyRateRange: job.family.hourlyRateRange,
      domesticHelpExpected: job.family.domesticHelpExpected,
      availabilitySlots: familyAvailabilitySlots,
      address: job.family.address
        ? { latitude: job.family.address.latitude, longitude: job.family.address.longitude }
        : null,
    };

    const childrenData: ChildData[] = jobChildren.map((c) => ({
      id: c.id,
      birthDate: c.birthDate,
      expectedBirthDate: c.expectedBirthDate,
      unborn: c.unborn,
      hasSpecialNeeds: c.hasSpecialNeeds,
      specialNeedsDescription: c.specialNeedsDescription,
    }));

    const result = calculateMatchScore(jobData, familyData, childrenData, nannyProfile);

    return {
      id: job.id,
      title: job.title,
      jobType: job.jobType,
      budgetMin: Number(job.budgetMin),
      budgetMax: Number(job.budgetMax),
      paymentType: job.paymentType,
      childrenCount: job.childrenIds.length,
      createdAt: job.createdAt,
      city: job.family.address?.city ?? null,
      state: job.family.address?.state ?? null,
      matchScore: result.score,
      isEligible: result.isEligible,
    };
  });

  return jobsWithScores
    .filter((j) => j.isEligible)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
    .map(({ isEligible, ...job }) => job);
}

/**
 * Get nanny analytics summary (last 30 days)
 */
export async function getNannyAnalytics(nannyId: number): Promise<AnalyticsSummary | null> {
  type ProfileActionType = 'VIEW' | 'HIRE_CLICK' | 'CONTACT_CLICK' | 'SHARE' | 'FAVORITE';

   
  const totalsByActionType = await (prisma.profileAnalytics.groupBy as any)({
    by: ['actionType'],
    where: { nannyId },
    _count: { id: true },
  });

  const views = totalsByActionType.find((t: { actionType: ProfileActionType; _count: { id: number } }) => t.actionType === 'VIEW')?._count.id || 0;
  const hireClicks = totalsByActionType.find((t: { actionType: ProfileActionType; _count: { id: number } }) => t.actionType === 'HIRE_CLICK')?._count.id || 0;
  const conversionRate = views > 0 ? (hireClicks / views) * 100 : 0;

  return {
    totalViews: views,
    totalHireClicks: hireClicks,
    conversionRate: conversionRate.toFixed(2),
  };
}

/**
 * Get family summary data
 */
export async function getFamilySummary(familyId: number): Promise<FamilySummary> {
  const [activeJobs, pendingApplications, favorites] = await Promise.all([
    prisma.job.count({
      where: { familyId, status: 'ACTIVE', deletedAt: null },
    }),
    prisma.jobApplication.count({
      where: {
        job: { familyId, deletedAt: null },
        status: 'PENDING',
      },
    }),
    prisma.favorite.count({ where: { familyId } }),
  ]);

  return { activeJobs, pendingApplications, favorites };
}

/**
 * Get family recent jobs
 */
export async function getFamilyRecentJobs(familyId: number): Promise<FamilyRecentJob[]> {
  const jobs = await prisma.job.findMany({
    where: { familyId, status: 'ACTIVE', deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      jobType: true,
      status: true,
      createdAt: true,
      startDate: true,
      _count: { select: { applications: true } },
    },
  });

  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    jobType: job.jobType,
    status: job.status,
    createdAt: job.createdAt,
    startDate: job.startDate,
    applicationsCount: job._count.applications,
  }));
}

/**
 * Get family recent applications
 */
export async function getFamilyRecentApplications(familyId: number): Promise<FamilyRecentApplication[]> {
  const applications = await prisma.jobApplication.findMany({
    where: {
      job: { familyId, deletedAt: null },
      status: 'PENDING',
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      createdAt: true,
      matchScore: true,
      message: true,
      job: {
        select: { id: true, title: true },
      },
      nanny: {
        select: {
          id: true,
          name: true,
          photoUrl: true,
          experienceYears: true,
          address: {
            select: { city: true, state: true },
          },
        },
      },
    },
  });

  return applications.map((app) => ({
    id: app.id,
    createdAt: app.createdAt,
    matchScore: app.matchScore ? Number(app.matchScore) : null,
    message: app.message,
    jobId: app.job.id,
    jobTitle: app.job.title,
    nanny: {
      id: app.nanny.id,
      name: app.nanny.name ? getFirstName(app.nanny.name) : '',
      photoUrl: app.nanny.photoUrl,
      experienceYears: app.nanny.experienceYears,
      city: app.nanny.address?.city ?? null,
      state: app.nanny.address?.state ?? null,
    },
  }));
}
