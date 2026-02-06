/**
 * Family Options Constants
 * All option arrays for family onboarding and profiles
 */

// Re-export shared options
export { SPECIAL_NEEDS_OPTIONS, HOURLY_RATE_OPTIONS, HOURLY_RATE_LABELS } from './common-options';

// Number of children options
export const NUMBER_OF_CHILDREN_OPTIONS = [
  { value: '1', label: '1 filho' },
  { value: '2', label: '2 filhos' },
  { value: '3', label: '3 filhos' },
  { value: '4', label: '4 filhos' },
  { value: '5', label: '5 ou mais filhos' },
] as const;

// Housing type options
export const HOUSING_TYPES = [
  { value: 'HOUSE', label: 'Casa' },
  { value: 'APARTMENT_NO_ELEVATOR', label: 'Apartamento sem elevador' },
  { value: 'APARTMENT_WITH_ELEVATOR', label: 'Apartamento com elevador' },
  { value: 'CONDOMINIUM', label: 'Condomínio fechado' },
] as const;

// Parent presence options (family perspective - different from nanny's PARENT_PRESENCE_OPTIONS)
export const FAMILY_PARENT_PRESENCE_OPTIONS = [
  { value: 'ALWAYS', label: 'Sempre em casa' },
  { value: 'SOMETIMES', label: 'Às vezes em casa' },
  { value: 'RARELY', label: 'Raramente em casa' },
  { value: 'NEVER', label: 'Nunca em casa (home office não)' },
] as const;

// House rules options
export const HOUSE_RULES_OPTIONS = [
  { value: 'NO_SCREEN_TIME', label: 'Sem telas/TV' },
  { value: 'ORGANIC_FOOD', label: 'Alimentação orgânica' },
  { value: 'NO_SUGAR', label: 'Sem açúcar' },
  { value: 'STRICT_SCHEDULE', label: 'Horários rígidos' },
  { value: 'OUTDOOR_PLAY', label: 'Brincadeiras ao ar livre' },
  { value: 'EDUCATIONAL_ACTIVITIES', label: 'Atividades educativas' },
  { value: 'NAP_TIME', label: 'Horário de soneca' },
  { value: 'RELIGIOUS_PRACTICES', label: 'Práticas religiosas' },
] as const;

// House rules options v2 (max 4)
export const HOUSE_RULES_OPTIONS_V2 = [
  { value: 'SCREEN_LIMIT', label: 'Limite de tela' },
  { value: 'SLEEP_ROUTINE', label: 'Rotina de sono' },
  { value: 'HEALTHY_FOOD', label: 'Alimentação saudável' },
  { value: 'NO_SUGAR', label: 'Sem açúcar' },
  { value: 'OUTDOOR_PLAY', label: 'Brincadeiras ao ar livre' },
  { value: 'EDUCATIONAL_ACTIVITIES', label: 'Atividades educativas' },
  { value: 'RELIGIOUS_PRACTICES', label: 'Práticas religiosas' },
] as const;

// Pet types options
export const PET_TYPES_OPTIONS = [
  { value: 'DOG', label: 'Cachorro' },
  { value: 'CAT', label: 'Gato' },
  { value: 'OTHER', label: 'Outros' },
] as const;

// Values options for step 8
export const VALUES_OPTIONS = [
  { value: 'PATIENCE', label: 'Paciência' },
  { value: 'CREATIVITY', label: 'Criatividade' },
  { value: 'EXPERIENCE', label: 'Experiência' },
  { value: 'FIRST_AID', label: 'Primeiros Socorros' },
  { value: 'METHODOLOGY', label: 'Metodologia' },
  { value: 'COMMUNICATION', label: 'Boa comunicação' },
  { value: 'PUNCTUALITY', label: 'Pontualidade' },
  { value: 'FLEXIBILITY', label: 'Flexibilidade' },
  { value: 'AFFECTION', label: 'Carinho e afeto' },
  { value: 'EDUCATION', label: 'Formação em educação' },
] as const;

// Care methodology options (family perspective)
export const FAMILY_CARE_METHODOLOGY_OPTIONS = [
  { value: 'NO_PREFERENCE', label: 'Não tenho preferência' },
  { value: 'MONTESSORI', label: 'Montessori' },
  { value: 'POSITIVE_DISCIPLINE', label: 'Disciplina Positiva' },
  { value: 'WALDORF', label: 'Waldorf' },
  { value: 'TRADITIONAL', label: 'Tradicional' },
] as const;

// Language options (family perspective)
export const FAMILY_LANGUAGE_OPTIONS = [
  { value: 'PORTUGUESE', label: 'Português' },
  { value: 'ENGLISH', label: 'Inglês' },
  { value: 'SPANISH', label: 'Espanhol' },
  { value: 'OTHER', label: 'Outros' },
] as const;

