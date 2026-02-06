/**
 * Miscellaneous Validators
 * Additional validation utilities
 */

import { z } from 'zod';

/**
 * Validate full name (at least 2 words)
 * @param name - Name string
 * @returns true if valid full name
 */
export function validateFullName(name: string): boolean {
  const words = name.trim().split(/\s+/);
  return words.length >= 2 && words.every((word) => word.length > 0);
}

/**
 * Validate Brazilian state
 * @param state - State abbreviation (e.g., 'SP')
 * @returns true if valid Brazilian state
 */
export function validateBrazilianState(state: string): boolean {
  const validStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
  ];
  return validStates.includes(state.toUpperCase());
}

/**
 * Validate COREN format (basic format check)
 * Format: numbers followed by state (e.g., 123456-SP)
 * @param coren - COREN string
 * @returns true if valid format
 */
export function validateCorenFormat(coren: string): boolean {
  return /^\d{4,7}-[A-Z]{2}$/.test(coren);
}

/**
 * Validate required string field
 */
export function requiredString(fieldName: string) {
  return z.string().min(1, `${fieldName} é obrigatório`);
}

/**
 * Validate required string with max length
 */
export function requiredStringWithMax(fieldName: string, maxLength: number) {
  return z
    .string()
    .min(1, `${fieldName} é obrigatório`)
    .max(maxLength, `${fieldName} deve ter no máximo ${maxLength} caracteres`);
}

/**
 * Validate optional string with max length
 */
export function optionalStringWithMax(maxLength: number) {
  return z.string().max(maxLength, `Máximo de ${maxLength} caracteres`).optional();
}

/**
 * Validate array with min and max selections
 */
export function arrayWithLimits(
  fieldName: string,
  minSelections: number = 1,
  maxSelections?: number
) {
  let schema = z
    .array(z.string())
    .min(minSelections, `Selecione pelo menos ${minSelections} ${fieldName}`);

  if (maxSelections) {
    schema = schema.max(maxSelections, `Selecione no máximo ${maxSelections} ${fieldName}`);
  }

  return schema;
}

/**
 * Validate number within range
 */
export function numberInRange(fieldName: string, min: number, max: number) {
  return z
    .number()
    .min(min, `${fieldName} deve ser pelo menos ${min}`)
    .max(max, `${fieldName} deve ser no máximo ${max}`);
}

/**
 * Validate currency value (Brazilian Real)
 */
export const currencyValidator = z
  .number()
  .min(0, 'Valor deve ser positivo')
  .refine(
    (val) => Number.isFinite(val),
    { message: 'Valor inválido' }
  );
