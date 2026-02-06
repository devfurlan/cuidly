/**
 * Family Form Options
 * Constants for family registration and editing forms
 */

// Housing type options
export const HOUSING_TYPE_OPTIONS = [
  { value: 'HOUSE', label: 'Casa' },
  { value: 'APARTMENT_NO_ELEVATOR', label: 'Apartamento sem elevador' },
  { value: 'APARTMENT_WITH_ELEVATOR', label: 'Apartamento com elevador' },
  { value: 'CONDOMINIUM', label: 'Condominio fechado' },
] as const;

// Parent presence options
export const PARENT_PRESENCE_OPTIONS = [
  { value: 'ALWAYS', label: 'Sempre presente' },
  { value: 'SOMETIMES', label: 'As vezes presente' },
  { value: 'RARELY', label: 'Raramente presente' },
  { value: 'NEVER', label: 'Nunca presente' },
] as const;

// Nanny gender preference options
export const NANNY_GENDER_PREFERENCE_OPTIONS = [
  { value: 'FEMALE', label: 'Feminino' },
  { value: 'MALE', label: 'Masculino' },
  { value: 'NO_PREFERENCE', label: 'Sem preferencia' },
] as const;

// Nanny age preference options
export const NANNY_AGE_PREFERENCE_OPTIONS = [
  { value: 'AGE_18_25', label: '18 a 25 anos' },
  { value: 'AGE_26_35', label: '26 a 35 anos' },
  { value: 'AGE_36_50', label: '36 a 50 anos' },
  { value: 'AGE_50_PLUS', label: 'Mais de 50 anos' },
  { value: 'NO_PREFERENCE', label: 'Sem preferencia' },
] as const;

// Values in nanny options
export const VALUES_IN_NANNY_OPTIONS = [
  { value: 'paciencia', label: 'Paciencia' },
  { value: 'proatividade', label: 'Proatividade' },
  { value: 'organizacao', label: 'Organizacao' },
  { value: 'carinho', label: 'Carinho' },
  { value: 'experiencia', label: 'Experiencia comprovada' },
  { value: 'referencias', label: 'Boas referencias' },
  { value: 'pontualidade', label: 'Pontualidade' },
  { value: 'flexibilidade', label: 'Flexibilidade' },
  { value: 'comunicacao', label: 'Boa comunicacao' },
  { value: 'firmeza', label: 'Firmeza com limites' },
] as const;

// Care methodology options for family
export const FAMILY_CARE_METHODOLOGY_OPTIONS = [
  { value: 'montessori', label: 'Montessori' },
  { value: 'waldorf', label: 'Waldorf' },
  { value: 'tradicional', label: 'Tradicional' },
  { value: 'livre', label: 'Criacao livre' },
  { value: 'mista', label: 'Mista/Flexivel' },
  { value: 'sem_preferencia', label: 'Sem preferencia' },
] as const;

// Languages needed options
export const FAMILY_LANGUAGES_OPTIONS = [
  { value: 'portugues', label: 'Portugues' },
  { value: 'ingles', label: 'Ingles' },
  { value: 'espanhol', label: 'Espanhol' },
  { value: 'frances', label: 'Frances' },
  { value: 'alemao', label: 'Alemao' },
  { value: 'italiano', label: 'Italiano' },
  { value: 'libras', label: 'LIBRAS' },
] as const;

// House rules options
export const HOUSE_RULES_OPTIONS = [
  { value: 'sem_celular', label: 'Uso limitado de celular' },
  { value: 'sem_tv', label: 'Tempo limitado de TV' },
  { value: 'alimentacao_saudavel', label: 'Alimentacao saudavel' },
  { value: 'rotina_fixa', label: 'Seguir rotina estabelecida' },
  { value: 'hora_dormir', label: 'Respeitar hora de dormir' },
  { value: 'atividades_ar_livre', label: 'Atividades ao ar livre diarias' },
  { value: 'leitura', label: 'Incentivar leitura' },
  { value: 'sem_doces', label: 'Restringir doces' },
] as const;

// Domestic help expected options
export const DOMESTIC_HELP_EXPECTED_OPTIONS = [
  { value: 'limpeza_quarto', label: 'Limpeza do quarto da crianca' },
  { value: 'preparo_refeicoes', label: 'Preparo de refeicoes' },
  { value: 'lavar_roupas', label: 'Lavar roupas da crianca' },
  { value: 'organizar_brinquedos', label: 'Organizar brinquedos' },
  { value: 'dar_banho', label: 'Dar banho' },
  { value: 'ajudar_licao', label: 'Ajudar com licao de casa' },
  { value: 'levar_escola', label: 'Levar/buscar na escola' },
  { value: 'levar_atividades', label: 'Levar a atividades extras' },
  { value: 'nenhuma', label: 'Nenhuma ajuda domestica' },
] as const;

// Responsible gender options
export const RESPONSIBLE_GENDER_OPTIONS = [
  { value: 'FEMALE', label: 'Feminino' },
  { value: 'MALE', label: 'Masculino' },
  { value: 'OTHER', label: 'Outro' },
] as const;

// Nanny type options (what type of nanny the family is looking for)
export const FAMILY_NANNY_TYPE_OPTIONS = [
  { value: 'FOLGUISTA', label: 'Folguista' },
  { value: 'DIARISTA', label: 'Diarista' },
  { value: 'MENSALISTA', label: 'Mensalista' },
] as const;

// Contract regime options (what contract type the family accepts)
export const FAMILY_CONTRACT_REGIME_OPTIONS = [
  { value: 'AUTONOMA', label: 'Autonoma' },
  { value: 'PJ', label: 'PJ' },
  { value: 'CLT', label: 'CLT' },
] as const;

// Helper functions for labels
export function getResponsibleGenderLabel(value: string | null | undefined): string {
  if (!value) return '';
  const option = RESPONSIBLE_GENDER_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getFamilyNannyTypeLabel(value: string | null | undefined): string {
  if (!value) return '';
  const option = FAMILY_NANNY_TYPE_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getFamilyContractRegimeLabel(value: string | null | undefined): string {
  if (!value) return '';
  const option = FAMILY_CONTRACT_REGIME_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}
