/**
 * Address Formatting (CEP)
 * Single source of truth for address masking
 */

/**
 * Mask CEP: XXXXX-XXX
 * @param cep - CEP string
 * @returns Formatted CEP string
 */
export function maskCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '').slice(0, 8);
  let masked = cleaned;

  if (cleaned.length > 5) {
    masked = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
  }

  return masked;
}
