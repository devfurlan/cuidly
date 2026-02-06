/**
 * Parse ISO date string to Brazilian format (DD/MM/YYYY)
 * @param dateString - ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 * @returns Date string in Brazilian format
 */
export function parseDateToBR(dateString: string): string {
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Parse YYYY-MM-DD string to local Date object
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Local Date object
 */
export function parseDateToLocal(dateString: string): Date {
  if (!dateString) {
    throw new Error('A valid date string is required');
  }

  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) {
    throw new Error('Invalid date format. Expected format: YYYY-MM-DD');
  }

  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}
