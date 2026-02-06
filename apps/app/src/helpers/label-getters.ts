/**
 * Label Getters
 * Helper functions to translate option values to display labels
 */

import {
  // Nanny options
  EXPERIENCE_YEARS_OPTIONS,
  CHILD_AGE_EXPERIENCE_OPTIONS,
  CERTIFICATION_OPTIONS,
  STRENGTH_OPTIONS,
  CHILD_TYPE_OPTIONS,
  SPECIAL_NEEDS_OPTIONS,
  ACCEPTED_ACTIVITIES_OPTIONS,
  LEGACY_ACTIVITY_LABELS,
  LANGUAGE_OPTIONS,
  CARE_METHODOLOGY_OPTIONS,
  COMFORT_WITH_PETS_OPTIONS,
  PARENT_PRESENCE_OPTIONS,
  JOB_TYPE_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  PERIOD_OPTIONS,
  NANNY_GENDER_OPTIONS,
  REFERENCE_RELATIONSHIP_OPTIONS,
  MAX_TRAVEL_DISTANCE_LABELS,
  NANNY_TYPE_OPTIONS,
  CONTRACT_REGIME_OPTIONS,
  HOURLY_RATE_OPTIONS,
  ACTIVITIES_NOT_ACCEPTED_OPTIONS,
  MAX_CHILDREN_CARE_OPTIONS,
  MARITAL_STATUS_OPTIONS_FEMALE,
  MARITAL_STATUS_OPTIONS_MALE,
  ACCEPTS_HOLIDAY_WORK_OPTIONS,
  // Family options
  CARE_PRIORITIES_OPTIONS,
  VALUES_OPTIONS,
  FAMILY_CARE_METHODOLOGY_OPTIONS,
  FAMILY_LANGUAGE_OPTIONS,
  FAMILY_PARENT_PRESENCE_OPTIONS,
  RESPONSIBLE_GENDER_OPTIONS,
  FAMILY_NANNY_TYPE_OPTIONS,
  FAMILY_CONTRACT_REGIME_OPTIONS,
  NEEDED_DAYS_OPTIONS,
  NEEDED_SHIFTS_OPTIONS,
  MANDATORY_REQUIREMENTS_OPTIONS,
  FAMILY_HOURLY_RATE_OPTIONS,
  DOMESTIC_HELP_OPTIONS,
} from '@/constants/options';

// ==========================================
// Generic helper functions
// ==========================================

type OptionWithLabel = { readonly value: string | number; readonly label: string };

/**
 * Get label from options array by value
 */
export function getLabel<T extends OptionWithLabel>(
  options: readonly T[],
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return '';
  const option = options.find((opt) => opt.value === value);
  return option?.label || String(value);
}

/**
 * Get labels from options array by values
 */
export function getLabels<T extends OptionWithLabel>(
  options: readonly T[],
  values: (string | number)[] | null | undefined
): string[] {
  if (!values || !Array.isArray(values)) return [];
  return values.map((v) => getLabel(options, v));
}

// ==========================================
// Nanny-specific label getters
// ==========================================

export function getExperienceYearsLabel(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const option = EXPERIENCE_YEARS_OPTIONS.find((opt) => opt.value === value);
  if (option) return option.label;
  // Fallback for values > 6 (legacy data)
  return `${value} ano${value !== 1 ? 's' : ''}`;
}

export function getMaxChildrenCareLabel(value: number | null | undefined): string {
  if (!value) return '';
  const option = MAX_CHILDREN_CARE_OPTIONS.find((opt) => opt.value === value);
  return option?.label || `${value} crianças`;
}

export function getMaritalStatusOptions(gender: string | null | undefined) {
  if (gender === 'MALE') {
    return MARITAL_STATUS_OPTIONS_MALE;
  }
  return MARITAL_STATUS_OPTIONS_FEMALE;
}

