/**
 * Subscription Plan definitions
 * Single source of truth for all plan-related constants
 */

// Plan enum values (matching Prisma SubscriptionPlan enum)
export const SubscriptionPlan = {
  FAMILY_FREE: 'FAMILY_FREE',
  FAMILY_PLUS: 'FAMILY_PLUS',
  NANNY_FREE: 'NANNY_FREE',
  NANNY_PRO: 'NANNY_PRO',
} as const;

export type SubscriptionPlan =
  (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

// Plan display labels (Portuguese)
export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  FAMILY_FREE: 'Cuidly Free',
  FAMILY_PLUS: 'Cuidly Plus',
  NANNY_FREE: 'Cuidly Básico',
  NANNY_PRO: 'Cuidly Pro',
} as const;

// Paid plans only
export const PAID_PLANS = [
  SubscriptionPlan.FAMILY_PLUS,
  SubscriptionPlan.NANNY_PRO,
] as const;

export type PaidPlan = (typeof PAID_PLANS)[number];

// Free plans only
export const FREE_PLANS = [
  SubscriptionPlan.FAMILY_FREE,
  SubscriptionPlan.NANNY_FREE,
] as const;

export type FreePlan = (typeof FREE_PLANS)[number];

// Family plans
export const FAMILY_PLANS = [
  SubscriptionPlan.FAMILY_FREE,
  SubscriptionPlan.FAMILY_PLUS,
] as const;

// Nanny plans
export const NANNY_PLANS = [
  SubscriptionPlan.NANNY_FREE,
  SubscriptionPlan.NANNY_PRO,
] as const;

// Helper functions
export function isPaidPlan(plan: SubscriptionPlan): plan is PaidPlan {
  return PAID_PLANS.includes(plan as PaidPlan);
}

export function isFreePlan(plan: SubscriptionPlan): plan is FreePlan {
  return FREE_PLANS.includes(plan as FreePlan);
}

export function isFamilyPlan(plan: SubscriptionPlan): boolean {
  return FAMILY_PLANS.includes(plan as (typeof FAMILY_PLANS)[number]);
}

export function isNannyPlan(plan: SubscriptionPlan): boolean {
  return NANNY_PLANS.includes(plan as (typeof NANNY_PLANS)[number]);
}

export function getPlanLabel(plan: SubscriptionPlan): string {
  return PLAN_LABELS[plan] ?? plan;
}
