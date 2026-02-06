/**
 * Apply alphanumeric mask to a value
 * @param value - Value to mask
 * @param mask - Mask pattern (# for digit, A for letter)
 * @returns Masked value
 */
export function maskAlphanumeric(value: string, mask: string): string {
  let i = 0;
  if (!value) {
    return '';
  }
  const alphanumeric = value.replace(/[^a-zA-Z0-9]/g, '');

  return mask.split('').reduce((acc, char) => {
    if (char === '#') {
      if (alphanumeric[i] && /\d/.test(alphanumeric[i])) {
        acc += alphanumeric[i++];
      }
    } else if (char === 'A') {
      if (alphanumeric[i] && /[a-zA-Z]/.test(alphanumeric[i])) {
        acc += alphanumeric[i++];
      }
    } else if (alphanumeric[i]) {
      acc += char;
    }
    return acc;
  }, '');
}

/**
 * Apply document mask based on document type
 * @param identifier - Document number
 * @param documentType - Type of document (CPF, CNPJ, CNH, COREN)
 * @returns Masked document number
 */
export function applyDocumentMask(
  identifier: string,
  documentType: string
): string {
  switch (documentType) {
    case 'CNH':
      return maskAlphanumeric(identifier, '###########');
    case 'CPF':
      return maskAlphanumeric(identifier, '###.###.###-##');
    case 'CNPJ':
      return maskAlphanumeric(identifier, '##.###.###/####-##');
    case 'COREN':
      return maskAlphanumeric(identifier, '###.###-###');
    default:
      return identifier;
  }
}
