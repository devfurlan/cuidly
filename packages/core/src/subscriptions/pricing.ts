/**
 * Pricing definitions for subscription plans
 * Single source of truth for all prices
 */

import { BillingInterval, getBillingIntervalPeriodLabel } from "./billing";
import { SubscriptionPlan, type PaidPlan } from "./plans";

/**
 * Price info structure
 */
export interface PriceInfo {
  /** Original price (without discount) */
  original: number;
  /** Current price to be charged */
  price: number;
  /** Discount percentage */
  discount: number;
}

/**
 * Type-safe pricing configuration
 * Only valid plan + billing interval combinations are allowed
 */
export interface PlanPricingConfig {
  FAMILY_PLUS: {
    MONTH: PriceInfo;
    QUARTER: PriceInfo;
  };
  NANNY_PRO: {
    MONTH: PriceInfo;
    YEAR: PriceInfo;
  };
}

/**
 * Actual pricing values (in BRL)
 *
 * FAMILY_PLUS:
 * - Monthly: De R$ 59 por R$ 47 (20% off)
 * - Quarterly: De R$ 177 por R$ 94 (47% off)
 *
 * NANNY_PRO:
 * - Monthly: R$ 19/mês
 * - Yearly: R$ 119/ano
 */
export const PLAN_PRICES: PlanPricingConfig = {
  FAMILY_PLUS: {
    MONTH: { original: 59.0, price: 47.0, discount: 20 },
    QUARTER: { original: 119.0, price: 94.0, discount: 46 },
  },
  NANNY_PRO: {
    MONTH: { original: 19.0, price: 19.0, discount: 0 },
    YEAR: { original: 119.0, price: 119.0, discount: 47 },
  },
} as const;

// Free plan price info
export const FREE_PLAN_PRICE: PriceInfo = {
  original: 0,
  price: 0,
  discount: 0,
};

/**
 * Available billing intervals per paid plan
 */
export const AVAILABLE_BILLING_INTERVALS: Record<
  PaidPlan,
  readonly BillingInterval[]
> = {
  FAMILY_PLUS: [BillingInterval.MONTH, BillingInterval.QUARTER] as const,
  NANNY_PRO: [BillingInterval.MONTH, BillingInterval.YEAR] as const,
} as const;

/**
 * Get full pricing info for a plan/interval combination
 * Returns undefined for invalid combinations
 */
export function getPlanPricing(
  plan: SubscriptionPlan,
  billingInterval: BillingInterval
): PriceInfo | undefined {
  if (
    plan === SubscriptionPlan.FAMILY_FREE ||
    plan === SubscriptionPlan.NANNY_FREE
  ) {
    return FREE_PLAN_PRICE;
  }

  if (plan === SubscriptionPlan.FAMILY_PLUS) {
    if (billingInterval === BillingInterval.MONTH) {
      return PLAN_PRICES.FAMILY_PLUS.MONTH;
    }
    if (billingInterval === BillingInterval.QUARTER) {
      return PLAN_PRICES.FAMILY_PLUS.QUARTER;
    }
    return undefined;
  }

  if (plan === SubscriptionPlan.NANNY_PRO) {
    if (billingInterval === BillingInterval.MONTH) {
      return PLAN_PRICES.NANNY_PRO.MONTH;
    }
    if (billingInterval === BillingInterval.YEAR) {
      return PLAN_PRICES.NANNY_PRO.YEAR;
    }
    return undefined;
  }

  return undefined;
}

/**
 * Get only the final price (shortcut)
 */
export function getPlanPrice(
  plan: SubscriptionPlan,
  billingInterval: BillingInterval
): number | undefined {
  return getPlanPricing(plan, billingInterval)?.price;
}

/**
 * Get price or throw if invalid combination
 */
export function getPlanPriceStrict(
  plan: SubscriptionPlan,
  billingInterval: BillingInterval
): number {
  const price = getPlanPrice(plan, billingInterval);
  if (price === undefined) {
    throw new Error(
      `Invalid plan/billing interval combination: ${plan}/${billingInterval}`
    );
  }
  return price;
}

/**
 * Check if a billing interval is valid for a plan
 */
export function isValidBillingInterval(
  plan: SubscriptionPlan,
  billingInterval: BillingInterval
): boolean {
  return getPlanPricing(plan, billingInterval) !== undefined;
}

/**
 * Get available billing intervals for a plan
 */
export function getAvailableBillingIntervals(
  plan: SubscriptionPlan
): BillingInterval[] {
  if (
    plan === SubscriptionPlan.FAMILY_FREE ||
    plan === SubscriptionPlan.NANNY_FREE
  ) {
    return [];
  }

  if (plan === SubscriptionPlan.FAMILY_PLUS) {
    return [...AVAILABLE_BILLING_INTERVALS.FAMILY_PLUS];
  }

  if (plan === SubscriptionPlan.NANNY_PRO) {
    return [...AVAILABLE_BILLING_INTERVALS.NANNY_PRO];
  }

  return [];
}

/**
 * Get discount percentage for a plan/interval
 */
export function getDiscountPercentage(
  plan: SubscriptionPlan,
  billingInterval: BillingInterval
): number | undefined {
  return getPlanPricing(plan, billingInterval)?.discount;
}

/**
 * Calculate monthly equivalent price
 */
export function getMonthlyEquivalentPrice(
  plan: SubscriptionPlan,
  billingInterval: BillingInterval
): number | undefined {
  const pricing = getPlanPricing(plan, billingInterval);
  if (!pricing) return undefined;

  switch (billingInterval) {
    case BillingInterval.MONTH:
      return pricing.price;
    case BillingInterval.QUARTER:
      return pricing.price / 3;
    case BillingInterval.YEAR:
      return pricing.price / 12;
    default:
      return undefined;
  }
}

/**
 * Format price as Brazilian currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

/**
 * Get formatted price string with period
 * e.g., "R$ 47,00/mês" or "R$ 94,00/trimestre"
 */
export function formatPriceWithPeriod(
  plan: SubscriptionPlan,
  billingInterval: BillingInterval
): string | undefined {
  const pricing = getPlanPricing(plan, billingInterval);
  if (!pricing) return undefined;

  const periodLabel = getBillingIntervalPeriodLabel(billingInterval);
  return `${formatPrice(pricing.price)}/${periodLabel}`;
}

/**
 * Get formatted display string showing original and discounted price
 * e.g., "De R$ 59,00 por R$ 47,00"
 */
export function formatPriceDisplay(
  plan: SubscriptionPlan,
  billingInterval: BillingInterval
): string | undefined {
  const pricing = getPlanPricing(plan, billingInterval);
  if (!pricing) return undefined;

  if (pricing.discount === 0) {
    return formatPrice(pricing.price);
  }

  return `De ${formatPrice(pricing.original)} por ${formatPrice(
    pricing.price
  )}`;
}
