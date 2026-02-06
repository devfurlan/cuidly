/**
 * Phone Formatting
 * Single source of truth for phone masking and formatting
 */

/**
 * Mask phone for visual display: (XX) 9XXXX-XXXX or (XX) XXXX-XXXX
 * Distinguishes between mobile (11 digits) and landline (10 digits)
 * @param phone - Phone string
 * @returns Formatted phone string
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '').slice(0, 11);
  let masked = cleaned;

  if (cleaned.length > 0) {
    masked = '(' + cleaned;
  }
  if (cleaned.length > 2) {
    masked = masked.slice(0, 3) + ') ' + masked.slice(3);
  }
  if (cleaned.length > 7) {
    // Check if it's mobile (11 digits) or if the third digit is 9
    if (cleaned.length >= 10 && cleaned[2] === '9') {
      // Mobile: (XX) 9XXXX-XXXX
      masked = masked.slice(0, 10) + '-' + masked.slice(10);
    } else if (cleaned.length === 10 || cleaned.length === 11) {
      // Landline: (XX) XXXX-XXXX
      masked = masked.slice(0, 9) + '-' + masked.slice(9);
    }
  }

  return masked;
}

/**
 * Format phone number from database (E.164) for visual display
 * @param phone - Phone string in E.164 format
 * @returns Formatted phone string for display
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';

  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 55 (Brazil country code), remove it
  if (cleaned.startsWith('55') && cleaned.length > 11) {
    cleaned = cleaned.substring(2);
  }

  // Apply visual mask
  return maskPhone(cleaned);
}
