/**
 * Phone Validation and Normalization
 * Single source of truth for Brazilian phone validation
 */

import { z } from 'zod';

/**
 * Validate Brazilian phone number
 * @param phone - Phone string (with or without formatting)
 * @returns true if valid (10 or 11 digits), false otherwise
 */
export function validateBrazilianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');

  // Remove +55 if present
  const phoneDigits = cleaned.startsWith('55') && cleaned.length > 11
    ? cleaned.substring(2)
    : cleaned;

  // Brazilian phone: 10 digits (landline) or 11 digits (mobile with 9)
  return phoneDigits.length === 10 || phoneDigits.length === 11;
}

/**
 * Validate E.164 format
 * @param phone - Phone string
 * @returns true if valid E.164 format
 */
export function validateE164Phone(phone: string): boolean {
  return /^\+55\d{10,11}$/.test(phone);
}

/**
 * Normalize phone to E.164 format
 * @param phone - Phone string
 * @param countryCode - Country code (default: 55 for Brazil)
 * @returns E.164 formatted phone string
 */
export function normalizePhoneE164(phone: string, countryCode = '55'): string {
  const cleaned = phone.replace(/\D/g, '');

  // If already has country code, return as is
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return `+${cleaned}`;
  }

  // Remove country code if present
  const phoneDigits = cleaned.startsWith('55') ? cleaned.substring(2) : cleaned;

  return `+${countryCode}${phoneDigits}`;
}

/**
 * Convert visual input to E.164 format for storage
 * @param phone - Phone string
 * @returns E.164 formatted phone string
 */
export function phoneToE164(phone: string): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  // If already has +55, return as is
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return `+${cleaned}`;
  }

  // Remove 55 if present and add it back
  const phoneDigits = cleaned.startsWith('55') ? cleaned.substring(2) : cleaned;

  return `+55${phoneDigits}`;
}

/**
 * Convert phone to PIX key format (without '+')
 * PIX phone keys should be in format: 5511999887766
 * @param phone - Phone string
 * @returns PIX formatted phone string
 */
export function phoneToPixFormat(phone: string): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  // If already starts with 55, return as is
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return cleaned;
  }

  // Remove 55 if present and add it back (without '+')
  const phoneDigits = cleaned.startsWith('55') ? cleaned.substring(2) : cleaned;

  return `55${phoneDigits}`;
}

/**
 * Zod validator for Brazilian phone
 * Format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 */
export const phoneValidator = z
  .string()
  .min(1, 'Telefone é obrigatório')
  .refine(
    (val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 11;
    },
    { message: 'Telefone inválido. Use o formato (XX) XXXXX-XXXX' }
  );
