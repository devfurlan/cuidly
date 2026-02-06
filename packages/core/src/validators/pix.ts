/**
 * PIX Key Validation
 * Single source of truth for PIX key validation
 */

import { validateCPF } from './cpf';
import { validateCNPJ } from './cnpj';
import { validateEmail } from './email';
import { validateBrazilianPhone } from './phone';

/**
 * PIX key validation based on type
 * @param key - PIX key value
 * @param type - PIX key type (CPF, CNPJ, EMAIL, PHONE, EVP)
 * @returns true if valid for the given type
 */
export function validatePixKey(key: string, type: string): boolean {
  switch (type) {
    case 'CPF':
      return validateCPF(key);
    case 'CNPJ':
      return validateCNPJ(key);
    case 'EMAIL':
      return validateEmail(key);
    case 'PHONE':
      return validateBrazilianPhone(key);
    case 'EVP': // Random key (UUID format)
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);
    default:
      return false;
  }
}
