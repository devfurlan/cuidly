/**
 * Matching Service
 *
 * Re-exports the matching algorithm from @cuidly/core.
 * The algorithm implementation has been moved to the core package
 * to allow sharing across multiple applications.
 */

// Re-export main algorithm functions
export {
  calculateMatchScore,
  findBestMatches,
  MAX_SCORES,
} from '@cuidly/core/matching';

// Re-export types for convenience
export type {
  AlgorithmNannyProfile as NannyProfile,
  AlgorithmJobData as JobData,
  AlgorithmFamilyData as FamilyData,
  AlgorithmChildData as ChildData,
  MatchResult,
  MatchBreakdown,
  ScoreComponent,
} from '@cuidly/core/matching';

// Re-export distance utilities
export {
  calculateDistance,
  maxTravelDistanceToKm,
  type Coordinates,
} from './distance';

// Re-export helper functions for converting Prisma models
export {
  toNannyProfile,
  toFamilyData,
  toJobData,
  toChildData,
} from './helpers';
