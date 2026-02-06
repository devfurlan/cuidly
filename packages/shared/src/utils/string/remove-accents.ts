/**
 * Remove accents/diacritics from a string and convert to lowercase
 * @param string - String with accents
 * @returns Lowercase string without accents
 */
export function removeAccents(string: string): string {
  return string
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default removeAccents;
