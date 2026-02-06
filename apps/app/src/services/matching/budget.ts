/**
 * Budget overlap calculation utilities for matching nannies with jobs
 */

/**
 * Budget range for a job
 */
export interface BudgetRange {
  min?: number | null;
  max?: number | null;
}

/**
 * Nanny's rate information
 */
export interface NannyRate {
  rate: number | null | undefined;
}

/**
 * Result of budget overlap calculation
 */
export interface BudgetOverlapResult {
  /** Overall overlap percentage (0-100) */
  overlapPercentage: number;
  /** Whether nanny's rate falls within budget range */
  isWithinBudget: boolean;
  /** Whether there's potential for negotiation */
  canNegotiate: boolean;
  /** The difference between nanny's rate and budget (negative if below min, positive if above max) */
  difference: number | null;
  /** Percentage difference from budget range */
  differencePercentage: number | null;
  /** Human-readable status */
  status: BudgetStatus;
}

/**
 * Budget matching status
 */
export type BudgetStatus =
  | 'within_budget'      // Rate is within min-max range
  | 'below_budget'       // Rate is below minimum (good for family)
  | 'above_budget'       // Rate is above maximum
  | 'no_match'           // Above budget
  | 'no_rate'            // Nanny has no rate defined
  | 'no_budget';         // Job has no budget defined

/**
 * Calculates the budget overlap between a job's budget and a nanny's rate.
 *
 * Overlap scenarios:
 * - Rate within budget range: 100%
 * - Rate below minimum: 100% (great deal for family)
 * - Rate above maximum: 0%
 * - No rate or no budget defined: 100% (no constraint)
 *
 * @param jobBudget - The job's budget range (min/max)
 * @param nannyRate - The nanny's rate
 * @returns Detailed budget overlap analysis
 *
 * @example
 * ```ts
 * const result = calculateBudgetOverlap(
 *   { min: 2000, max: 3000 },
 *   { rate: 2500 }
 * );
 * // result.overlapPercentage = 100 (within budget)
 * ```
 */
export function calculateBudgetOverlap(
  jobBudget: BudgetRange | null | undefined,
  nannyRate: NannyRate | null | undefined
): BudgetOverlapResult {
  // No rate defined - no constraint
  if (!nannyRate?.rate) {
    return {
      overlapPercentage: 100,
      isWithinBudget: true,
      canNegotiate: false,
      difference: null,
      differencePercentage: null,
      status: 'no_rate',
    };
  }

  // No budget defined - no constraint
  if (!jobBudget || (jobBudget.min == null && jobBudget.max == null)) {
    return {
      overlapPercentage: 100,
      isWithinBudget: true,
      canNegotiate: false,
      difference: null,
      differencePercentage: null,
      status: 'no_budget',
    };
  }

  const rate = nannyRate.rate;
  const min = jobBudget.min ?? 0;
  const max = jobBudget.max ?? Infinity;

  // Rate is below minimum (great for family)
  if (rate < min) {
    return {
      overlapPercentage: 100,
      isWithinBudget: true,
      canNegotiate: false,
      difference: rate - min,
      differencePercentage: min > 0 ? Math.round(((rate - min) / min) * 100) : 0,
      status: 'below_budget',
    };
  }

  // Rate is within budget range
  if (rate >= min && rate <= max) {
    return {
      overlapPercentage: 100,
      isWithinBudget: true,
      canNegotiate: false,
      difference: 0,
      differencePercentage: 0,
      status: 'within_budget',
    };
  }

  // Rate is above maximum
  const difference = rate - max;
  const differencePercentage = max > 0 ? Math.round((difference / max) * 100) : 100;

  return {
    overlapPercentage: 0,
    isWithinBudget: false,
    canNegotiate: false,
    difference,
    differencePercentage,
    status: 'no_match',
  };
}

/**
 * Calculates budget overlap for monthly rates
 */
export function calculateMonthlyBudgetOverlap(
  jobBudget: BudgetRange | null | undefined,
  nannyMonthlyRate: number | null | undefined
): BudgetOverlapResult {
  return calculateBudgetOverlap(jobBudget, { rate: nannyMonthlyRate });
}

/**
 * Calculates budget overlap for hourly rates
 */
