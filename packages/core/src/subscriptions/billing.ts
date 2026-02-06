/**
 * Billing interval definitions
 * Matches Prisma BillingInterval enum
 */

export const BillingInterval = {
  MONTH: 'MONTH',
  QUARTER: 'QUARTER',
  YEAR: 'YEAR',
} as const;

export type BillingInterval =
  (typeof BillingInterval)[keyof typeof BillingInterval];

// Display labels for billing intervals
export const BILLING_INTERVAL_LABELS: Record<BillingInterval, string> = {
  MONTH: 'Mensal',
  QUARTER: 'Trimestral',
  YEAR: 'Anual',
} as const;

// Duration descriptions
export const BILLING_INTERVAL_DESCRIPTIONS: Record<BillingInterval, string> = {
  MONTH: 'Renovado mensalmente',
  QUARTER: 'Renovado a cada 3 meses',
  YEAR: 'Renovado anualmente',
} as const;

// Duration in months for each interval
export const BILLING_INTERVAL_MONTHS: Record<BillingInterval, number> = {
  MONTH: 1,
  QUARTER: 3,
  YEAR: 12,
} as const;

// Period labels (for price display like "R$ 47/mês")
export const BILLING_INTERVAL_PERIOD_LABELS: Record<BillingInterval, string> = {
  MONTH: 'mês',
  QUARTER: 'trimestre',
  YEAR: 'ano',
} as const;

export function getBillingIntervalLabel(interval: BillingInterval): string {
  return BILLING_INTERVAL_LABELS[interval] ?? interval;
}

export function getBillingIntervalDescription(
  interval: BillingInterval
): string {
  return BILLING_INTERVAL_DESCRIPTIONS[interval] ?? '';
}

export function getBillingIntervalMonths(interval: BillingInterval): number {
  return BILLING_INTERVAL_MONTHS[interval] ?? 1;
}

export function getBillingIntervalPeriodLabel(
  interval: BillingInterval
): string {
  return BILLING_INTERVAL_PERIOD_LABELS[interval] ?? interval;
}
