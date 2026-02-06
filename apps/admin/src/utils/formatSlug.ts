export function formatSlug(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
