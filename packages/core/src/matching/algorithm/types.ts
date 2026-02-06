/**
 * Matching Algorithm Types
 * These are the simplified types used by the algorithm itself.
 * For Prisma model conversion, use the converters module.
 */

/**
 * Nanny profile data needed for matching
 */
export interface NannyProfile {
  id: number;
  name: string;
  gender?: string | null;
  birthDate?: Date | null;
  isSmoker?: boolean | null;
  hasCnh?: boolean | null;
  experienceYears?: number | null;
  hasSpecialNeedsExperience?: boolean | null;
  specialNeedsSpecialties?: string[];
  specialNeedsExperienceDescription?: string | null;
  certifications: string[];
  ageRangesExperience: string[];
  maxTravelDistance?: string | null;
  maxChildrenCare?: number | null;
  comfortableWithPets?: string | null;
  acceptedActivities: string[];
  nannyTypes: string[];
  contractRegimes: string[];
  hourlyRateRange?: string | null;
  documentValidated?: boolean | null;
  documentExpirationDate?: Date | null;
  personalDataValidated?: boolean | null;
  criminalBackgroundValidated?: boolean | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  lastActiveAt?: Date | null;
  address?: {
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  availabilitySlots?: string[] | null;
}

/**
 * Job data needed for matching
 */
export interface JobData {
  id: number;
  mandatoryRequirements: string[];
  childrenIds: number[];
}

/**
 * Family data needed for matching
 */
export interface FamilyData {
  id: number;
  hasPets: boolean;
  numberOfChildren?: number | null;
  nannyType?: string | null;
  contractRegime?: string | null;
  hourlyRateRange?: string | null;
  domesticHelpExpected: string[];
  availabilitySlots?: string[] | null;
  address?: {
    latitude?: number | null;
    longitude?: number | null;
  } | null;
}

/**
 * Child data needed for matching
 */
export interface ChildData {
  id: number;
  birthDate?: Date | null;
  expectedBirthDate?: Date | null;
  unborn?: boolean;
  hasSpecialNeeds: boolean;
  specialNeedsTypes?: string[];
  specialNeedsDescription?: string | null;
}

/**
 * A single scoring component
 */
export interface ScoreComponent {
  score: number;
  maxScore: number;
  details?: string;
}

/**
 * Breakdown of match scores by category
 */
export interface MatchBreakdown {
  ageRange: ScoreComponent;
  nannyType: ScoreComponent;
  activities: ScoreComponent;
  contractRegime: ScoreComponent;
  availability: ScoreComponent;
  childrenCount: ScoreComponent;
  seal: ScoreComponent;
  reviews: ScoreComponent;
  distanceBonus: ScoreComponent;
  budgetBonus: ScoreComponent;
}

/**
 * Match result with detailed breakdown
 */
export interface MatchResult {
  score: number;
  fitScore: number;
  trustScore: number;
  bonusScore: number;
  isEligible: boolean;
  eliminationReasons: string[];
  breakdown: MatchBreakdown;
}
