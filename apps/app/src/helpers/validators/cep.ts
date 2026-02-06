/**
 * CEP (Brazilian Postal Code) Validation
 * Single source of truth for CEP validation
 */

import { z } from 'zod';

/**
 * Validate Brazilian CEP
 * @param cep - CEP string (with or without formatting)
 * @returns true if valid (8 digits), false otherwise
 */
export function validateCEP(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
}

/**
 * Zod validator for CEP
 * Format: XXXXX-XXX
 */
export const cepValidator = z
  .string()
  .min(1, 'CEP é obrigatório')
  .refine(
    (val) => validateCEP(val),
    { message: 'CEP inválido. Use o formato XXXXX-XXX' }
  );
