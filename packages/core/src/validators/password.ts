/**
 * Password Validation
 * Single source of truth for password validation
 */

import { z } from 'zod';

/**
 * Validate password (min 8, 1 uppercase, 1 number)
 * @param password - Password string
 * @returns true if valid
 */
export function validatePassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Zod validator for password
 */
export const passwordValidator = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .refine(
    (val) => /[A-Z]/.test(val),
    { message: 'Senha deve ter pelo menos uma letra maiúscula' }
  )
  .refine(
    (val) => /[0-9]/.test(val),
    { message: 'Senha deve ter pelo menos um número' }
  );
