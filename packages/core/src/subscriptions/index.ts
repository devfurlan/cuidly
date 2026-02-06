/**
 * Subscriptions module - barrel export
 */

// Plans
export {
  SubscriptionPlan,
  PLAN_LABELS,
  PAID_PLANS,
  FREE_PLANS,
  FAMILY_PLANS,
  NANNY_PLANS,
  isPaidPlan,
  isFreePlan,
  isFamilyPlan,
  isNannyPlan,
  getPlanLabel,
  type PaidPlan,
  type FreePlan,
} from './plans';

// Billing
export {
  BillingInterval,
  BILLING_INTERVAL_LABELS,
  BILLING_INTERVAL_DESCRIPTIONS,
  BILLING_INTERVAL_MONTHS,
  BILLING_INTERVAL_PERIOD_LABELS,
  getBillingIntervalLabel,
  getBillingIntervalDescription,
  getBillingIntervalMonths,
  getBillingIntervalPeriodLabel,
} from './billing';

// Pricing
export {
  PLAN_PRICES,
  FREE_PLAN_PRICE,
  AVAILABLE_BILLING_INTERVALS,
  getPlanPricing,
  getPlanPrice,
  getPlanPriceStrict,
  isValidBillingInterval,
  getAvailableBillingIntervals,
  getDiscountPercentage,
  getMonthlyEquivalentPrice,
  formatPrice,
  formatPriceWithPeriod,
  formatPriceDisplay,
  type PriceInfo,
  type PlanPricingConfig,
} from './pricing';

// Schemas
export {
  SubscriptionPlanSchema,
  BillingIntervalSchema,
  PaidPlanSchema,
  SubscriptionCreateSchema,
  type SubscriptionCreateInput,
} from './schemas';

// Features
export {
  PLAN_FEATURES,
  getPlanFeaturesConfig,
  getPlanTier,
  getReviewLimit,
  getJobLimit,
  getMaxConversations,
  getJobExpirationDays,
  hasMatchingFeature,
  hasUnlimitedMessaging,
  getPlanDisplayName,
  getBillingIntervalDisplayName,
  type SubscriptionPlanFeatures,
} from './features';
