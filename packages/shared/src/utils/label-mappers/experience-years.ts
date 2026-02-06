/**
 * Experience years options
 */
export const EXPERIENCE_YEARS_OPTIONS = [
  { value: -1, label: 'Sem experiência' },
  { value: 0, label: 'Menos de 1 ano' },
  { value: 1, label: '1 ano' },
  { value: 2, label: '2 anos' },
  { value: 3, label: '3 anos' },
  { value: 4, label: '4 anos' },
  { value: 5, label: '5 anos' },
  { value: 6, label: 'Mais de 5 anos' },
] as const;

/**
 * Get experience years label in Portuguese
 * @param value - Years of experience
 * @returns Portuguese label
 */
export function getExperienceYearsLabel(
  value: number | null | undefined
): string {
  if (value === null || value === undefined) return '-';
  const option = EXPERIENCE_YEARS_OPTIONS.find((opt) => opt.value === value);
  if (option) return option.label;
  // Fallback for values > 6 (legacy data)
  return `${value} ano${value !== 1 ? 's' : ''}`;
}
