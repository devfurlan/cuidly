/**
 * Document Formatting (CPF, CNPJ)
 * Single source of truth for document masking
 */

/**
 * Mask CPF: XXX.XXX.XXX-XX
 * @param cpf - CPF string
 * @returns Formatted CPF string
 */
export function maskCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '').slice(0, 11);
  let masked = cleaned;

  if (cleaned.length > 3) {
    masked = cleaned.slice(0, 3) + '.' + cleaned.slice(3);
  }
  if (cleaned.length > 6) {
    masked = masked.slice(0, 7) + '.' + masked.slice(7);
  }
  if (cleaned.length > 9) {
    masked = masked.slice(0, 11) + '-' + masked.slice(11);
  }

  return masked;
}

/**
 * Mask CNPJ: XX.XXX.XXX/XXXX-XX
 * @param cnpj - CNPJ string
 * @returns Formatted CNPJ string
 */
export function maskCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '').slice(0, 14);
  let masked = cleaned;

  if (cleaned.length > 2) {
    masked = cleaned.slice(0, 2) + '.' + cleaned.slice(2);
  }
  if (cleaned.length > 5) {
    masked = masked.slice(0, 6) + '.' + masked.slice(6);
  }
  if (cleaned.length > 8) {
    masked = masked.slice(0, 10) + '/' + masked.slice(10);
  }
  if (cleaned.length > 12) {
    masked = masked.slice(0, 15) + '-' + masked.slice(15);
  }

  return masked;
}
