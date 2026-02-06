import { maskAlphanumeric } from './apply-mask';
import { formatCpf } from './format-cpf';

/**
 * Format PIX key for database storage
 *
 * IMPORTANT: For PHONE type keys, the Brazilian PIX format is:
 * - WITHOUT the '+' prefix
 * - WITH country code (55) + DDD + number
 * - Example: 5511999887766
 *
 * This differs from E.164 format used for regular phones (+5511999887766)
 *
 * @param pixType - Type of PIX key (PHONE, CPF, CNPJ, EMAIL, etc.)
 * @param pixKey - PIX key value
 * @returns Formatted key for database storage
 */
export function formatPixKeyForDatabase(
  pixType: string | undefined,
  pixKey: string | undefined
): string {
  if (!pixKey) return '';

  const trimmedKey = pixKey.trim();

  switch (pixType) {
    case 'PHONE': {
      const digitsOnly = trimmedKey.replace(/\D/g, '');

      if (digitsOnly.startsWith('55')) {
        return digitsOnly;
      } else {
        return `55${digitsOnly}`;
      }
    }

    case 'CPF':
    case 'CNPJ': {
      return trimmedKey.replace(/\D/g, '');
    }

    case 'EMAIL': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(trimmedKey) ? trimmedKey : '';
    }

    default:
      return trimmedKey;
  }
}

/**
 * Format PIX key for display
 *
 * For PHONE type keys:
 * - In DB: 5511999887766 (without '+')
 * - Display: (11) 99988-7766 (Brazilian visual format)
 *
 * @param pixType - Type of PIX key
 * @param pixKey - PIX key value
 * @returns Formatted key for display
 */
export function formatPixKeyForDisplay(
  pixType: string | null,
  pixKey: string | null
): string {
  if (!pixKey || !pixType) return '';

  const trimmedKey = pixKey.trim();

  switch (pixType) {
    case 'PHONE': {
      const digitsOnly = trimmedKey.replace(/\D/g, '');
      const phoneDigits = digitsOnly.startsWith('55')
        ? digitsOnly.substring(2)
        : digitsOnly;

      return maskAlphanumeric(phoneDigits, '(##) #####-####');
    }

    case 'CPF': {
      return formatCpf(trimmedKey);
    }

    case 'CNPJ': {
      return maskAlphanumeric(trimmedKey, '##.###.###/####-##');
    }

    default:
      return trimmedKey;
  }
}
