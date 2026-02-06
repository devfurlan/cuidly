/**
 * Get Nanny by Slug API
 * GET /api/nannies/slug/[slug]
 *
 * Returns public nanny profile by slug
 * Also tracks anonymous profile views
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getFirstName } from '@/utils/slug';
import { calculateAge } from '@cuidly/shared';
import { calculateNannySeal } from '@/lib/seals';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug e obrigatorio' },
        { status: 400 }
      );
    }

    // Find nanny by slug with all public data
    const now = new Date();
    const nanny = await prisma.nanny.findUnique({
      where: {
        slug,
        status: 'ACTIVE',
        deletedAt: null,
        isProfilePublic: true,
      },
      include: {
        address: {
          select: {
            city: true,
            state: true,
            neighborhood: true,
            streetName: true,
            zipCode: true,
          },
        },
        documents: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            id: true,
            documentType: true,
            institutionName: true,
            certificateType: true,
            validationStatus: true,
          },
        },
        references: {
          where: { verified: true },
          select: {
            id: true,
            name: true,
            relationship: true,
            verified: true,
          },
        },
        reviews: {
          where: {
            isPublished: true,
            isVisible: true,
            type: 'FAMILY_TO_NANNY',
          },
          select: {
            id: true,
            overallRating: true,
            comment: true,
            createdAt: true,
            family: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        subscription: true,
      },
    });

    // Get active boosts separately
    const boosts = nanny ? await prisma.boost.findMany({
      where: {
        nannyId: nanny.id,
        type: 'NANNY_PROFILE',
        isActive: true,
        endDate: { gte: now },
      },
    }) : [];

    if (!nanny) {
      return NextResponse.json(
        { error: 'Nanny not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const specialties = nanny.specialtiesJson
      ? (nanny.specialtiesJson as string[])
      : [];
    const availability = nanny.availabilityJson
      ? (nanny.availabilityJson as string[])
      : [];
    const serviceTypes = nanny.serviceTypesJson
      ? (nanny.serviceTypesJson as string[])
      : [];
    const attendanceModes = nanny.attendanceModesJson
      ? (nanny.attendanceModesJson as string[])
      : [];
    const skills = nanny.skillsJson
      ? (nanny.skillsJson as string[])
      : [];

    // Calculate age from birth date
    const age = nanny.birthDate ? calculateAge(new Date(nanny.birthDate)) : null;

    // Extract first name only (privacy - don't expose full name publicly)
    const firstName = nanny.name ? getFirstName(nanny.name) : null;

    // Check premium and verified status
    const hasPremium = nanny.subscription &&
      nanny.subscription.status === 'ACTIVE' &&
      new Date(nanny.subscription.currentPeriodEnd) > now;

    const isVerified = nanny.documentValidated && nanny.personalDataValidated;
    const hasActiveBoost = boosts.length > 0;

    // Calculate nanny seal (Identificada, Verificada, Confiável)
    const publishedReviewCount = nanny.reviews.length;
    const sealResult = calculateNannySeal(
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
      hasPremium ?? false,
      publishedReviewCount
    );

    // Calculate average rating
    const totalReviews = nanny.reviews.length;
    const averageRating = totalReviews > 0
      ? nanny.reviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews
      : null;

    // Process reviews for public view (hide full family names)
    const publicReviews = nanny.reviews.map(review => ({
      id: review.id,
      rating: review.overallRating,
      comment: review.comment,
      createdAt: review.createdAt,
      // Show only first name and initial of family
      familyName: review.family.name
        ? `${review.family.name.split(' ')[0]} ${review.family.name.split(' ')[1]?.charAt(0) || ''}.`
        : 'Família',
    }));

    // Process documents to show verification status
    const verifications = {
      hasIdDocument: nanny.documents.some(d =>
        (d.documentType === 'RG' || d.documentType === 'CPF' || d.documentType === 'CNH') &&
        d.validationStatus === 'VERIFIED'
      ),
      hasCertificates: nanny.documents.filter(d => d.documentType === 'CERTIFICATE').length,
      hasReferenceLetters: nanny.documents.filter(d => d.documentType === 'REFERENCE_LETTER').length,
      hasCriminalRecord: nanny.documents.some(d =>
        d.documentType === 'CRIMINAL_RECORD' && d.validationStatus === 'VERIFIED'
      ),
      documentValidated: nanny.documentValidated,
      documentExpirationDate: nanny.documentExpirationDate,
      criminalBackgroundValidated: nanny.criminalBackgroundValidated,
      personalDataValidated: nanny.personalDataValidated,
      emailVerified: nanny.emailVerified ?? false,
    };

    // Return public profile data (no sensitive information like phone, full address)
    const publicProfile = {
      id: nanny.id,
      userId: nanny.authId, // Auth ID for chat functionality
      lastActiveAt: nanny.updatedAt || null, // Last time the nanny was active
      firstName,
      age,
      slug: nanny.slug,
      photoUrl: nanny.photoUrl,
      aboutMe: nanny.aboutMe, // Include full bio for logged-in users to show preview
      gender: nanny.gender,
      specialties,
      experienceYears: nanny.experienceYears,
      hourlyRate: nanny.hourlyRate ? Number(nanny.hourlyRate) : null,
      minChildAge: nanny.minChildAge,
      maxChildAge: nanny.maxChildAge,
      availability,
      serviceTypes,
      attendanceModes,
      skills,
      childAgeExperiences: nanny.ageRangesExperience || [],
      // Additional fields for improved profile
      isSmoker: nanny.isSmoker,
      hasCnh: nanny.hasCnh,
      hasSpecialNeedsExperience: nanny.hasSpecialNeedsExperience,
      specialNeedsExperienceDescription: nanny.specialNeedsExperienceDescription,
      specialNeedsSpecialties: nanny.specialNeedsSpecialties || [],
      certifications: nanny.certifications || [],
      languages: nanny.languages,
      strengths: nanny.strengths || [],
      careMethodology: nanny.careMethodology,
      comfortableWithPets: nanny.comfortableWithPets,
      parentPresencePreference: nanny.parentPresencePreference,
      acceptedActivities: nanny.acceptedActivities || [],
      // Work conditions
      nannyTypes: nanny.nannyTypes || [],
      contractRegimes: nanny.contractRegimes || [],
      hourlyRateRange: nanny.hourlyRateRange,
      acceptsHolidayWork: nanny.acceptsHolidayWork,
      maxChildrenCare: nanny.maxChildrenCare,
      maxTravelDistance: nanny.maxTravelDistance,
      // Address (city only, no street for privacy)
      address: nanny.address
        ? {
            city: nanny.address.city,
            state: nanny.address.state,
            neighborhood: nanny.address.neighborhood,
          }
        : null,
      // Verification and trust signals
      verifications,
      isVerified,
      hasPremium,
      hasActiveBoost,
      // Seal (Básico, Verificado, Confiável)
      seal: sealResult.seal,
      sealRequirements: sealResult.requirements,
      // Reviews summary
      reviews: {
        average: averageRating,
        total: totalReviews,
        items: publicReviews.slice(0, 3), // Only show first 3 reviews publicly
      },
      // References count (details hidden for non-paying)
      referencesCount: nanny.references.length,
      // Legacy document format for compatibility
      documents: nanny.documents.map(d => ({
        type: d.documentType,
        verified: d.validationStatus === 'VERIFIED',
      })),
    };

    // Track anonymous view (async, don't wait)
    const visitorId = request.headers.get('x-visitor-id') ||
                      request.cookies.get('visitor_id')?.value;

    if (visitorId) {
      prisma.userProfileView.create({
        data: {
          visitorId,
          nannyId: nanny.id,
          viewerType: 'ANONYMOUS',
          hasPaidPlan: false,
        },
      }).catch(() => {}); // Ignore errors
    }

    // Track analytics
    prisma.profileAnalytics.create({
      data: {
        nannyId: nanny.id,
        actionType: 'VIEW',
      },
    }).catch(() => {});

    return NextResponse.json(publicProfile);
  } catch (error) {
    console.error('Error fetching nanny by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
