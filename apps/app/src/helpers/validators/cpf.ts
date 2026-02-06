/**
 * CPF Validation
 * Single source of truth for CPF validation logic
 */

import { z } from 'zod';

/**
 * Validate Brazilian CPF
 * @param cpf - CPF string (with or without formatting)
 * @returns true if valid, false otherwise
 */
export function validateCPF(cpf: string): boolean {
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '');

  // Check if has 11 digits
  if (cleanCPF.length !== 11) return false;

  // Check if all digits are the same
  if (/^(\d)\1+$/.test(cleanCPF)) return false;

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Zod validator for CPF
 * Format: XXX.XXX.XXX-XX
 */
export const cpfValidator = z
  .string()
  .min(1, 'CPF é obrigatório')
  .refine(
    (val) => validateCPF(val),
    { message: 'CPF inválido' }
  );