// Domestic help options (same as ACCEPTED_ACTIVITIES_OPTIONS for matching)
export const DOMESTIC_HELP_OPTIONS = [
  { value: 'COOKING', label: 'Preparar refeições simples' },
  { value: 'ORGANIZE', label: 'Organizar o ambiente da criança' },
  { value: 'HOMEWORK', label: 'Ajudar com tarefas escolares' },
  { value: 'TRANSPORT', label: 'Levar e buscar na escola' },
  { value: 'BATHING', label: 'Dar banho' },
  { value: 'SLEEPING', label: 'Colocar para dormir' },
  { value: 'PLAYING', label: 'Brincadeiras e atividades lúdicas' },
  { value: 'READING', label: 'Ler histórias' },
  { value: 'OUTDOOR', label: 'Passeios ao ar livre' },
  { value: 'CRAFTS', label: 'Atividades manuais e artísticas' },
  { value: 'SPORTS', label: 'Atividades esportivas' },
  { value: 'LAUNDRY', label: 'Lavar roupas da criança' },
  { value: 'CLEANING', label: 'Faxina leve' },
] as const;

// Care priorities options (max 3)
export const CARE_PRIORITIES_OPTIONS = [
  { value: 'ATTENTION_PATIENCE', label: 'Muita paciência e atenção' },
  { value: 'PLAY_STIMULATION', label: 'Brincadeiras e criatividade' },
  { value: 'STRUCTURED_ROUTINE', label: 'Rotina organizada' },
  { value: 'SAFETY_SUPERVISION', label: 'Supervisão constante' },
  { value: 'SCHOOL_SUPPORT', label: 'Apoio escolar' },
  { value: 'AUTONOMY', label: 'Incentivar autonomia' },
  { value: 'EMOTIONAL_CARE', label: 'Acolhimento emocional' },
  { value: 'HIGH_ENERGY', label: 'Energia e disposição' },
  { value: 'RESPECTFUL_DISCIPLINE', label: 'Limites com carinho' },
  { value: 'BABY_CARE', label: 'Cuidado com bebê' },
  { value: 'SLEEP_ROUTINE', label: 'Rotina de sono' },
  { value: 'FEEDING_SUPPORT', label: 'Apoio na alimentação' },
] as const;

// Responsible gender options (for the family responsible)
export const RESPONSIBLE_GENDER_OPTIONS = [
  { value: 'FEMALE', label: 'Feminino' },
  { value: 'MALE', label: 'Masculino' },
  { value: 'OTHER', label: 'Outro' },
] as const;

// Nanny type options (tipo de babá que a família procura)
export const FAMILY_NANNY_TYPE_OPTIONS = [
  { value: 'FOLGUISTA', label: 'Folguista', description: 'Cobre folgas da babá fixa ou eventos pontuais.' },
  { value: 'DIARISTA', label: 'Diarista', description: 'Trabalha em dias específicos na semana, sem vínculo fixo.' },
  { value: 'MENSALISTA', label: 'Mensalista', description: 'Trabalha com frequência regular, geralmente com contrato.' },
] as const;

// Contract regime options (regime de contratação que a família aceita)
export const FAMILY_CONTRACT_REGIME_OPTIONS = [
  { value: 'AUTONOMA', label: 'Autônoma', description: 'Pagamento direto, sem vínculo formal. Ideal para trabalhos esporádicos.' },
  { value: 'PJ', label: 'PJ', description: 'Babá com empresa (MEI/CNPJ). Emite nota fiscal.' },
  { value: 'CLT', label: 'CLT', description: 'Carteira assinada com todos os direitos trabalhistas.' },
] as const;

// Child gender options (simplified)
export const CHILD_GENDER_OPTIONS = [
  { value: 'FEMALE', label: 'Feminino' },
  { value: 'MALE', label: 'Masculino' },
] as const;

// Needed days options
export const NEEDED_DAYS_OPTIONS = [
  { value: 'MONDAY', label: 'Segunda' },
  { value: 'TUESDAY', label: 'Terça' },
  { value: 'WEDNESDAY', label: 'Quarta' },
  { value: 'THURSDAY', label: 'Quinta' },
  { value: 'FRIDAY', label: 'Sexta' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
] as const;

// Needed shifts options
export const NEEDED_SHIFTS_OPTIONS = [
  { value: 'MORNING', label: 'Manhã' },
  { value: 'AFTERNOON', label: 'Tarde' },
  { value: 'NIGHT', label: 'Noite' },
  { value: 'OVERNIGHT', label: 'Pernoite' },
] as const;

// Mandatory requirements options (family perspective)
export const FAMILY_MANDATORY_REQUIREMENTS_OPTIONS = [
  { value: 'NON_SMOKER', label: 'Não fumante' },
  { value: 'DRIVER_LICENSE', label: 'Com CNH' },
] as const;

// Alias for backwards compatibility - re-export from common-options
import { HOURLY_RATE_OPTIONS as _HOURLY_RATE_OPTIONS } from './common-options';
export const FAMILY_HOURLY_RATE_OPTIONS = _HOURLY_RATE_OPTIONS;
