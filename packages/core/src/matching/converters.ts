/**
 * Helper functions for converting Prisma models to matching interfaces
 */

import type {
  NannyProfile,
  JobData,
  FamilyData,
  MatchingChildData,
  ReviewStats,
} from './types';

// Type for Prisma Nanny with relations
interface PrismaNanny {
  id: number;
  name: string | null;
  gender: string | null;
  birthDate: Date | null;
  isSmoker: boolean;
  hasCnh: boolean;
  experienceYears: number | null;
  hasSpecialNeedsExperience: boolean;
  specialNeedsSpecialties: string[];
  specialNeedsExperienceDescription: string | null;
  certifications: string[];
  ageRangesExperience: string[];
  maxTravelDistance: string | null;
  maxChildrenCare: number | null;
  comfortableWithPets: string | null;
  acceptedActivities: string[];
  nannyTypes: string[];
  contractRegimes: string[];
  hourlyRateRange: string | null;
  documentValidated: boolean;
  documentExpirationDate: Date | null;
  personalDataValidated: boolean;
  criminalBackgroundValidated: boolean;
  lastActiveAt: Date | null;
  address?: {
    latitude: number | null;
    longitude: number | null;
  } | null;
  availabilityJson?: unknown;
}

// Type for Prisma Family with relations
interface PrismaFamily {
  id: number;
  hasPets: boolean;
  numberOfChildren: number | null;
  nannyType: string | null;
  contractRegime: string | null;
  hourlyRateRange: string | null;
  domesticHelpExpected: string[];
  neededDays: string[];
  neededShifts: string[];
  address?: {
    latitude: number | null;
    longitude: number | null;
  } | null;
}

// Type for Prisma Job
interface PrismaJob {
  id: number;
  mandatoryRequirements: string[];
  childrenIds: number[];
}

// Type for Prisma Child
interface PrismaChild {
  id: number;
  birthDate: Date | null;
  expectedBirthDate: Date | null;
  unborn: boolean;
  hasSpecialNeeds: boolean;
  specialNeedsTypes: string[];
  specialNeedsDescription: string | null;
}

/**
 * Convert Prisma Nanny to NannyProfile for matching
 */
export function toNannyProfile(
  nanny: PrismaNanny,
  reviewStats?: ReviewStats
): NannyProfile {
  return {
    id: nanny.id,
    name: nanny.name || '',
    gender: nanny.gender,
    birthDate: nanny.birthDate,
    isSmoker: nanny.isSmoker,
    hasCnh: nanny.hasCnh,
    experienceYears: nanny.experienceYears,
    hasSpecialNeedsExperience: nanny.hasSpecialNeedsExperience,
    specialNeedsSpecialties: nanny.specialNeedsSpecialties || [],
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
    averageRating: reviewStats?.averageRating ?? null,
    reviewCount: reviewStats?.reviewCount ?? null,
    lastActiveAt: nanny.lastActiveAt,
    address: nanny.address
      ? {
          latitude: nanny.address.latitude,
          longitude: nanny.address.longitude,
        }
      : null,
    availabilitySlots: parseAvailabilitySlots(nanny.availabilityJson),
  };
}

/**
 * Convert Prisma Family to FamilyData for matching
 */
export function toFamilyData(family: PrismaFamily): FamilyData {
  return {
    id: family.id,
    hasPets: family.hasPets,
    numberOfChildren: family.numberOfChildren,
    nannyType: family.nannyType,
    contractRegime: family.contractRegime,
    hourlyRateRange: family.hourlyRateRange,
    domesticHelpExpected: family.domesticHelpExpected,
    availabilitySlots: buildAvailabilitySlots(
      family.neededDays,
      family.neededShifts
    ),
    address: family.address
      ? {
          latitude: family.address.latitude,
          longitude: family.address.longitude,
        }
      : null,
  };
}

/**
 * Convert Prisma Job to JobData for matching
 */
export function toJobData(job: PrismaJob): JobData {
  return {
    id: job.id,
    mandatoryRequirements: job.mandatoryRequirements,
    childrenIds: job.childrenIds,
  };
}

/**
 * Convert Prisma Child to MatchingChildData for matching
 */
export function toChildData(child: PrismaChild): MatchingChildData {
  return {
    id: child.id,
    birthDate: child.birthDate,
    expectedBirthDate: child.expectedBirthDate,
    unborn: child.unborn,
    hasSpecialNeeds: child.hasSpecialNeeds,
    specialNeedsTypes: child.specialNeedsTypes || [],
    specialNeedsDescription: child.specialNeedsDescription,
  };
}

/**
 * Build availability slots from neededDays and neededShifts arrays
 */
function buildAvailabilitySlots(
  neededDays: string[] | null | undefined,
  neededShifts: string[] | null | undefined
): string[] | null {
  if (
    !neededDays ||
    neededDays.length === 0 ||
    !neededShifts ||
    neededShifts.length === 0
  ) {
    return null;
  }

  return neededDays.flatMap((day) =>
    neededShifts.map((shift) => `${day}_${shift}`)
  );
}

/**
 * Parse availability JSON to slots array
 * Converts from { monday: { enabled: true, startTime: '08:00', endTime: '18:00' }, ... }
 * to ['MONDAY_MORNING', 'MONDAY_AFTERNOON', ...]
 */
function parseAvailabilitySlots(availabilityJson: unknown): string[] | null {
  if (!availabilityJson || typeof availabilityJson !== 'object') {
    return null;
  }

  const slots: string[] = [];
  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const dayMap: Record<string, string> = {
    monday: 'MONDAY',
    tuesday: 'TUESDAY',
    wednesday: 'WEDNESDAY',
    thursday: 'THURSDAY',
    friday: 'FRIDAY',
    saturday: 'SATURDAY',
    sunday: 'SUNDAY',
  };

  const availability = availabilityJson as Record<
    string,
    { enabled?: boolean; startTime?: string; endTime?: string }
  >;

  for (const day of days) {
    const dayData = availability[day];
    if (!dayData?.enabled) continue;

    const startTime = dayData.startTime || '08:00';
    const endTime = dayData.endTime || '18:00';

    // Convert time ranges to shifts
    const startHour = parseInt(startTime.split(':')[0], 10);
    const endHour = parseInt(endTime.split(':')[0], 10);

    // Morning: 6-12
    if (startHour < 12 && endHour > 6) {
      slots.push(`${dayMap[day]}_MORNING`);
    }
    // Afternoon: 12-18
    if (startHour < 18 && endHour > 12) {
      slots.push(`${dayMap[day]}_AFTERNOON`);
    }
    // Night: 18-23
    if (startHour < 23 && endHour > 18) {
      slots.push(`${dayMap[day]}_NIGHT`);
    }
    // Overnight: 23-6 (next day)
    if (endHour <= 6 || startHour >= 23) {
      slots.push(`${dayMap[day]}_OVERNIGHT`);
    }
  }

  return slots.length > 0 ? slots : null;
}
