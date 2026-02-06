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
import { getFirstName } from '@/utils/slug';

/**
 * Matching API Route
 *
 * POST /api/matching
 * Receives a jobId and returns the top 10 matching nannies
 */

interface MatchingRequest {
  jobId: number;
  limit?: number;
  minScore?: number;
}

interface NannyMatchResult {
  nanny: {
    id: number;
    name: string | null;
    slug: string | null;
    photoUrl: string | null;
    experienceYears: number | null;
    certifications: string[];
    hasSpecialNeedsExperience: boolean | null;
    city: string | null;
    state: string | null;
  };
  matchScore: number;
  breakdown: MatchResult['breakdown'];
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Parse request body
    const body: MatchingRequest = await request.json();
    const { jobId, limit = 10, minScore = 0 } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId é obrigatório' }, { status: 400 });
    }

    // Fetch job with family data
    const job = await prisma.job.findUnique({
      where: { id: jobId },
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
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    // Verify user has access to this job (is family owner)
    if (currentUser.type === 'family' && currentUser.family.id !== job.familyId) {
      return NextResponse.json({ error: 'Sem permissão para acessar esta vaga' }, { status: 403 });
    }

    // Fetch all active nannies with availability
    const nannies = await prisma.nanny.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        name: { not: null },
        slug: { not: null },
      },
      include: {
        address: true,
        availability: true,
      },
    });

    // Prepare job data for matching
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

    // Prepare family data for matching
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

    // Prepare children data for matching
    const childrenData: ChildData[] = job.family.children.map(cf => ({
      id: cf.child.id,
      birthDate: cf.child.birthDate,
      expectedBirthDate: cf.child.expectedBirthDate,
      unborn: cf.child.unborn,
      hasSpecialNeeds: cf.child.hasSpecialNeeds,
      specialNeedsDescription: cf.child.specialNeedsDescription,
    }));

    // Filter to only children included in the job
    const relevantChildren = job.childrenIds.length > 0
      ? childrenData.filter(c => job.childrenIds.includes(c.id))
      : childrenData;

    // Calculate match scores for each nanny
    const matchResults: NannyMatchResult[] = [];

    for (const nanny of nannies) {
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

      // Calculate match score
      const result = calculateMatchScore(
        jobData,
        familyData,
        relevantChildren,
        nannyProfile
      );

      // Only include eligible nannies with score above minimum
      if (result.isEligible && result.score > minScore) {
        matchResults.push({
          nanny: {
            id: nanny.id,
            name: nanny.name ? getFirstName(nanny.name) : null,
            slug: nanny.slug,
            photoUrl: nanny.photoUrl,
            experienceYears: nanny.experienceYears,
            certifications: nanny.certifications,
            hasSpecialNeedsExperience: nanny.hasSpecialNeedsExperience,
            city: nanny.address?.city || null,
            state: nanny.address?.state || null,
          },
          matchScore: result.score,
          breakdown: result.breakdown,
        });
      }
    }

    // Sort by match score (highest first) and limit results
    matchResults.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = matchResults.slice(0, limit);

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        jobType: job.jobType,
      },
      totalCandidates: nannies.length,
      eligibleCandidates: matchResults.length,
      matches: topMatches,
    });
  } catch (error) {
    console.error('Error in matching API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
