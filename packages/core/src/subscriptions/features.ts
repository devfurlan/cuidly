/**
 * Plan Features Configuration
 * Defines what each plan tier provides (not billing interval dependent)
 */

import type { BillingInterval } from "./billing";
import type { SubscriptionPlan } from "./plans";

// ===============================================
// Subscription Plan Features Interface
// Note: Different from schemas/plan.ts PlanFeatures which is for admin plan management
// ===============================================

export interface SubscriptionPlanFeatures {
  // Family features
  viewProfiles?: number; // -1 = unlimited
  createJobs?: number; // max active jobs
  seeReviews?: number; // -1 = unlimited, 1 = one per nanny
  favorite?: boolean;
  seeVerificationSeals?: boolean;
  unlimitedContact?: boolean; // can start unlimited conversations
  maxConversationsPerJob?: number; // max distinct nannies per job (free plan limit)
  jobExpirationDays?: number; // days until job expires (free plan)
  matching?: boolean;
  rateNannies?: boolean;
  jobHighlight?: boolean;
  boostPerCycle?: number; // boosts per billing cycle

  // Nanny features
  viewJobs?: boolean;
  applyToJobs?: boolean;
  profileComplete?: boolean;
  unlimitedMessaging?: boolean; // can send messages freely after application
  rateFamilies?: boolean;
  profileHighlight?: boolean;
  priorityMatching?: boolean;
  weeklyBoost?: number;
}

// ===============================================
// Plan Features Mapping
// ===============================================

/**
 * IMPORTANT: Features are based on PLAN TIER only, not billing interval.
 * Whether user pays monthly or quarterly, they get the same features.
 */
export const PLAN_FEATURES: Record<SubscriptionPlan, SubscriptionPlanFeatures> =
  {
    // Family Free Plan
    FAMILY_FREE: {
      viewProfiles: -1, // unlimited profile views
      createJobs: 1, // 1 active job
      seeReviews: 1, // 1 review per nanny
      favorite: true, // can favorite nannies
      seeVerificationSeals: true, // can see nanny seals
      unlimitedContact: false, // limited conversations
      maxConversationsPerJob: 1, // max 1 conversation (FREE can start 1 chat)
      jobExpirationDays: 7, // job expires in 7 days
      matching: false, // no smart matching
      rateNannies: true, // FREE can rate nannies
    },

    // Family Plus Plan (paid)
    FAMILY_PLUS: {
      viewProfiles: -1, // unlimited
      createJobs: 3, // up to 3 active jobs
      seeReviews: -1, // unlimited reviews
      favorite: true,
      seeVerificationSeals: true,
      unlimitedContact: true, // unlimited conversations
      maxConversationsPerJob: -1, // unlimited
      jobExpirationDays: 30, // job expires in 30 days
      matching: true, // smart matching enabled
      rateNannies: true, // can rate nannies
      jobHighlight: true, // jobs appear first
      boostPerCycle: 1, // 1 boost per billing cycle
    },

    // Nanny Free Plan
    NANNY_FREE: {
      viewJobs: true,
      applyToJobs: true, // can apply to jobs
      profileComplete: true,
      unlimitedMessaging: false, // can only send 1 message with application
      rateFamilies: true, // can rate families after service
    },

    // Nanny Pro Plan (paid)
    NANNY_PRO: {
      viewJobs: true,
      applyToJobs: true, // can apply to jobs
      profileComplete: true,
      unlimitedMessaging: true, // can send messages freely
      rateFamilies: true,
      profileHighlight: true, // appears first in searches
      priorityMatching: true, // appears in family suggestions
    },
  };

// ===============================================
// Pure Helper Functions
// ===============================================

/**
 * Get features for a specific plan
 */
export function getPlanFeaturesConfig(
  plan: SubscriptionPlan,
): SubscriptionPlanFeatures {
  return PLAN_FEATURES[plan] ?? {};
}

/**
 * Get plan tier (free or paid) - ignores billing interval
 */
export function getPlanTier(plan: SubscriptionPlan): "free" | "paid" {
  if (plan === "FAMILY_FREE" || plan === "NANNY_FREE") {
    return "free";
  }
  return "paid";
}

/**
 * Get the maximum number of reviews a user can see per nanny
 * @returns -1 for unlimited, or the number limit
 */
export function getReviewLimit(plan: SubscriptionPlan): number {
  const features = PLAN_FEATURES[plan];
  return features?.seeReviews ?? 0;
}

/**
 * Get the maximum number of active jobs a user can have
 */
export function getJobLimit(plan: SubscriptionPlan): number {
  const features = PLAN_FEATURES[plan];
  return features?.createJobs ?? 0;
}

/**
 * Get max conversations for a plan (total, not per job)
 * Family Free: 1 total conversation
 * Family Plus: unlimited (-1)
 * @returns -1 for unlimited, or the limit number
 */
export function getMaxConversations(plan: SubscriptionPlan): number {
  const features = PLAN_FEATURES[plan];
  return features?.maxConversationsPerJob ?? 0;
}

/**
 * Get job expiration days for a plan
 * @returns -1 for never expires, or the number of days
 */
export function getJobExpirationDays(plan: SubscriptionPlan): number {
  const features = PLAN_FEATURES[plan];
  return features?.jobExpirationDays ?? -1;
}

/**
 * Check if plan has smart matching enabled
 */
export function hasMatchingFeature(plan: SubscriptionPlan): boolean {
  const features = PLAN_FEATURES[plan];
  return features?.matching === true || features?.priorityMatching === true;
}

/**
 * Check if plan has unlimited messaging (Nanny Pro)
 */
export function hasUnlimitedMessaging(plan: SubscriptionPlan): boolean {
  const features = PLAN_FEATURES[plan];
  return features?.unlimitedMessaging === true;
}

/**
 * Get display name for a plan (Portuguese)
 */
export function getPlanDisplayName(plan: SubscriptionPlan): string {
  switch (plan) {
    case "FAMILY_FREE":
      return "Familia Grátis";
    case "FAMILY_PLUS":
      return "Familia Plus";
    case "NANNY_FREE":
      return "Baba Grátis";
    case "NANNY_PRO":
      return "Baba Pro";
    default:
      return plan;
  }
}

/**
 * Get display name for billing interval (Portuguese)
 */
export function getBillingIntervalDisplayName(
  interval: BillingInterval,
): string {
  switch (interval) {
    case "MONTH":
      return "Mensal";
    case "QUARTER":
      return "Trimestral";
    case "YEAR":
      return "Anual";
    default:
      return interval;
  }
}
