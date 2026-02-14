import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateNannySeal } from '@/lib/seals';
import { getFirstName } from '@/utils/slug';

export const dynamic = 'force-dynamic';

/**
 * GET /api/nannies/preview - Get a preview of active nannies for the homepage
 * Returns limited public information for non-authenticated users
 */
export async function GET() {
  try {
    const nannies = await prisma.nanny.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        isProfilePublic: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        photoUrl: true,
        birthDate: true,
        experienceYears: true,
        aboutMe: true,
        specialtiesJson: true,
        certifications: true,
        // Fields for seal calculation - Profile completeness
        cpf: true,
        gender: true,
        ageRangesExperience: true,
        strengths: true,
        acceptedActivities: true,
        nannyTypes: true,
        contractRegimes: true,
        hourlyRateRange: true,
        maxChildrenCare: true,
        maxTravelDistance: true,
        availabilityJson: true,
        // Fields for seal calculation - Verification
        documentValidated: true,
        documentExpirationDate: true,
        personalDataValidated: true,
        criminalBackgroundValidated: true,
        emailAddress: true,
        emailVerified: true,
        subscription: {
          select: {
            plan: true,
            status: true,
          },
        },
        address: {
          select: {
            city: true,
            state: true,
            neighborhood: true,
            streetName: true,
            zipCode: true,
            latitude: true,
            longitude: true,
          },
        },
        reviews: {
          where: {
            isPublished: true,
            isVisible: true,
          },
          select: {
            overallRating: true,
          },
        },
        availability: {
          select: {
            jobTypes: true,
            schedulePreference: true,
          },
        },
      },
      take: 6,
      orderBy: [
        { personalDataValidated: 'desc' },
        { documentValidated: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Calculate age and average rating for each nanny
    const nanniesWithDetails = nannies.map((nanny) => {
      const age = nanny.birthDate
        ? Math.floor(
            (Date.now() - new Date(nanny.birthDate).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : null;

      const reviews = nanny.reviews || [];
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
          : null;

      // Calculate seal
      const hasProSubscription = nanny.subscription?.plan === 'NANNY_PRO' &&
        (nanny.subscription?.status === 'ACTIVE' || nanny.subscription?.status === 'TRIALING');

      const { seal } = calculateNannySeal(
        {
          // Informações
          name: nanny.name,
          cpf: nanny.cpf,
          birthDate: nanny.birthDate,
          gender: nanny.gender,
          photoUrl: nanny.photoUrl,
          address: nanny.address,
          aboutMe: nanny.aboutMe,
          // Experiência
          experienceYears: nanny.experienceYears,
          ageRangesExperience: nanny.ageRangesExperience,
          strengths: nanny.strengths,
          acceptedActivities: nanny.acceptedActivities,
          // Trabalho
          nannyTypes: nanny.nannyTypes,
          contractRegimes: nanny.contractRegimes,
          hourlyRateRange: nanny.hourlyRateRange,
          maxChildrenCare: nanny.maxChildrenCare,
          maxTravelDistance: nanny.maxTravelDistance,
          // Disponibilidade
          availabilityJson: nanny.availabilityJson,
          // Verificações
          emailVerified: nanny.emailVerified ?? false,
          documentValidated: nanny.documentValidated,
          documentExpirationDate: nanny.documentExpirationDate,
          personalDataValidated: nanny.personalDataValidated,
          criminalBackgroundValidated: nanny.criminalBackgroundValidated,
        },
        hasProSubscription,
        reviews.length
      );

      return {
        id: nanny.id,
        name: nanny.name ? getFirstName(nanny.name) : '',
        slug: nanny.slug,
        photoUrl: nanny.photoUrl,
        age,
        experienceYears: nanny.experienceYears,
        city: nanny.address?.city || null,
        state: nanny.address?.state || null,
        latitude: nanny.address?.latitude || null,
        longitude: nanny.address?.longitude || null,
        seal,
        averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
        reviewCount: reviews.length,
        // Blurred content (will be shown with blur in frontend)
        aboutMe: nanny.aboutMe,
        specialties: nanny.specialtiesJson as string[] | null,
        certifications: nanny.certifications,
        availability: nanny.availability
          ? {
              jobTypes: nanny.availability.jobTypes,
              schedulePreference: nanny.availability.schedulePreference,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      nannies: nanniesWithDetails,
    });
  } catch (error) {
    console.error('Error fetching nanny preview:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
