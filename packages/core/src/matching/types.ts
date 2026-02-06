/**
 * Matching Types
 * Interfaces and types for the matching algorithm
 */

// ============================================================================
// Types
// ============================================================================

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
  ageRangesExperience: string[]; // NEWBORN, BABY, TODDLER, PRESCHOOL, SCHOOL_AGE, TEENAGER
  maxTravelDistance?: string | null; // UP_TO_5KM, UP_TO_10KM, etc.
  maxChildrenCare?: number | null;
  comfortableWithPets?: string | null; // YES_ANY, ONLY_SOME, NO
  acceptedActivities: string[];
  // New fields for MVP
  nannyTypes: string[]; // FOLGUISTA, DIARISTA, MENSALISTA
  contractRegimes: string[]; // AUTONOMA, PJ, CLT
  hourlyRateRange?: string | null;
  // Validation fields for trust score
  documentValidated?: boolean | null;
  documentExpirationDate?: Date | null;
  personalDataValidated?: boolean | null;
  criminalBackgroundValidated?: boolean | null;
  // Aggregated review data
  averageRating?: number | null;
  reviewCount?: number | null;
  lastActiveAt?: Date | null;
  // Address for distance calculation
  address?: {
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  // Availability (optional - may not be filled)
  availabilitySlots?: string[] | null; // MONDAY_MORNING, TUESDAY_AFTERNOON, etc.
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
  nannyType?: string | null; // FOLGUISTA, DIARISTA, MENSALISTA
  contractRegime?: string | null; // AUTONOMA, PJ, CLT
  hourlyRateRange?: string | null;
  domesticHelpExpected: string[];
  // Availability slots
  availabilitySlots?: string[] | null; // MONDAY_MORNING, TUESDAY_AFTERNOON, etc.
  address?: {
    latitude?: number | null;
    longitude?: number | null;
  } | null;
}

/**
 * Child data needed for matching
 */
export interface MatchingChildData {
  id: number;
  birthDate?: Date | null;
  expectedBirthDate?: Date | null;
  unborn?: boolean;
  hasSpecialNeeds: boolean;
  specialNeedsTypes?: string[];
  specialNeedsDescription?: string | null;
}

/**
 * Match result with detailed breakdown
 */
export interface MatchResult {
  /** Overall match score (0-110 max with bonuses) */
  score: number;
  /** Fit score (0-80) */
  fitScore: number;
  /** Trust score (0-20) */
  trustScore: number;
  /** Bonus score (0-10) */
  bonusScore: number;
  /** Whether the match passes all eliminatory filters */
  isEligible: boolean;
  /** Reasons why the nanny was eliminated (if any) */
  eliminationReasons: string[];
  /** Detailed breakdown of scores by category */
  breakdown: MatchBreakdown;
}

/**
 * Breakdown of match scores by category - MVP Version
 */
export interface MatchBreakdown {
  // Fit da Vaga (80 pts total)
  ageRange: ScoreComponent; // 25 pts
  nannyType: ScoreComponent; // 15 pts
  activities: ScoreComponent; // 15 pts
  contractRegime: ScoreComponent; // 10 pts
  availability: ScoreComponent; // 10 pts
  childrenCount: ScoreComponent; // 5 pts
  // Confiança (20 pts total)
  seal: ScoreComponent; // 8 pts
  reviews: ScoreComponent; // 12 pts
  // Bônus (10 pts max)
  distanceBonus: ScoreComponent; // +5 pts
  budgetBonus: ScoreComponent; // +5 pts
}

/**
 * A single scoring component
 */
export interface ScoreComponent {
  score: number; // Raw score for this component
  maxScore: number; // Maximum possible score
  details?: string; // Human-readable explanation
}

/**
 * Represents geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Represents an address with optional coordinates
 */
export interface AddressWithCoordinates {
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Review statistics for a nanny
 */
export interface ReviewStats {
  averageRating: number | null;
  reviewCount: number;
}
