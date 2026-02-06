/**
 * Common Options Constants
 * Shared option arrays used across nanny and family flows
 */

// Hourly rate options (used by both nanny and family)
export const HOURLY_RATE_OPTIONS = [
  { value: 'UP_TO_25', label: 'Até R$ 25/h' },
  { value: 'FROM_26_TO_35', label: 'R$ 26–35/h' },
  { value: 'FROM_36_TO_45', label: 'R$ 36–45/h' },
  { value: 'FROM_46_TO_60', label: 'R$ 46–60/h' },
  { value: 'FROM_61_TO_80', label: 'R$ 61–80/h' },
  { value: 'OVER_80', label: 'Acima de R$ 80/h' },
] as const;

// Hourly rate labels for display
export const HOURLY_RATE_LABELS: Record<string, string> = {
  UP_TO_25: 'Até R$ 25/h',
  FROM_26_TO_35: 'R$ 26–35/h',
  FROM_36_TO_45: 'R$ 36–45/h',
  FROM_46_TO_60: 'R$ 46–60/h',
  FROM_61_TO_80: 'R$ 61–80/h',
  OVER_80: 'Acima de R$ 80/h',
};

// Special needs options - shared between nannies (experience) and children (needs)
export const SPECIAL_NEEDS_OPTIONS = [
  { value: 'AUTISM', label: 'Autismo (TEA)' },
  { value: 'ADHD', label: 'TDAH' },
  { value: 'DOWN_SYNDROME', label: 'Síndrome de Down' },
  { value: 'CEREBRAL_PALSY', label: 'Paralisia cerebral' },
  { value: 'PHYSICAL_DISABILITY', label: 'Deficiência física' },
  { value: 'VISUAL_IMPAIRMENT', label: 'Deficiência visual' },
  { value: 'HEARING_IMPAIRMENT', label: 'Deficiência auditiva' },
  { value: 'CHRONIC_ILLNESS', label: 'Doenças crônicas' },
  { value: 'FOOD_ALLERGIES', label: 'Alergias alimentares graves' },
  { value: 'OTHER', label: 'Outras necessidades especiais' },
] as const;
