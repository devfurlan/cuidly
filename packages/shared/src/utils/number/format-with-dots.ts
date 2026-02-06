/**
 * Format number with dots as thousands separator (Brazilian format)
 * @param num - Number to format
 * @returns Formatted string like "1.234.567"
 */
export function formatNumberWithDots(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
