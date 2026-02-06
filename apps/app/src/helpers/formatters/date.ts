/**
 * Date Formatting
 * Single source of truth for date masking
 */

/**
 * Mask date: DD/MM/YYYY
 * @param date - Date string
 * @returns Formatted date string
 */
export function maskDate(date: string): string {
  const cleaned = date.replace(/\D/g, '').slice(0, 8);
  let masked = cleaned;

  if (cleaned.length > 2) {
    masked = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  }
  if (cleaned.length > 4) {
    masked = masked.slice(0, 5) + '/' + masked.slice(5);
  }

  return masked;
}

/**
 * Parse date from DD/MM/YYYY to ISO-8601 DateTime
 * @param date - Date string in DD/MM/YYYY format
 * @returns ISO-8601 formatted date string
 */
export function parseDateToISO(date: string): string {
  const cleaned = date.replace(/\D/g, '');
  if (cleaned.length !== 8) return '';

  const day = cleaned.slice(0, 2);
  const month = cleaned.slice(2, 4);
  const year = cleaned.slice(4, 8);

  return `${year}-${month}-${day}T00:00:00.000Z`;
}
