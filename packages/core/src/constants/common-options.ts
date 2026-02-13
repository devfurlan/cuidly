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

// Legacy hourly rate labels (backwards compatibility with old database values)
export const LEGACY_HOURLY_RATE_LABELS: Record<string, string> = {
  // Legacy nanny values
  UP_TO_20: 'Até R$ 20/h',
  FROM_21_TO_30: 'R$ 21–30/h',
  FROM_31_TO_40: 'R$ 31–40/h',
  FROM_41_TO_50: 'R$ 41–50/h',
  FROM_51_TO_70: 'R$ 51–70/h',
  FROM_71_TO_100: 'R$ 71–100/h',
  OVER_100: 'Acima de R$ 100/h',
  // Legacy family values
  '20_TO_30': 'R$ 20–30/h',
  '30_TO_40': 'R$ 30–40/h',
  '40_TO_50': 'R$ 40–50/h',
  ABOVE_50: 'Acima de R$ 50/h',
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

// Gender options (generic)
export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Feminino' },
  { value: 'OTHER', label: 'Outro' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefiro não dizer' },
] as const;

// Days of the week
export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira', short: 'Seg' },
  { key: 'tuesday', label: 'Terça-feira', short: 'Ter' },
  { key: 'wednesday', label: 'Quarta-feira', short: 'Qua' },
  { key: 'thursday', label: 'Quinta-feira', short: 'Qui' },
  { key: 'friday', label: 'Sexta-feira', short: 'Sex' },
  { key: 'saturday', label: 'Sábado', short: 'Sáb' },
  { key: 'sunday', label: 'Domingo', short: 'Dom' },
] as const;

// Time options for schedule
export const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00',
] as const;

// Period options
export const PERIOD_OPTIONS = [
  { value: 'MORNING', label: 'Manhã', description: '6h - 12h' },
  { value: 'AFTERNOON', label: 'Tarde', description: '12h - 18h' },
  { value: 'NIGHT', label: 'Noite', description: '18h - 22h' },
  { value: 'OVERNIGHT', label: 'Pernoite', description: 'Dormir no local' },
] as const;

// Language options
export const LANGUAGE_OPTIONS = [
  { value: 'PORTUGUESE', label: 'Português' },
  { value: 'ENGLISH', label: 'Inglês' },
  { value: 'SPANISH', label: 'Espanhol' },
  { value: 'LIBRAS', label: 'Libras' },
  { value: 'OTHER', label: 'Outro' },
] as const;
