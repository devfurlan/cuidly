/**
 * Get gender label in Portuguese
 * @param gender - Gender value (MALE, FEMALE, OTHERWISE)
 * @returns Portuguese label
 */
export function getGenderLabel(gender: string | null): string {
  switch (gender) {
    case 'MALE':
      return 'Masculino';
    case 'FEMALE':
      return 'Feminino';
    case 'OTHERWISE':
      return 'Outro';
    default:
      return '';
  }
}
