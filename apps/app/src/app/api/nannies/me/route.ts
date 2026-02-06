import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

// Profile completion fields with their weights
const PROFILE_FIELDS = {
  // Basic info (required - 35%)
  name: { weight: 5, required: true },
  birthDate: { weight: 5, required: true },
  phoneNumber: { weight: 5, required: true },
  photoUrl: { weight: 10, required: true },
  address: { weight: 10, required: true },

  // Experience (25%)
  experienceYears: { weight: 5, required: false },
  ageRangesExperience: { weight: 5, required: false },
  certifications: { weight: 5, required: false },
  languages: { weight: 5, required: false },
  hasSpecialNeedsExperience: { weight: 5, required: false },

  // About (25%)
  aboutMe: { weight: 25, required: false },

  // Preferences (15%)
  childTypePreference: { weight: 3, required: false },
  strengths: { weight: 3, required: false },
  careMethodology: { weight: 3, required: false },
  acceptedActivities: { weight: 3, required: false },
  comfortableWithPets: { weight: 3, required: false },
};

function calculateProfileCompletion(nanny: Record<string, unknown>): number {
  let totalWeight = 0;
  let completedWeight = 0;

  for (const [field, config] of Object.entries(PROFILE_FIELDS)) {
    totalWeight += config.weight;

    const value = nanny[field];

    // Check if field has a meaningful value
    let hasValue = false;

    if (field === 'address') {
      // Address is a special case - check if city exists
      hasValue = !!(nanny.address as { city?: string })?.city;
    } else if (Array.isArray(value)) {
      hasValue = value.length > 0;
    } else if (typeof value === 'string') {
      hasValue = value.trim().length > 0;
    } else if (typeof value === 'number') {
      hasValue = value > 0;
    } else if (typeof value === 'boolean') {
      hasValue = true; // Boolean fields are always "filled"
    } else if (value !== null && value !== undefined) {
      hasValue = true;
    }

    if (hasValue) {
      completedWeight += config.weight;
    }
  }

  return Math.round((completedWeight / totalWeight) * 100);
}

function slugifyCity(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'User is not a nanny' }, { status: 400 });
    }

    const nannyId = currentUser.nanny.id;

    // Fetch nanny with all relevant data
    const nanny = await prisma.nanny.findUnique({
      where: { id: nannyId },
      include: {
        address: {
          select: {
            city: true,
            state: true,
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
      },
    });

    if (!nanny) {
      return NextResponse.json({ error: 'Nanny not found' }, { status: 404 });
    }

    // Calculate age
    const age = nanny.birthDate
      ? Math.floor(
          (Date.now() - new Date(nanny.birthDate).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : null;

    // Calculate average rating
    const reviews = nanny.reviews || [];
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
        : null;

    // Check verification status
    const isVerified = nanny.documentValidated && nanny.personalDataValidated;

    // Calculate profile completion percentage
    const profileCompletion = calculateProfileCompletion(nanny as unknown as Record<string, unknown>);

    // Generate profile URL
    const citySlug = nanny.address?.city ? slugifyCity(nanny.address.city) : 'brasil';
    const profileUrl = `/baba/${citySlug}/${nanny.slug}`;

    return NextResponse.json({
      success: true,
      nanny: {
        id: nanny.id,
        name: nanny.name,
        slug: nanny.slug,
        photoUrl: nanny.photoUrl,
        age,
        experienceYears: nanny.experienceYears,
        city: nanny.address?.city || null,
        state: nanny.address?.state || null,
        latitude: nanny.address?.latitude || null,
        longitude: nanny.address?.longitude || null,
        isVerified,
        averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
        reviewCount: reviews.length,
        profileCompletion,
        profileUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching nanny data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
