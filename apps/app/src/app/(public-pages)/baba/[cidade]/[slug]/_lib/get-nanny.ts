/**
 * Server-side data fetching for nanny profile
 * Uses React cache for request deduplication
 */

import { cache } from 'react';
import prisma from '@/lib/prisma';
import { getFirstName } from '@/utils/slug';
import { calculateAge } from '@cuidly/shared';
import { calculateNannySeal, type NannySeal } from '@/lib/seals';

// Types for the public nanny profile
export interface NannyProfileData {
  id: number;
  userId: string | null;
  lastActiveAt: Date | null;
  firstName: string | null;
  age: number | null;
  slug: string;
  photoUrl: string | null;
  aboutMe: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  specialties: string[];
  experienceYears: number | null;
  availability: string[];
  serviceTypes: string[];
  attendanceModes: string[];
  childAgeExperiences: string[];
  hourlyRate: number | null;
  isSmoker?: boolean | null;
  hasCnh?: boolean | null;
  hasSpecialNeedsExperience?: boolean | null;
  specialNeedsExperienceDescription?: string | null;
  specialNeedsSpecialties?: string[];
  certifications?: string[];
  languages?: string[] | { language: string; level: string }[] | null;
  strengths?: string[];
  careMethodology?: string | null;
  comfortableWithPets?: string | null;
  parentPresencePreference?: string | null;
  acceptedActivities?: string[];
  nannyTypes?: string[];
  contractRegimes?: string[];
  hourlyRateRange?: string | null;
  acceptsHolidayWork?: string | null;
  maxChildrenCare?: number | null;
  maxTravelDistance?: string | null;
  address: {
    city: string;
    state: string;
    neighborhood: string | null;
  } | null;
  verifications?: {
    hasIdDocument: boolean;
    hasCertificates: number;
    hasReferenceLetters: number;
    hasCriminalRecord: boolean;
    documentValidated: boolean;
    documentExpirationDate: Date | null;
    criminalBackgroundValidated: boolean;
    personalDataValidated: boolean;
    emailVerified: boolean;
  };
  isVerified?: boolean;
  hasPremium?: boolean;
  hasActiveBoost?: boolean;
  seal?: NannySeal | null;
  sealRequirements?: {
    basico: { met: boolean; missing: string[] };
    verificado: { met: boolean; missing: string[] };
    confiavel: { met: boolean; missing: string[] };
  };
  reviews?: {
    average: number | null;
    total: number;
    items: {
      id: number;
      rating: number;
      comment: string | null;
      createdAt: Date;
      familyName: string;
    }[];
  };
  referencesCount?: number;
  documents: { type: string; verified: boolean }[];
}

/**
 * Fetches nanny profile by slug with React cache for deduplication
 * This is cached per request, meaning multiple calls in the same render
 * will only hit the database once
 */
export const getNannyBySlug = cache(async (slug: string): Promise<NannyProfileData | null> => {
  try {
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

    if (!nanny) {
      return null;
    }

    // Get active boosts
    const boosts = await prisma.boost.findMany({
      where: {
        nannyId: nanny.id,
        type: 'NANNY_PROFILE',
        isActive: true,
        endDate: { gte: now },
      },
    });

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

    // Calculate age from birth date
    const age = nanny.birthDate ? calculateAge(new Date(nanny.birthDate)) : null;

    // Extract first name only (privacy)
    const firstName = nanny.name ? getFirstName(nanny.name) : null;

    // Check premium and verified status
    const hasPremium = nanny.subscription &&
      nanny.subscription.status === 'ACTIVE' &&
      new Date(nanny.subscription.currentPeriodEnd) > now;

    const isVerified = nanny.documentValidated && nanny.personalDataValidated;
    const hasActiveBoost = boosts.length > 0;

    // Calculate nanny seal
    const publishedReviewCount = nanny.reviews.length;
    const sealResult = calculateNannySeal(
      {
        name: nanny.name,
        cpf: nanny.cpf,
        birthDate: nanny.birthDate,
        gender: nanny.gender,
        photoUrl: nanny.photoUrl,
        address: nanny.address,
        aboutMe: nanny.aboutMe,
        experienceYears: nanny.experienceYears,
        ageRangesExperience: nanny.ageRangesExperience,
        strengths: nanny.strengths,
        acceptedActivities: nanny.acceptedActivities,
        nannyTypes: nanny.nannyTypes,
        contractRegimes: nanny.contractRegimes,
        hourlyRateRange: nanny.hourlyRateRange,
        maxChildrenCare: nanny.maxChildrenCare,
        maxTravelDistance: nanny.maxTravelDistance,
        availabilityJson: nanny.availabilityJson,
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

    // Process reviews for public view
    const publicReviews = nanny.reviews.map(review => ({
      id: review.id,
      rating: review.overallRating,
      comment: review.comment,
      createdAt: review.createdAt,
      familyName: review.family.name
        ? `${review.family.name.split(' ')[0]} ${review.family.name.split(' ')[1]?.charAt(0) || ''}.`
        : 'Família',
    }));

    // Process verifications
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

    return {
      id: nanny.id,
      userId: nanny.authId,
      lastActiveAt: nanny.updatedAt || null,
      firstName,
      age,
      slug: nanny.slug,
      photoUrl: nanny.photoUrl,
      aboutMe: nanny.aboutMe,
      gender: nanny.gender as 'MALE' | 'FEMALE' | 'OTHER' | null,
      specialties,
      experienceYears: nanny.experienceYears,
      hourlyRate: nanny.hourlyRate ? Number(nanny.hourlyRate) : null,
      availability,
      serviceTypes,
      attendanceModes,
      childAgeExperiences: nanny.ageRangesExperience || [],
      isSmoker: nanny.isSmoker,
      hasCnh: nanny.hasCnh,
      hasSpecialNeedsExperience: nanny.hasSpecialNeedsExperience,
      specialNeedsExperienceDescription: nanny.specialNeedsExperienceDescription,
      specialNeedsSpecialties: nanny.specialNeedsSpecialties || [],
      certifications: nanny.certifications || [],
      languages: nanny.languages as string[] | { language: string; level: string }[] | null,
      strengths: nanny.strengths || [],
      careMethodology: nanny.careMethodology,
      comfortableWithPets: nanny.comfortableWithPets,
      parentPresencePreference: nanny.parentPresencePreference,
      acceptedActivities: nanny.acceptedActivities || [],
      nannyTypes: nanny.nannyTypes || [],
      contractRegimes: nanny.contractRegimes || [],
      hourlyRateRange: nanny.hourlyRateRange,
      acceptsHolidayWork: nanny.acceptsHolidayWork,
      maxChildrenCare: nanny.maxChildrenCare,
      maxTravelDistance: nanny.maxTravelDistance,
      address: nanny.address
        ? {
            city: nanny.address.city,
            state: nanny.address.state,
            neighborhood: nanny.address.neighborhood,
          }
        : null,
      verifications,
      isVerified,
      hasPremium: hasPremium ?? false,
      hasActiveBoost,
      seal: sealResult.seal,
      sealRequirements: sealResult.requirements,
      reviews: {
        average: averageRating,
        total: totalReviews,
        items: publicReviews.slice(0, 3),
      },
      referencesCount: nanny.references.length,
      documents: nanny.documents.map(d => ({
        type: d.documentType,
        verified: d.validationStatus === 'VERIFIED',
      })),
    };
  } catch (error) {
    console.error('Error fetching nanny by slug:', error);
    return null;
  }
});

/**
 * Helper to generate city slug from city name
 */
export function generateCitySlug(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
