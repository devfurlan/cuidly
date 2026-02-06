/**
 * Validators Index
 * Re-exports all validators from a single location
 */

// CPF
export { validateCPF, cpfValidator } from './cpf';

// CNPJ
export { validateCNPJ, cnpjValidator } from './cnpj';

// Phone
export {
  validateBrazilianPhone,
  validateE164Phone,
  normalizePhoneE164,
  phoneToE164,
  phoneToPixFormat,
  phoneValidator,
} from './phone';

// CEP
export { validateCEP, cepValidator } from './cep';

// Email
export { validateEmail, emailValidator } from './email';

// Date
export { dateValidator, birthDateValidator, validateAge } from './date';

// Password
export { validatePassword, passwordValidator } from './password';

// PIX
export { validatePixKey } from './pix';

// Misc
export {
  validateFullName,
  validateBrazilianState,
  validateCorenFormat,
  requiredString,
  requiredStringWithMax,
  optionalStringWithMax,
  arrayWithLimits,
  numberInRange,
  currencyValidator,
} from './misc';
