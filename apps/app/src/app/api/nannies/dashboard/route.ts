import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import {
  calculateMatchScore,
  type NannyProfile,
  type JobData,
  type FamilyData,
  type ChildData,
} from '@/services/matching';

/**
 * GET /api/nannies/dashboard - Get nanny dashboard summary
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json(
        { error: 'Usuário não é uma babá' },
        { status: 400 }
      );
    }

    const nannyId = currentUser.nanny.id;

    // Get nanny data for matching
    const nanny = await prisma.nanny.findUnique({
      where: { id: nannyId },
      include: {
        address: true,
        availability: true,
      },
    });

    if (!nanny) {
      return NextResponse.json(
        { error: 'Babá não encontrada' },
        { status: 404 }
      );
    }

    // Get counts and data in parallel
    const [
      totalApplications,
      acceptedApplications,
      pendingApplications,
      rejectedApplications,
      recentApplications,
      activeJobs,
    ] = await Promise.all([
      // Count total applications
      prisma.jobApplication.count({
        where: { nannyId },
      }),

      // Count accepted applications
      prisma.jobApplication.count({
        where: { nannyId, status: 'ACCEPTED' },
      }),

      // Count pending applications
      prisma.jobApplication.count({
        where: { nannyId, status: 'PENDING' },
      }),

      // Count rejected applications
      prisma.jobApplication.count({
        where: { nannyId, status: 'REJECTED' },
      }),

      // Get recent applications with job info
      prisma.jobApplication.findMany({
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
                    select: {
                      city: true,
                      state: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),

      // Get active jobs for matching
      prisma.job.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          // Exclude jobs the nanny already applied to
          applications: {
            none: {
              nannyId,
            },
          },
        },
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
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Get aggregated review data for the nanny
    const reviewStats = await prisma.review.aggregate({
      where: {
        nannyId: nanny.id,
        isPublished: true,
      },
      _avg: { overallRating: true },
      _count: { id: true },
    });

    // Parse availability slots from nanny schedule if exists
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

    // Prepare nanny data for matching
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
        ? {
            latitude: nanny.address.latitude,
            longitude: nanny.address.longitude,
          }
        : null,
      availabilitySlots,
    };

    // Calculate match scores for active jobs
    const jobsWithScores = activeJobs.map((job) => {
      const jobChildren = job.family.children
        .filter((cf) => job.childrenIds.includes(cf.childId))
        .map((cf) => cf.child);

      const jobData: JobData = {
        id: job.id,
        mandatoryRequirements: job.mandatoryRequirements,
        childrenIds: job.childrenIds,
      };

      // Build availability slots from neededDays and neededShifts
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
          ? {
              latitude: job.family.address.latitude,
              longitude: job.family.address.longitude,
            }
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

      const result = calculateMatchScore(
        jobData,
        familyData,
        childrenData,
        nannyProfile
      );

      return {
        id: job.id,
        title: job.title,
        jobType: job.jobType,
        budgetMin: Number(job.budgetMin),
        budgetMax: Number(job.budgetMax),
        paymentType: job.paymentType,
        childrenCount: job.childrenIds.length,
        createdAt: job.createdAt,
        location: {
          city: job.family.address?.city || null,
          state: job.family.address?.state || null,
        },
        matchScore: result.score,
        isEligible: result.isEligible,
      };
    });

    // Sort by match score and filter eligible
    const sortedJobs = jobsWithScores
      .filter((j) => j.isEligible)
      .sort((a, b) => b.matchScore - a.matchScore);

    // Count compatible jobs (score > 70)
    const compatibleJobsCount = sortedJobs.filter(
      (j) => j.matchScore >= 70
    ).length;

    // Get top 5 recommended jobs
    const recommendedJobs = sortedJobs.slice(0, 5);

    return NextResponse.json({
      success: true,
      summary: {
        totalApplications,
        acceptedApplications,
        pendingApplications,
        rejectedApplications,
        compatibleJobs: compatibleJobsCount,
      },
      recentApplications: recentApplications.map((app) => ({
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
          city: app.job.family.address?.city,
          state: app.job.family.address?.state,
        },
      })),
      recommendedJobs: recommendedJobs.map((job) => ({
        id: job.id,
        title: job.title,
        jobType: job.jobType,
        budgetMin: job.budgetMin,
        budgetMax: job.budgetMax,
        paymentType: job.paymentType,
        childrenCount: job.childrenCount,
        createdAt: job.createdAt,
        city: job.location.city,
        state: job.location.state,
        matchScore: job.matchScore,
      })),
    });
  } catch (error) {
    console.error('Error fetching nanny dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
