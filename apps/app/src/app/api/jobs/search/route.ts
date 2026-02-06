import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  calculateMatchScore,
  type NannyProfile,
  type JobData,
  type FamilyData,
  type ChildData,
} from '@/services/matching';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * GET /api/jobs/search - Search and list active jobs with optional matching
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user (optional for public listing)
    const currentUser = await getCurrentUser();

    // Get query params
    const { searchParams } = new URL(request.url);
    const jobType = searchParams.get('jobType');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const budgetMin = searchParams.get('budgetMin');
    const budgetMax = searchParams.get('budgetMax');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Check if user is a family to filter only their own jobs
    let familyId: number | null = null;
    let isFamily = false;

    if (currentUser && currentUser.type === 'family') {
      familyId = currentUser.family.id;
      isFamily = true;
    }

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
      deletedAt: null,
    };

    // If user is a family, show only their own jobs
    if (isFamily && familyId) {
      where.familyId = familyId;
    }

    if (jobType) {
      where.jobType = jobType;
    }

    // Fetch jobs with family data and boosts
    const now = new Date();
    const jobs = await prisma.job.findMany({
      where,
      include: {
        family: {
          include: {
            address: true,
            children: {
              include: {
                child: true,
              },
            },
            subscription: true,
          },
        },
        _count: {
          select: { applications: true },
        },
        boosts: {
          where: {
            type: 'JOB',
            isActive: true,
            endDate: { gte: now },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by location if specified
    let filteredJobs = jobs;
    if (city || state) {
      filteredJobs = jobs.filter(job => {
        if (city && job.family.address?.city?.toLowerCase() !== city.toLowerCase()) {
          return false;
        }
        if (state && job.family.address?.state?.toLowerCase() !== state.toLowerCase()) {
          return false;
        }
        return true;
      });
    }

    // Filter by budget if specified
    if (budgetMin || budgetMax) {
      const min = budgetMin ? parseFloat(budgetMin) : 0;
      const max = budgetMax ? parseFloat(budgetMax) : Infinity;

      filteredJobs = filteredJobs.filter(job => {
        const jobMax = Number(job.budgetMax);
        const jobMin = Number(job.budgetMin);
        // Check if there's any overlap between ranges
        return jobMax >= min && jobMin <= max;
      });
    }

    // Get nanny data for matching if user is a nanny
    let nannyProfile: NannyProfile | null = null;
    let nannySlug: string | null = null;
    let nannyCity: string | null = null;

    if (currentUser && currentUser.type === 'nanny') {
      const nanny = await prisma.nanny.findUnique({
        where: { id: currentUser.nanny.id },
        include: {
          address: true,
          availability: true,
        },
      });

      if (nanny) {
        nannySlug = nanny.slug;
        nannyCity = nanny.address?.city || null;

        // Get aggregated review data for the nanny
          const reviewStats = await prisma.review.aggregate({
            where: {
              nannyId: nanny.id,
              isPublished: true,
            },
            _avg: { overallRating: true },
            _count: { id: true },
          });

          // Parse availability slots from schedule if exists
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

        nannyProfile = {
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
          address: nanny.address ? {
            latitude: nanny.address.latitude,
            longitude: nanny.address.longitude,
          } : null,
          availabilitySlots,
        };
      }
    }

    // Calculate match scores and format response
    const jobsWithScores = filteredJobs.map(job => {
      let matchScore: number | null = null;
      let isEligible = true;

      // Check for active boost
      const hasActiveBoost = job.boosts && job.boosts.length > 0;

      // Check for job highlight (FAMILY_PLUS plan feature)
      const hasHighlight = job.family.subscription?.plan === 'FAMILY_PLUS' &&
                           job.family.subscription?.status === 'ACTIVE';

      if (nannyProfile) {
        const jobChildren = job.family.children
          .filter(cf => job.childrenIds.includes(cf.childId))
          .map(cf => cf.child);

        const jobData: JobData = {
          id: job.id,
          mandatoryRequirements: job.mandatoryRequirements,
          childrenIds: job.childrenIds,
        };

        // Build availability slots from neededDays and neededShifts
        let availabilitySlots: string[] | null = null;
        if (job.family.neededDays && job.family.neededShifts) {
          availabilitySlots = (job.family.neededDays as string[]).flatMap((day: string) =>
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
          availabilitySlots,
          address: job.family.address ? {
            latitude: job.family.address.latitude,
            longitude: job.family.address.longitude,
          } : null,
        };

        const childrenData: ChildData[] = jobChildren.map(c => ({
          id: c.id,
          birthDate: c.birthDate,
          expectedBirthDate: c.expectedBirthDate,
          unborn: c.unborn,
          hasSpecialNeeds: c.hasSpecialNeeds,
          specialNeedsDescription: c.specialNeedsDescription,
        }));

        const result = calculateMatchScore(
          jobData,
          familyData,
          childrenData,
          nannyProfile
        );

        matchScore = result.score;
        isEligible = result.isEligible;
      }

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        jobType: job.jobType,
        contractType: job.contractType,
        paymentType: job.paymentType,
        budgetMin: Number(job.budgetMin),
        budgetMax: Number(job.budgetMax),
        requiresOvernight: job.requiresOvernight,
        startDate: job.startDate,
        createdAt: job.createdAt,
        childrenCount: job.childrenIds.length,
        hasSpecialNeeds: job.family.children.some(cf =>
          job.childrenIds.includes(cf.childId) && cf.child.hasSpecialNeeds
        ),
        applicationsCount: job._count.applications,
        location: {
          city: job.family.address?.city || null,
          state: job.family.address?.state || null,
          neighborhood: job.family.address?.neighborhood || null,
        },
        hasActiveBoost,
        hasHighlight,
        matchScore,
        isEligible,
      };
    });

    // Sort by boost, highlight, match score, date
    jobsWithScores.sort((a, b) => {
      // 1. Active boost first
      if (a.hasActiveBoost !== b.hasActiveBoost) {
        return a.hasActiveBoost ? -1 : 1;
      }

      // 2. Job highlight (Trimestral feature)
      if (a.hasHighlight !== b.hasHighlight) {
        return a.hasHighlight ? -1 : 1;
      }

      // 3. For nanny users with matching data, use match score
      if (nannyProfile) {
        // Eligible jobs first
        if (a.isEligible !== b.isEligible) {
          return a.isEligible ? -1 : 1;
        }
        // Then by score
        if (a.matchScore !== null && b.matchScore !== null) {
          return b.matchScore - a.matchScore;
        }
        if (a.matchScore !== null) return -1;
        if (b.matchScore !== null) return 1;
      }

      // 4. Most recent first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Paginate
    const total = jobsWithScores.length;
    const offset = (page - 1) * limit;
    const paginatedJobs = jobsWithScores.slice(offset, offset + limit);

    // Get unique locations for filters
    const locations = await prisma.address.findMany({
      where: {
        families: {
          some: {
            jobs: {
              some: {
                status: 'ACTIVE',
                deletedAt: null,
              },
            },
          },
        },
      },
      select: {
        city: true,
        state: true,
      },
      distinct: ['city', 'state'],
    });

    const uniqueLocations = locations.reduce((acc, loc) => {
      if (loc.city && loc.state) {
        const key = `${loc.city}-${loc.state}`;
        if (!acc.find(l => `${l.city}-${l.state}` === key)) {
          acc.push({ city: loc.city, state: loc.state });
        }
      }
      return acc;
    }, [] as { city: string; state: string }[]);

    return NextResponse.json({
      success: true,
      jobs: paginatedJobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        locations: uniqueLocations,
        jobTypes: ['FIXED', 'SUBSTITUTE', 'OCCASIONAL'],
      },
      isNanny: !!nannyProfile,
      isFamily,
      nannySlug,
      nannyCity,
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: errorMessage },
      { status: 500 }
    );
  }
}
