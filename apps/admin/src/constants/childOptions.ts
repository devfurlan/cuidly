/**
 * Child Form Options
 * Constants for child profile forms
 */

// Care priorities options
export const CARE_PRIORITIES_OPTIONS = [
  { value: 'ATTENTION_PATIENCE', label: 'Atenção e paciência no dia a dia' },
  { value: 'PLAY_STIMULATION', label: 'Brincadeiras e estímulo criativo' },
  { value: 'STRUCTURED_ROUTINE', label: 'Rotina bem organizada' },
  { value: 'SAFETY_SUPERVISION', label: 'Segurança e supervisão constante' },
  { value: 'SCHOOL_SUPPORT', label: 'Apoio nas tarefas escolares' },
  { value: 'AUTONOMY', label: 'Autonomia e incentivo à independência' },
  { value: 'EMOTIONAL_CARE', label: 'Acolhimento emocional' },
  { value: 'HIGH_ENERGY', label: 'Energia para acompanhar a criança' },
  { value: 'RESPECTFUL_DISCIPLINE', label: 'Disciplina com respeito' },
  { value: 'BABY_CARE', label: 'Cuidados com bebês e recém-nascidos' },
  { value: 'SLEEP_ROUTINE', label: 'Apoio na rotina de sono' },
  { value: 'FEEDING_SUPPORT', label: 'Apoio na alimentação do bebê' },
] as const;

// Helper function to get care priority label
export function getCarePriorityLabel(value: string): string {
  const option = CARE_PRIORITIES_OPTIONS.find((o) => o.value === value);
  return option?.label || value;
}

// Special needs types
export const SPECIAL_NEEDS_TYPES = [
  { value: 'autismo', label: 'Transtorno do Espectro Autista (TEA)' },
  { value: 'tdah', label: 'TDAH' },
  { value: 'down', label: 'Síndrome de Down' },
  { value: 'deficiencia_visual', label: 'Deficiência Visual' },
  { value: 'deficiencia_auditiva', label: 'Deficiência Auditiva' },
  { value: 'deficiencia_fisica', label: 'Deficiência Física' },
  { value: 'alergia_alimentar', label: 'Alergia Alimentar Grave' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'epilepsia', label: 'Epilepsia' },
  { value: 'outro', label: 'Outro' },
] as const;

// Age options (0-18 years)
export const CHILD_AGE_OPTIONS = Array.from({ length: 19 }, (_, i) => ({
  value: i.toString(),
  label: i === 0 ? 'Menos de 1 ano' : i === 1 ? '1 ano' : `${i} anos`,
}));

// Gender options
export const CHILD_GENDER_OPTIONS = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Feminino' },
  { value: 'OTHER', label: 'Outro' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefiro não informar' },
] as const;
