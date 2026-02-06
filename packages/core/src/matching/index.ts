/**
 * Matching Module Index
 * Re-exports all matching-related types, utilities, and converters
 */

// Types
export type {
  NannyProfile,
  JobData,
  FamilyData,
  MatchingChildData,
  MatchResult,
  MatchBreakdown,
  ScoreComponent,
  Coordinates,
  AddressWithCoordinates,
  ReviewStats,
} from './types';

// Distance utilities
export {
  calculateDistance,
  calculateDistanceBetweenAddresses,
  isWithinRadius,
  filterByRadius,
  sortByDistance,
  addDistanceToItems,
  maxTravelDistanceToKm,
  isWithinNannyTravelRange,
} from './distance';

// Prisma model converters
export {
  toNannyProfile,
  toFamilyData,
  toJobData,
  toChildData,
} from './converters';

// Availability slot utilities
export {
  slotsToArrays,
  arraysToSlots,
  hasAvailabilityOverlap,
  getAvailabilityIntersection,
  calculateAvailabilityOverlapPercentage,
  getAllPossibleSlots,
  SLOT_DAYS,
  SLOT_SHIFTS,
} from './availability';

// Main matching algorithm
export {
  calculateMatchScore,
  findBestMatches,
  MAX_SCORES,
} from './algorithm';

// Algorithm-specific types (re-exported for convenience)
export type {
  NannyProfile as AlgorithmNannyProfile,
  JobData as AlgorithmJobData,
  FamilyData as AlgorithmFamilyData,
  ChildData as AlgorithmChildData,
} from './algorithm';