export function calculateHourlyBudgetOverlap(
  jobBudget: BudgetRange | null | undefined,
  nannyHourlyRate: number | null | undefined
): BudgetOverlapResult {
  return calculateBudgetOverlap(jobBudget, { rate: nannyHourlyRate });
}

/**
 * Calculates budget overlap for daily rates
 */
export function calculateDailyBudgetOverlap(
  jobBudget: BudgetRange | null | undefined,
  nannyDailyRate: number | null | undefined
): BudgetOverlapResult {
  return calculateBudgetOverlap(jobBudget, { rate: nannyDailyRate });
}

/**
 * Checks if budget is compatible (overlap >= threshold)
 *
 * @param jobBudget - The job's budget range
 * @param nannyRate - The nanny's rate information
 * @param threshold - Minimum overlap percentage (default: 50)
 * @returns True if budget is compatible
 */
export function isBudgetCompatible(
  jobBudget: BudgetRange | null | undefined,
  nannyRate: NannyRate | null | undefined,
  threshold: number = 50
): boolean {
  const result = calculateBudgetOverlap(jobBudget, nannyRate);
  return result.overlapPercentage >= threshold;
}

/**
 * Formats a budget overlap result into a human-readable summary.
 *
 * @param result - The budget overlap result
 * @param rateType - Type of rate for display ('mensal', 'hora', 'diária')
 * @returns Human-readable summary string
 */
export function formatBudgetOverlapSummary(
  result: BudgetOverlapResult,
  rateType: 'mensal' | 'hora' | 'diária' = 'mensal'
): string {
  switch (result.status) {
    case 'within_budget':
      return 'Valor dentro do orçamento';
    case 'below_budget':
      return 'Valor abaixo do orçamento';
    case 'above_budget':
    case 'no_match':
      return `Valor ${result.differencePercentage}% acima do orçamento`;
    case 'no_rate':
      return `Valor ${rateType} não informado`;
    case 'no_budget':
      return 'Orçamento não definido';
    default:
      return 'Status desconhecido';
  }
}

/**
 * Formats currency value to Brazilian Real
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'Não informado';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Gets a color indicator for budget status (for UI)
 */
export function getBudgetStatusColor(status: BudgetStatus): 'green' | 'red' | 'gray' {
  switch (status) {
    case 'within_budget':
    case 'below_budget':
      return 'green';
    case 'above_budget':
    case 'no_match':
      return 'red';
    case 'no_rate':
    case 'no_budget':
      return 'gray';
    default:
      return 'gray';
  }
}

/**
 * Calculates the best rate match between job and nanny across all rate types.
 * Useful when job or nanny has multiple rate types.
 *
 * @param job - Job's budget ranges by type
 * @param nanny - Nanny's rates by type
 * @returns Best matching rate type and its overlap result
 */
export function findBestRateMatch(
  job: {
    monthlyBudget?: BudgetRange | null;
    hourlyBudget?: BudgetRange | null;
    dailyBudget?: BudgetRange | null;
  },
  nanny: {
    monthlyRate?: number | null;
    hourlyRate?: number | null;
    dailyRate?: number | null;
  }
): {
  rateType: 'monthly' | 'hourly' | 'daily' | null;
  result: BudgetOverlapResult;
} {
  const results: Array<{
    rateType: 'monthly' | 'hourly' | 'daily';
    result: BudgetOverlapResult;
  }> = [];

  if (job.monthlyBudget && nanny.monthlyRate) {
    results.push({
      rateType: 'monthly',
      result: calculateMonthlyBudgetOverlap(job.monthlyBudget, nanny.monthlyRate),
    });
  }

  if (job.hourlyBudget && nanny.hourlyRate) {
    results.push({
      rateType: 'hourly',
      result: calculateHourlyBudgetOverlap(job.hourlyBudget, nanny.hourlyRate),
    });
  }

  if (job.dailyBudget && nanny.dailyRate) {
    results.push({
      rateType: 'daily',
      result: calculateDailyBudgetOverlap(job.dailyBudget, nanny.dailyRate),
    });
  }

  if (results.length === 0) {
    return {
      rateType: null,
      result: {
        overlapPercentage: 100,
        isWithinBudget: true,
        canNegotiate: false,
        difference: null,
        differencePercentage: null,
        status: 'no_budget',
      },
    };
  }

  // Return the best match (highest overlap percentage)
  results.sort((a, b) => b.result.overlapPercentage - a.result.overlapPercentage);
  return results[0];
}
