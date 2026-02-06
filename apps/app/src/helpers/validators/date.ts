/**
 * Date Validation
 * Single source of truth for date validation
 */

import { z } from 'zod';

/**
 * Zod validator for date in DD/MM/YYYY format
 */
export const dateValidator = z
  .string()
  .min(1, 'Data é obrigatória')
  .refine(
    (val) => {
      const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return false;

      const [, day, month, year] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      return (
        date.getDate() === parseInt(day) &&
        date.getMonth() === parseInt(month) - 1 &&
        date.getFullYear() === parseInt(year)
      );
    },
    { message: 'Data inválida. Use o formato DD/MM/AAAA' }
  );

/**
 * Zod validator for birth date (must be at least 18 years old)
 */
export const birthDateValidator = z
  .string()
  .min(1, 'Data de nascimento é obrigatória')
  .refine(
    (val) => {
      const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return false;

      const [, day, month, year] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      return (
        date.getDate() === parseInt(day) &&
        date.getMonth() === parseInt(month) - 1 &&
        date.getFullYear() === parseInt(year)
      );
    },
    { message: 'Data inválida. Use o formato DD/MM/AAAA' }
  )
  .refine(
    (val) => {
      const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return true; // Let previous validation handle format

      const [, day, month, year] = match;
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const isOldEnough =
        age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && today.getDate() >= birthDate.getDate())));

      return isOldEnough;
    },
    { message: 'Você precisa ter pelo menos 18 anos' }
  );

/**
 * Validate age (18-99 years)
 * @param birthDate - Date object
 * @returns true if age is between 18 and 99
 */
export function validateAge(birthDate: Date): boolean {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  let actualAge = age;
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    actualAge--;
  }

  return actualAge >= 18 && actualAge <= 99;
}
