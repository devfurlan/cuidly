/**
 * CNPJ Validation
 * Single source of truth for CNPJ validation logic
 */

import { z } from 'zod';

/**
 * Validate Brazilian CNPJ
 * @param cnpj - CNPJ string (with or without formatting)
 * @returns true if valid, false otherwise
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

  // Validate first check digit
  let sum = 0;
  let pos = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleanCNPJ.charAt(12))) return false;

  // Validate second check digit
  sum = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleanCNPJ.charAt(13))) return false;

  return true;
}

/**
 * Zod validator for CNPJ
 * Format: XX.XXX.XXX/XXXX-XX
 */
export const cnpjValidator = z
  .string()
  .min(1, 'CNPJ é obrigatório')
  .refine(
    (val) => validateCNPJ(val),
    { message: 'CNPJ inválido' }
  );
