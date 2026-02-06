export function validateImageType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  return allowedTypes.includes(file.type);
}

export function validateImageOrPdfType(file: File): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
  ];
  return allowedTypes.includes(file.type);
}
