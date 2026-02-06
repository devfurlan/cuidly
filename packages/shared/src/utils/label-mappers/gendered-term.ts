/**
 * Get gendered term based on gender value
 * Handles Portuguese grammatical gender variations
 *
 * @param gender - Gender value (MALE, FEMALE, or other)
 * @param maleTerm - Term for male
 * @param femaleTerm - Term for female
 * @returns Appropriate gendered term
 */
export function getGenderedTerm(
  gender: string | null | undefined,
  maleTerm: string,
  femaleTerm: string
): string {
  switch (gender) {
    case 'MALE':
      return maleTerm;
    case 'FEMALE':
      return femaleTerm;
    default: {
      if (maleTerm === femaleTerm) {
        return maleTerm;
      }

      if (femaleTerm === `${maleTerm}a`) {
        return `${maleTerm}(a)`;
      }

      if (
        maleTerm.endsWith('o') &&
        femaleTerm === `${maleTerm.slice(0, -1)}a`
      ) {
        return `${maleTerm.slice(0, -1)}o(a)`;
      }

      return `${maleTerm}/${femaleTerm}`;
    }
  }
}
