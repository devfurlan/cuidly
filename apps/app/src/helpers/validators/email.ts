/**
 * Email Validation
 * Single source of truth for email validation
 */

import { z } from 'zod';

/**
 * Validate email address
 * @param email - Email string
 * @returns true if valid email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Zod validator for email
 */
export const emailValidator = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Email inválido');