export function getMaritalStatusLabel(value: string | null | undefined, gender?: string | null): string {
  if (!value) return '';
  const options = getMaritalStatusOptions(gender);
  const option = options.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getAgeRangeLabel(value: string): string {
  return getLabel(CHILD_AGE_EXPERIENCE_OPTIONS, value);
}

export function getAgeRangeLabels(values: string[] | null | undefined): string[] {
  return getLabels(CHILD_AGE_EXPERIENCE_OPTIONS, values);
}

export function getCertificationLabel(value: string): string {
  return getLabel(CERTIFICATION_OPTIONS, value);
}

export function getCertificationLabels(values: string[] | null | undefined): string[] {
  return getLabels(CERTIFICATION_OPTIONS, values);
}

export function getStrengthLabel(value: string): string {
  return getLabel(STRENGTH_OPTIONS, value);
}

export function getStrengthLabels(values: string[] | null | undefined): string[] {
  return getLabels(STRENGTH_OPTIONS, values);
}

export function getChildTypeLabel(value: string): string {
  return getLabel(CHILD_TYPE_OPTIONS, value);
}

export function getChildTypeLabels(values: string[] | null | undefined): string[] {
  return getLabels(CHILD_TYPE_OPTIONS, values);
}

export function getSpecialNeedsLabel(value: string): string {
  return getLabel(SPECIAL_NEEDS_OPTIONS, value);
}

export function getSpecialNeedsLabels(values: string[] | null | undefined): string[] {
  return getLabels(SPECIAL_NEEDS_OPTIONS, values);
}

export function getActivityLabel(value: string): string {
  // First try current options
  const label = getLabel(ACCEPTED_ACTIVITIES_OPTIONS, value);
  // If not found (returns the value itself), check legacy labels
  if (label === value && LEGACY_ACTIVITY_LABELS[value]) {
    return LEGACY_ACTIVITY_LABELS[value];
  }
  return label;
}

export function getActivityLabels(values: string[] | null | undefined): string[] {
  if (!values || !Array.isArray(values)) return [];
  return values.map((v) => getActivityLabel(v));
}

export function getLanguageLabel(value: string): string {
  return getLabel(LANGUAGE_OPTIONS, value);
}

export function getLanguageLabels(values: string[] | null | undefined): string[] {
  return getLabels(LANGUAGE_OPTIONS, values);
}

export function getCareMethodologyLabel(value: string | null | undefined): string {
  return getLabel(CARE_METHODOLOGY_OPTIONS, value);
}

export function getComfortWithPetsLabel(value: string | null | undefined): string {
  return getLabel(COMFORT_WITH_PETS_OPTIONS, value);
}

export function getParentPresenceLabel(value: string | null | undefined): string {
  return getLabel(PARENT_PRESENCE_OPTIONS, value);
}

export function getJobTypeLabel(value: string): string {
  return getLabel(JOB_TYPE_OPTIONS, value);
}

export function getJobTypeLabels(values: string[] | null | undefined): string[] {
  return getLabels(JOB_TYPE_OPTIONS, values);
}

export function getContractTypeLabel(value: string): string {
  return getLabel(CONTRACT_TYPE_OPTIONS, value);
}

export function getContractTypeLabels(values: string[] | null | undefined): string[] {
  return getLabels(CONTRACT_TYPE_OPTIONS, values);
}

export function getPeriodLabel(value: string): string {
  return getLabel(PERIOD_OPTIONS, value);
}

export function getPeriodLabels(values: string[] | null | undefined): string[] {
  return getLabels(PERIOD_OPTIONS, values);
}

export function getGenderLabel(value: string | null | undefined): string {
  return getLabel(NANNY_GENDER_OPTIONS, value);
}

export function getReferenceRelationshipLabel(value: string | null | undefined): string {
  return getLabel(REFERENCE_RELATIONSHIP_OPTIONS, value);
}

export function getMaxTravelDistanceLabel(value: string | null | undefined): string {
  if (!value) return '';
  return MAX_TRAVEL_DISTANCE_LABELS[value] || value;
}

export function getNannyTypeLabel(value: string): string {
  return getLabel(NANNY_TYPE_OPTIONS, value);
}

export function getNannyTypeLabels(values: string[] | null | undefined): string[] {
  return getLabels(NANNY_TYPE_OPTIONS, values);
}

export function getContractRegimeLabel(value: string): string {
  return getLabel(CONTRACT_REGIME_OPTIONS, value);
}

export function getContractRegimeLabels(values: string[] | null | undefined): string[] {
  return getLabels(CONTRACT_REGIME_OPTIONS, values);
}

export function getHourlyRateRangeLabel(value: string | null | undefined): string {
  return getLabel(HOURLY_RATE_OPTIONS, value);
}

export function getActivityNotAcceptedLabel(value: string): string {
  return getLabel(ACTIVITIES_NOT_ACCEPTED_OPTIONS, value);
}

export function getActivityNotAcceptedLabels(values: string[] | null | undefined): string[] {
  return getLabels(ACTIVITIES_NOT_ACCEPTED_OPTIONS, values);
}

export function getAcceptsHolidayWorkLabel(value: string | null | undefined): string {
  return getLabel(ACCEPTS_HOLIDAY_WORK_OPTIONS, value);
}

// ==========================================
// Family-specific label getters
// ==========================================

export function getCarePriorityLabel(value: string): string {
  const option = CARE_PRIORITIES_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getCarePriorityLabels(values: string[] | null | undefined): string[] {
  if (!values) return [];
  return values.map(getCarePriorityLabel);
}

export function getValuesInNannyLabel(value: string): string {
  const option = VALUES_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getValuesInNannyLabels(values: string[] | null | undefined): string[] {
  if (!values) return [];
  return values.map(getValuesInNannyLabel);
}

export function getFamilyCareMethodologyLabel(value: string | null | undefined): string {
  if (!value) return '';
  const option = FAMILY_CARE_METHODOLOGY_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getFamilyLanguageLabel(value: string): string {
  const option = FAMILY_LANGUAGE_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getFamilyLanguageLabels(values: string[] | null | undefined): string[] {
  if (!values) return [];
  return values.map(getFamilyLanguageLabel);
}

export function getFamilyParentPresenceLabel(value: string | null | undefined): string {
  if (!value) return '';
  const option = FAMILY_PARENT_PRESENCE_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getResponsibleGenderLabel(value: string | null | undefined): string {
  if (!value) return '';
  const option = RESPONSIBLE_GENDER_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getFamilyNannyTypeLabel(value: string): string {
  const option = FAMILY_NANNY_TYPE_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getFamilyNannyTypeLabels(values: string[] | null | undefined): string[] {
  if (!values) return [];
  return values.map(getFamilyNannyTypeLabel);
}

export function getFamilyContractRegimeLabel(value: string): string {
  const option = FAMILY_CONTRACT_REGIME_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getFamilyContractRegimeLabels(values: string[] | null | undefined): string[] {
  if (!values) return [];
  return values.map(getFamilyContractRegimeLabel);
}

export function getNeededDayLabel(value: string): string {
  const option = NEEDED_DAYS_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getNeededDayLabels(values: string[] | null | undefined): string[] {
  if (!values) return [];
  return values.map(getNeededDayLabel);
}

export function getNeededShiftLabel(value: string): string {
  const option = NEEDED_SHIFTS_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getNeededShiftLabels(values: string[] | null | undefined): string[] {
  if (!values) return [];
  return values.map(getNeededShiftLabel);
}

export function getMandatoryRequirementLabel(value: string): string {
  const option = MANDATORY_REQUIREMENTS_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getMandatoryRequirementLabels(values: string[] | null | undefined): string[] {
  if (!values) return [];
  return values.map(getMandatoryRequirementLabel);
}

export function getFamilyHourlyRateLabel(value: string | null | undefined): string {
  if (!value) return '';
  const option = FAMILY_HOURLY_RATE_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getDomesticHelpLabel(value: string): string {
  const option = DOMESTIC_HELP_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getDomesticHelpLabels(values: string[] | null | undefined): string[] {
  if (!values) return [];
  return values.map(getDomesticHelpLabel);
}

// ==========================================
// Age calculation helpers (from family schema)
// ==========================================

export function calculateAge(birthDate: Date | string): { years: number; months: number } {
  const birth = new Date(birthDate);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months };
}

export function formatAge(birthDate: Date | string): string {
  const { years, months } = calculateAge(birthDate);
  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  if (years < 2) {
    return `${years} ano${months > 0 ? ` e ${months} ${months === 1 ? 'mês' : 'meses'}` : ''}`;
  }
  return `${years} anos`;
}
