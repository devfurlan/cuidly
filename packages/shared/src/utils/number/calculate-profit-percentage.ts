/**
 * Calculate profit percentage
 * @param income - Total income
 * @param expense - Total expense
 * @returns Profit percentage (0-100)
 */
export function calculateProfitPercentage(
  income: number,
  expense: number
): number {
  return income > 0 ? ((income - expense) / income) * 100 : 0;
}
