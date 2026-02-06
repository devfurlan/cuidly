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
import {
  canViewProfile,
  registerProfileView,
  getProfileViewUsage,
  getPlanFeatures,
  hasNannyPremium,
} from '@/services/subscription';
import { getFirstName } from '@/utils/slug';

/**
 * GET /api/nannies/[slug] - Get nanny profile details
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Authenticate user (optional)
    const currentUser = await getCurrentUser();

    // Fetch nanny by slug
    const now = new Date();
    const nanny = await prisma.nanny.findUnique({
      where: { slug },
      include: {
        address: true,
        availability: true,
        references: {
          where: { verified: true },
          select: {
            id: true,
            name: true,
            relationship: true,
            verified: true,
          },
        },
        subscription: true,
      },
    });

    // Check for active boosts separately
    const activeBoosts = nanny ? await prisma.boost.findMany({
      where: {
        nannyId: nanny.id,
        type: 'NANNY_PROFILE',
        isActive: true,
        endDate: { gte: now },
      },
    }) : [];

    if (!nanny || nanny.status !== 'ACTIVE' || nanny.deletedAt) {
      return NextResponse.json({ error: 'Babá não encontrada' }, { status: 404 });
    }

    // Check profile view limit for authenticated users
    let profileViewStatus: {
      canView: boolean;
      reason?: string;
      viewsUsed: number;
      viewLimit: number;
      alreadyViewed: boolean;
    } | null = null;

    if (currentUser) {
      const lookup = currentUser.type === 'nanny'
        ? { nannyId: currentUser.nanny.id }
        : { familyId: currentUser.family.id };
      profileViewStatus = await canViewProfile(lookup, nanny.id);

      if (!profileViewStatus.canView) {
        // User has reached view limit
        const usage = await getProfileViewUsage(lookup);
        return NextResponse.json({
          success: false,
          error: 'LIMIT_REACHED',
          message: profileViewStatus.reason,
          viewsUsed: usage.viewsUsed,
          viewLimit: usage.viewLimit,
          remainingViews: usage.remainingViews,
          isUnlimited: usage.isUnlimited,
        }, { status: 403 });
      }
    }

    // Check premium and verified status
    const hasPremium = await hasNannyPremium({ nannyId: nanny.id });

    const isVerified = nanny.documentValidated && nanny.personalDataValidated;

    // Check for active boost
    const hasActiveBoost = activeBoosts.length > 0;

    // Check for profile highlight (Premium feature)
    const planFeatures = await getPlanFeatures({ nannyId: nanny.id });
    const hasHighlight = planFeatures?.profileHighlight === true && hasPremium;

    // Get user data and check if family
    let matchResult: MatchResult | null = null;
    let hasActiveSubscription = false;
    let canContact = false;

    if (currentUser && currentUser.type === 'family') {
      const family = await prisma.family.findUnique({
        where: { id: currentUser.family.id },
        include: {
          address: true,
          children: {
            include: {
              child: true,
            },
          },
          subscription: true,
        },
      });

      if (family) {
        // Check subscription
        hasActiveSubscription = family.subscription != null &&
          family.subscription.status === 'ACTIVE' &&
          new Date(family.subscription.currentPeriodEnd) > new Date();

        canContact = hasActiveSubscription;

        // Get most recent active job for matching
        const job = await prisma.job.findFirst({
          where: {
            familyId: currentUser.family.id,
            status: 'ACTIVE',
          },
          orderBy: { createdAt: 'desc' },
        });

        if (job && family) {
          const jobChildren = family.children
            .filter(cf => job.childrenIds.includes(cf.childId))
            .map(cf => cf.child);

          const jobData: JobData = {
            id: job.id,
            mandatoryRequirements: job.mandatoryRequirements,
            childrenIds: job.childrenIds,
          };

          // Build availability slots from neededDays and neededShifts
          let availabilitySlots: string[] | null = null;
          if (family.neededDays && family.neededShifts) {
            availabilitySlots = (family.neededDays as string[]).flatMap((day: string) =>
              (family.neededShifts as string[]).map((shift: string) => `${day}_${shift}`)
            );
          }

          const familyData: FamilyData = {
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
          };

          const childrenData: ChildData[] = jobChildren.map(c => ({
            id: c.id,
            birthDate: c.birthDate,
            expectedBirthDate: c.expectedBirthDate,
            unborn: c.unborn,
            hasSpecialNeeds: c.hasSpecialNeeds,
            specialNeedsDescription: c.specialNeedsDescription,
          }));

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

          const nannyProfileData: NannyProfile = {
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

          matchResult = calculateMatchScore(
            jobData,
            familyData,
            childrenData,
            nannyProfileData
          );
        }
      }
    }

    // Calculate age from birthDate
    let age: number | null = null;
    if (nanny.birthDate) {
      const birthDate = new Date(nanny.birthDate);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Build response
    const response = {
      success: true,
      nanny: {
        id: nanny.id,
        authId: nanny.authId, // Auth ID for chat
        name: nanny.name ? getFirstName(nanny.name) : '',
        slug: nanny.slug,
        photoUrl: nanny.photoUrl,
        age,
        gender: nanny.gender,
        experienceYears: nanny.experienceYears,
        aboutMe: nanny.aboutMe,
        isSmoker: nanny.isSmoker,
        hasCnh: nanny.hasCnh,
        location: {
          city: nanny.address?.city || null,
          state: nanny.address?.state || null,
          neighborhood: nanny.address?.neighborhood || null,
        },
        // Contact info (only when canContact is true)
        phone: canContact ? nanny.phoneNumber : null,
        email: canContact ? nanny.emailAddress : null,
        // Experience
        ageRangesExperience: nanny.ageRangesExperience,
        hasSpecialNeedsExperience: nanny.hasSpecialNeedsExperience,
        specialNeedsExperienceDescription: nanny.specialNeedsExperienceDescription,
        specialNeedsSpecialties: nanny.specialNeedsSpecialties || [],
        certifications: nanny.certifications,
        languages: nanny.languages,
        // Preferences
        childTypePreference: nanny.childTypePreference,
        strengths: nanny.strengths,
        careMethodology: nanny.careMethodology,
        comfortableWithPets: nanny.comfortableWithPets,
        petsDescription: nanny.petsDescription,
        acceptedActivities: nanny.acceptedActivities,
        parentPresencePreference: nanny.parentPresencePreference,
        // Availability
        availability: nanny.availability ? {
          jobTypes: nanny.availability.jobTypes,
          schedule: nanny.availability.schedule,
          monthlyRate: nanny.availability.monthlyRate ? Number(nanny.availability.monthlyRate) : null,
          hourlyRate: nanny.availability.hourlyRate ? Number(nanny.availability.hourlyRate) : null,
          dailyRate: nanny.availability.dailyRate ? Number(nanny.availability.dailyRate) : null,
          preferredContractTypes: nanny.availability.preferredContractTypes,
        } : null,
        // Status
        hasPremium,
        isVerified,
        hasActiveBoost,
        hasHighlight,
        // References (only verified ones)
        references: nanny.references,
      },
      // Family-specific data
      matchResult: matchResult ? {
        score: matchResult.score,
        isEligible: matchResult.isEligible,
        eliminationReasons: matchResult.eliminationReasons,
        breakdown: matchResult.breakdown,
      } : null,
      canContact,
      hasActiveSubscription,
    };

    // Track profile view and register for limit counting
    if (currentUser) {
      const lookup = currentUser.type === 'nanny'
        ? { nannyId: currentUser.nanny.id }
        : { familyId: currentUser.family.id };

      // Register unique view for limit tracking
      const isNewView = await registerProfileView(lookup, nanny.id);

      // Track analytics (async, don't wait)
      prisma.profileAnalytics.create({
        data: {
          nannyId: nanny.id,
          actionType: 'VIEW',
        },
      }).catch(() => {});

      // Get updated usage after potential new view
      const usage = await getProfileViewUsage(lookup);

      return NextResponse.json({
        ...response,
        profileViewUsage: {
          viewsUsed: usage.viewsUsed,
          viewLimit: usage.viewLimit,
          remainingViews: usage.remainingViews,
          isUnlimited: usage.isUnlimited,
          isNewView,
        },
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching nanny:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
