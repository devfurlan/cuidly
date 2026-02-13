import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import {
  calculateMatchScore,
  type NannyProfile,
  type JobData,
  type FamilyData,
  type ChildData,
  type MatchResult,
} from '@/services/matching';

/**
 * Match Score API for Family viewing a Nanny profile
 *
 * GET /api/nannies/slug/[slug]/match?jobId=123
 * Returns the match score between the logged-in family and the nanny
 * If jobId is provided, matches against that specific job's requirements
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const jobIdParam = searchParams.get('jobId');

    if (!slug) {
      return NextResponse.json({ error: 'Slug é obrigatório' }, { status: 400 });
    }

    // Authenticate user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Only families can see match scores
    if (currentUser.type !== 'family') {
      return NextResponse.json(
        { error: 'Apenas famílias podem ver a pontuação de match' },
        { status: 403 }
      );
    }

    // Get family data with relationships
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

    if (!family) {
      return NextResponse.json({ error: 'Família não encontrada' }, { status: 404 });
    }

    // Check if family has active PAID subscription (not FREE plan)
    const hasActiveSubscription = currentUser.family.subscription?.status === 'ACTIVE' &&
      currentUser.family.subscription.plan !== 'FAMILY_FREE' &&
      (!currentUser.family.subscription.currentPeriodEnd ||
       new Date(currentUser.family.subscription.currentPeriodEnd) > new Date());

    // Check if family has completed onboarding with minimum required data
    if (!family.nannyType || !family.contractRegime) {
      return NextResponse.json(
        {
          error: 'Complete seu perfil para ver o match',
          code: 'INCOMPLETE_PROFILE',
        },
        { status: 400 }
      );
    }

    // Find the nanny by slug
    const nanny = await prisma.nanny.findUnique({
      where: {
        slug,
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        address: true,
        availability: true,
      },
    });

    if (!nanny) {
      return NextResponse.json({ error: 'Babá não encontrada' }, { status: 404 });
    }

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

    // Get aggregated review data for the nanny
    const reviewStats = await prisma.review.aggregate({
      where: {
        nannyId: nanny.id,
        isPublished: true,
      },
      _avg: { overallRating: true },
      _count: { id: true },
    });

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
      address: nanny.address ? {
        latitude: nanny.address.latitude,
        longitude: nanny.address.longitude,
      } : null,
      availabilitySlots: nannyAvailabilitySlots,
    };

    // Build availability slots from family neededDays and neededShifts
    let familyAvailabilitySlots: string[] | null = null;
    if (family.neededDays && family.neededShifts) {
      familyAvailabilitySlots = (family.neededDays as string[]).flatMap((day: string) =>
        (family.neededShifts as string[]).map((shift: string) => `${day}_${shift}`)
      );
    }

    // Prepare family data for matching
    const familyData: FamilyData = {
      id: family.id,
      hasPets: family.hasPets,
      numberOfChildren: family.numberOfChildren,
      nannyType: family.nannyType,
      contractRegime: family.contractRegime,
      hourlyRateRange: family.hourlyRateRange,
      domesticHelpExpected: family.domesticHelpExpected,
      availabilitySlots: familyAvailabilitySlots,
      address: family.address ? {
        latitude: family.address.latitude,
        longitude: family.address.longitude,
      } : null,
    };

    // Prepare children data for matching
    const allChildrenData: ChildData[] = family.children.map(cf => ({
      id: cf.child.id,
      birthDate: cf.child.birthDate,
      expectedBirthDate: cf.child.expectedBirthDate,
      unborn: cf.child.unborn,
      hasSpecialNeeds: cf.child.hasSpecialNeeds,
      specialNeedsDescription: cf.child.specialNeedsDescription,
    }));

    // If jobId provided, use that job's data; otherwise use family profile
    let jobData: JobData;
    let childrenData: ChildData[];

    if (jobIdParam) {
      const job = await prisma.job.findUnique({
        where: { id: parseInt(jobIdParam, 10) },
      });

      if (job && job.familyId === family.id) {
        jobData = {
          id: job.id,
          mandatoryRequirements: job.mandatoryRequirements,
          childrenIds: job.childrenIds,
        };
        childrenData = allChildrenData.filter(c => job.childrenIds.includes(c.id));
      } else {
        // Job not found or doesn't belong to family — fall back to profile
        jobData = {
          id: 0,
          mandatoryRequirements: [],
          childrenIds: allChildrenData.map(c => c.id),
        };
        childrenData = allChildrenData;
      }
    } else {
      jobData = {
        id: 0,
        mandatoryRequirements: [],
        childrenIds: allChildrenData.map(c => c.id),
      };
      childrenData = allChildrenData;
    }

    // Calculate match score
    const result: MatchResult = calculateMatchScore(
      jobData,
      familyData,
      childrenData,
      nannyProfile
    );

    return NextResponse.json({
      success: true,
      hasActiveSubscription,
      matchResult: {
        score: result.score,
        isEligible: result.isEligible,
        eliminationReasons: result.eliminationReasons,
        breakdown: result.breakdown,
      },
    });
  } catch (error) {
    console.error('Error calculating match score:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
