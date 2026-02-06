/**
 * Capitalize the first letter of a string
 * @param string - String to capitalize
 * @returns String with first letter uppercase and rest lowercase
 */
export function capitalizeFirstLetter(string: string): string {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
