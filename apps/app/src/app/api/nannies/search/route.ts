import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import {
  calculateMatchScore,
  type NannyProfile,
  type JobData,
  type FamilyData,
  type ChildData,
} from '@/services/matching';
import { getFirstName } from '@/utils/slug';
import { getPlanFeatures, hasNannyPremium, hasMatching } from '@/services/subscription';

/**
 * GET /api/nannies/search - Search and list active nannies with optional matching
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user (optional for public listing)
    const currentUser = await getCurrentUser();

    // Get query params
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const minExperience = searchParams.get('minExperience');
    const certifications = searchParams.get('certifications');
    const hasSpecialNeedsExperience = searchParams.get('hasSpecialNeedsExperience');
    const jobType = searchParams.get('jobType');
    const jobId = searchParams.get('jobId'); // Optional: match against specific job
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
      deletedAt: null,
      name: { not: null }, // Only show nannies with name
      slug: { not: null }, // Only show nannies with slug
      isProfilePublic: true, // Only show public profiles
    };

    if (minExperience) {
      where.experienceYears = { gte: parseInt(minExperience, 10) };
    }

    if (hasSpecialNeedsExperience === 'true') {
      where.hasSpecialNeedsExperience = true;
    }

    if (certifications) {
      const certList = certifications.split(',');
      where.certifications = { hasSome: certList };
    }

    // Fetch nannies with related data
    const now = new Date();
    const nannies = await prisma.nanny.findMany({
      where,
      include: {
        address: true,
        availability: true,
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get active boosts for all nannies
    const nannyIds = nannies.map(n => n.id);
    const boostsData = await prisma.boost.findMany({
      where: {
        nannyId: { in: nannyIds },
        type: 'NANNY_PROFILE',
        isActive: true,
        endDate: { gte: now },
      },
    });
    const boostsByNannyId = boostsData.reduce((acc, boost) => {
      if (boost.nannyId) {
        acc[boost.nannyId] = acc[boost.nannyId] || [];
        acc[boost.nannyId].push(boost);
      }
      return acc;
    }, {} as Record<number, typeof boostsData>);

    // Filter by location if specified
    let filteredNannies = nannies;
    if (city || state) {
      filteredNannies = nannies.filter(nanny => {
        if (city && nanny.address?.city?.toLowerCase() !== city.toLowerCase()) {
          return false;
        }
        if (state && nanny.address?.state?.toLowerCase() !== state.toLowerCase()) {
          return false;
        }
        return true;
      });
    }

    // Filter by job type if specified
    if (jobType) {
      filteredNannies = filteredNannies.filter(nanny => {
        if (!nanny.availability) return false;
        return nanny.availability.jobTypes.includes(jobType as 'FIXED' | 'SUBSTITUTE' | 'OCCASIONAL');
      });
    }

    // Get family/job data for matching if user is a family with Plus plan
    let matchingData: {
      job: JobData;
      family: FamilyData;
      children: ChildData[];
    } | null = null;
    let canUseMatching = false;

    if (currentUser && currentUser.type === 'family') {
      // Check if family has matching feature (Plus plan)
      canUseMatching = await hasMatching({ familyId: currentUser.family.id });

      // Only calculate matching if family has Plus plan
      if (canUseMatching) {
        // Get family data
        const family = await prisma.family.findUnique({
          where: { id: currentUser.family.id },
          include: {
            address: true,
            children: {
              include: {
                child: true,
              },
            },
          },
        });

        if (family) {
          // If jobId is provided, use that specific job for matching
          let job = null;
          if (jobId) {
            job = await prisma.job.findUnique({
              where: { id: parseInt(jobId, 10) },
            });
          } else {
            // Get the most recent active job for matching
            job = await prisma.job.findFirst({
              where: {
                familyId: currentUser.family.id,
                status: 'ACTIVE',
              },
              orderBy: { createdAt: 'desc' },
            });
          }

          if (job) {
          const jobChildren = family.children
            .filter(cf => job.childrenIds.includes(cf.childId))
            .map(cf => cf.child);

            // Build availability slots from neededDays and neededShifts
            let availabilitySlots: string[] | null = null;
            if (family.neededDays && family.neededShifts) {
              availabilitySlots = (family.neededDays as string[]).flatMap((day: string) =>
                (family.neededShifts as string[]).map((shift: string) => `${day}_${shift}`)
              );
            }

            matchingData = {
              job: {
                id: job.id,
                mandatoryRequirements: job.mandatoryRequirements,
                childrenIds: job.childrenIds,
              },
              family: {
                id: family.id,
                hasPets: family.hasPets,
                numberOfChildren: family.numberOfChildren,
                nannyType: family.nannyType,
                contractRegime: family.contractRegime,
                hourlyRateRange: family.hourlyRateRange,
                domesticHelpExpected: family.domesticHelpExpected,
                availabilitySlots,
                address: family.address ? {
                  latitude: family.address.latitude,
                  longitude: family.address.longitude,
                } : null,
              },
              children: jobChildren.map(c => ({
                id: c.id,
                birthDate: c.birthDate,
                expectedBirthDate: c.expectedBirthDate,
                unborn: c.unborn,
                hasSpecialNeeds: c.hasSpecialNeeds,
                specialNeedsDescription: c.specialNeedsDescription,
              })),
            };
          }
        }
      }
    }

    // Calculate match scores and format response
    const nanniesWithScores = await Promise.all(filteredNannies.map(async (nanny) => {
      let matchScore: number | null = null;
      let isEligible = true;

      // Check if nanny has premium/verified status
      const hasPremium = await hasNannyPremium({ nannyId: nanny.id });

      const isVerified = nanny.documentValidated && nanny.personalDataValidated;

      // Check for active boost
      const nannyBoosts = boostsByNannyId[nanny.id] || [];
      const hasActiveBoost = nannyBoosts.length > 0;

      // Check for profile highlight (Premium feature)
      const planFeatures = await getPlanFeatures({ nannyId: nanny.id });
      const hasHighlight = planFeatures?.profileHighlight === true && hasPremium;

      if (matchingData) {
        // Parse availability slots from nanny schedule if exists
        let nannyAvailabilitySlots: string[] | null = null;
        if (nanny.availability?.schedule) {
          const schedule = nanny.availability.schedule as Record<string, { enabled: boolean; periods?: string[] }>;
          nannyAvailabilitySlots = [];
          for (const [day, data] of Object.entries(schedule)) {
            if (data.enabled && data.periods) {
              for (const period of data.periods) {
                nannyAvailabilitySlots.push(`${day.toUpperCase()}_${period.toUpperCase()}`);
              }
            }
          }
        }

        // Get aggregated review data for the nanny (we need to do this per nanny)
        const reviewStats = await prisma.review.aggregate({
          where: {
            nannyId: nanny.id,
            isPublished: true,
          },
          _avg: { overallRating: true },
          _count: { id: true },
        });

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
          address: nanny.address ? {
            latitude: nanny.address.latitude,
            longitude: nanny.address.longitude,
          } : null,
          availabilitySlots: nannyAvailabilitySlots,
        };

        const result = calculateMatchScore(
          matchingData.job,
          matchingData.family,
          matchingData.children,
          nannyProfile
        );

        matchScore = result.score;
        isEligible = result.isEligible;
      }

      return {
        id: nanny.id,
        name: nanny.name ? getFirstName(nanny.name) : '',
        slug: nanny.slug,
        photoUrl: nanny.photoUrl,
        experienceYears: nanny.experienceYears,
        certifications: nanny.certifications,
        hasSpecialNeedsExperience: nanny.hasSpecialNeedsExperience,
        ageRangesExperience: nanny.ageRangesExperience,
        strengths: nanny.strengths,
        hasCnh: nanny.hasCnh,
        location: {
          city: nanny.address?.city || null,
          state: nanny.address?.state || null,
          neighborhood: nanny.address?.neighborhood || null,
        },
        availability: nanny.availability ? {
          jobTypes: nanny.availability.jobTypes,
          monthlyRate: nanny.availability.monthlyRate ? Number(nanny.availability.monthlyRate) : null,
          hourlyRate: nanny.availability.hourlyRate ? Number(nanny.availability.hourlyRate) : null,
          dailyRate: nanny.availability.dailyRate ? Number(nanny.availability.dailyRate) : null,
        } : null,
        hasPremium,
        isVerified,
        hasActiveBoost,
        hasHighlight,
        matchScore,
        isEligible,
      };
    }));

    // Sort by boost, highlight, match score, premium, verified
    nanniesWithScores.sort((a, b) => {
      // 1. Active boost first
      if (a.hasActiveBoost !== b.hasActiveBoost) {
        return a.hasActiveBoost ? -1 : 1;
      }

      // 2. Profile highlight (Premium feature)
      if (a.hasHighlight !== b.hasHighlight) {
        return a.hasHighlight ? -1 : 1;
      }

      // 3. For family users with matching data, use match score
      if (matchingData) {
        // Eligible first
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

      // 4. Premium status
      if (a.hasPremium !== b.hasPremium) {
        return a.hasPremium ? -1 : 1;
      }

      // 5. Verified status
      if (a.isVerified !== b.isVerified) {
        return a.isVerified ? -1 : 1;
      }

      return 0;
    });

    // Paginate
    const total = nanniesWithScores.length;
    const offset = (page - 1) * limit;
    const paginatedNannies = nanniesWithScores.slice(offset, offset + limit);

    // Get unique locations for filters
    const locations = await prisma.address.findMany({
      where: {
        nannies: {
          some: {
            status: 'ACTIVE',
            deletedAt: null,
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

    // Get available certifications
    const allCertifications = [
      'FIRST_AID',
      'CPR',
      'CHILD_DEVELOPMENT',
      'EARLY_EDUCATION',
      'NUTRITION',
      'SPECIAL_NEEDS',
      'MONTESSORI',
      'NURSING',
    ];

    return NextResponse.json({
      success: true,
      nannies: paginatedNannies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        locations: uniqueLocations,
        certifications: allCertifications,
        experienceRanges: [
          { value: '0', label: 'Qualquer experiência' },
          { value: '1', label: '1+ ano' },
          { value: '3', label: '3+ anos' },
          { value: '5', label: '5+ anos' },
          { value: '10', label: '10+ anos' },
        ],
      },
      isFamily: currentUser?.type === 'family',
      hasActiveJob: !!matchingData,
      hasMatchingFeature: canUseMatching,
    });
  } catch (error) {
    console.error('Error searching nannies:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
