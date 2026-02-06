/**
 * Formatters Index
 * Re-exports all formatters from a single location
 */

// Phone
export { maskPhone, formatPhoneDisplay } from './phone';

// Re-export phone conversion functions from validators (they're formatters conceptually)
export { phoneToE164, phoneToPixFormat, normalizePhoneE164 } from '../validators/phone';

// Document (CPF, CNPJ)
export { maskCPF, maskCNPJ } from './document';

// Address (CEP)
export { maskCEP } from './address';

// Date
export { maskDate, parseDateToISO } from './date';

// Currency
export { maskCurrency, formatBRL } from './currency';
