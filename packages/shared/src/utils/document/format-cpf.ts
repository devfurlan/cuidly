/**
 * Format CPF number with dots and dash
 * @param cpf - CPF number (11 digits)
 * @returns Formatted CPF like "123.456.789-01"
 */
export function formatCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}
