/**
 * Currency Formatting
 * Single source of truth for currency masking
 */

/**
 * Mask currency (Brazilian Real)
 * @param value - Value string
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  const number = parseInt(digits || '0', 10) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
}

/**
 * Format number as Brazilian Real
 * @param value - Number value in cents or reais
 * @param fromCents - Whether the value is in cents (default: false)
 * @returns Formatted currency string
 */
export function formatBRL(value: number, fromCents = false): string {
  const amount = fromCents ? value / 100 : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}
