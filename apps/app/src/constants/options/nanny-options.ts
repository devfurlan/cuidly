/**
 * Nanny Options Constants
 * All option arrays for nanny onboarding and profiles
 */

// Experience years options
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

// Travel radius options - must match MaxTravelDistance enum in Prisma schema
export const TRAVEL_RADIUS_OPTIONS = [
  { value: 'UP_TO_5KM', label: 'Até 5 km' },
  { value: 'UP_TO_10KM', label: 'Até 10 km' },
  { value: 'UP_TO_15KM', label: 'Até 15 km' },
  { value: 'UP_TO_20KM', label: 'Até 20 km' },
  { value: 'UP_TO_30KM', label: 'Até 30 km' },
  { value: 'ENTIRE_CITY', label: 'Cidade inteira' },
] as const;

// Gender options
export const NANNY_GENDER_OPTIONS = [
  { value: 'FEMALE', label: 'Feminino' },
  { value: 'MALE', label: 'Masculino' },
  { value: 'OTHER', label: 'Outro' },
] as const;

// Child age experience options
export const CHILD_AGE_EXPERIENCE_OPTIONS = [
  { value: 'NEWBORN', label: 'Recém-nascido (0-3 meses)' },
  { value: 'BABY', label: 'Bebê (3-12 meses)' },
  { value: 'TODDLER', label: 'Criança pequena (1-3 anos)' },
  { value: 'PRESCHOOL', label: 'Pré-escolar (3-5 anos)' },
  { value: 'SCHOOL_AGE', label: 'Idade escolar (6-12 anos)' },
  { value: 'TEENAGER', label: 'Adolescente (13-17 anos)' },
] as const;

// Special needs experience options - re-exported from common (shared with families)
export { SPECIAL_NEEDS_OPTIONS } from './common-options';

// Certification options
export const CERTIFICATION_OPTIONS = [
  { value: 'FIRST_AID', label: 'Primeiros Socorros' },
  { value: 'CPR', label: 'Ressuscitação Cardiopulmonar (RCP)' },
  { value: 'CHILD_DEVELOPMENT', label: 'Desenvolvimento Infantil' },
  { value: 'EARLY_EDUCATION', label: 'Educação Infantil' },
  { value: 'NUTRITION', label: 'Nutrição Infantil' },
  { value: 'SPECIAL_NEEDS', label: 'Cuidados com Necessidades Especiais' },
  { value: 'MONTESSORI', label: 'Método Montessori' },
  { value: 'NURSING', label: 'Técnico em Enfermagem' },
] as const;

// Language options
export const LANGUAGE_OPTIONS = [
  { value: 'PORTUGUESE', label: 'Português' },
  { value: 'ENGLISH', label: 'Inglês' },
  { value: 'SPANISH', label: 'Espanhol' },
  { value: 'LIBRAS', label: 'Libras' },
  { value: 'OTHER', label: 'Outro' },
] as const;

// Child type preference options (max 2)
export const CHILD_TYPE_OPTIONS = [
  { value: 'CALM', label: 'Crianças calmas' },
  { value: 'ACTIVE', label: 'Crianças agitadas' },
  { value: 'SHY', label: 'Crianças tímidas' },
  { value: 'SOCIAL', label: 'Crianças sociáveis' },
  { value: 'SPECIAL_NEEDS', label: 'Crianças com necessidades especiais' },
  { value: 'MULTIPLE', label: 'Múltiplas crianças' },
  { value: 'ANY', label: 'Sem preferência' },
] as const;

// Max children care options
export const MAX_CHILDREN_CARE_OPTIONS = [
  { value: 1, label: '1 criança' },
  { value: 2, label: '2 crianças' },
  { value: 3, label: '3 crianças' },
  { value: 4, label: '4 crianças' },
  { value: 5, label: 'Mais de 4' },
] as const;

// Strengths options (max 3)
export const STRENGTH_OPTIONS = [
  { value: 'PATIENCE', label: 'Paciência' },
  { value: 'CREATIVITY', label: 'Criatividade' },
  { value: 'ORGANIZATION', label: 'Organização' },
  { value: 'COMMUNICATION', label: 'Comunicação' },
  { value: 'FLEXIBILITY', label: 'Flexibilidade' },
  { value: 'PUNCTUALITY', label: 'Pontualidade' },
  { value: 'AFFECTION', label: 'Carinho e afeto' },
  { value: 'DISCIPLINE', label: 'Disciplina positiva' },
  { value: 'EDUCATION', label: 'Estímulo educacional' },
  { value: 'SAFETY', label: 'Foco em segurança' },
] as const;

// Comfort with pets options
export const COMFORT_WITH_PETS_OPTIONS = [
  { value: 'YES_ANY', label: 'Sim, fico confortável com qualquer animal' },
  { value: 'ONLY_SOME', label: 'Depende do animal' },
  { value: 'NO', label: 'Não me sinto confortável com animais' },
] as const;

// Accepted activities options
export const ACCEPTED_ACTIVITIES_OPTIONS = [
  { value: 'CHILD_CARE', label: 'Cuidados com a criança' },
  { value: 'BABY_CARE', label: 'Cuidados com bebê' },
  { value: 'COOKING', label: 'Preparar refeições' },
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
  { value: 'SPECIAL_NEEDS_CARE', label: 'Cuidados especiais' },
  { value: 'THERAPEUTIC_ACTIVITIES', label: 'Atividades terapêuticas' },
] as const;

// Legacy activity labels (for backwards compatibility with old database values)
export const LEGACY_ACTIVITY_LABELS: Record<string, string> = {
  MEAL_PREP: 'Preparar refeições',
  CHILD_LAUNDRY: 'Lavar roupas da criança',
  SCHOOL_PICKUP: 'Levar e buscar na escola',
  HOMEWORK_HELP: 'Ajudar com tarefas escolares',
  OUTDOOR_ACTIVITIES: 'Passeios ao ar livre',
  SPORTS_ACTIVITIES: 'Atividades esportivas',
};

// Re-export hourly rate from common options for backwards compatibility
export { HOURLY_RATE_OPTIONS, HOURLY_RATE_LABELS } from './common-options';

// Nanny type options (tipo de babá)
export const NANNY_TYPE_OPTIONS = [
  { value: 'FOLGUISTA', label: 'Folguista', description: 'Cobre folgas e férias de outras babás' },
  { value: 'DIARISTA', label: 'Diarista', description: 'Trabalha por diárias avulsas' },
  { value: 'MENSALISTA', label: 'Mensalista', description: 'Trabalho fixo com horário regular' },
] as const;

// Contract regime options (regime de contratação)
export const CONTRACT_REGIME_OPTIONS = [
  { value: 'AUTONOMA', label: 'Autônoma', description: 'Sem vínculo formal, pagamento direto' },
  { value: 'PJ', label: 'PJ', description: 'Pessoa Jurídica (MEI ou empresa)' },
  { value: 'CLT', label: 'CLT', description: 'Carteira assinada com todos os direitos' },
] as const;

// Activities NOT accepted options (what nanny refuses to do)
export const ACTIVITIES_NOT_ACCEPTED_OPTIONS = [
  { value: 'PETS', label: 'Cuidar de animais de estimação' },
  { value: 'TRANSPORT', label: 'Levar e buscar na escola' },
  { value: 'COOKING', label: 'Preparar refeições simples' },
  { value: 'HOMEWORK', label: 'Ajudar com tarefas escolares' },
  { value: 'BATHING', label: 'Dar banho' },
  { value: 'CLEANING', label: 'Faxina leve' },
] as const;

// Care methodology options
export const CARE_METHODOLOGY_OPTIONS = [
  { value: 'MONTESSORI', label: 'Montessori' },
  { value: 'WALDORF', label: 'Waldorf' },
  { value: 'TRADITIONAL', label: 'Tradicional' },
  { value: 'PIKLER', label: 'Pikler' },
  { value: 'REGGIO_EMILIA', label: 'Reggio Emilia' },
  { value: 'RIE', label: 'RIE (Recursos para Educar Bebês)' },
  { value: 'MIXED', label: 'Misto/Flexível' },
  { value: 'NONE', label: 'Não sigo métodologia específica' },
] as const;

// Parent presence preference options
export const PARENT_PRESENCE_OPTIONS = [
  { value: 'PRESENT', label: 'Prefiro que os pais estejam presentes' },
  { value: 'ABSENT', label: 'Prefiro trabalhar sem os pais por perto' },
  { value: 'NO_PREFERENCE', label: 'Sem preferência' },
] as const;

// Marital status options (feminine)
export const MARITAL_STATUS_OPTIONS_FEMALE = [
  { value: 'SINGLE', label: 'Solteira' },
  { value: 'MARRIED', label: 'Casada' },
  { value: 'DIVORCED', label: 'Divorciada' },
  { value: 'WIDOWED', label: 'Viúva' },
  { value: 'SEPARATED', label: 'Separada' },
  { value: 'COMMON_LAW', label: 'União estável' },
] as const;

// Marital status options (masculine)
export const MARITAL_STATUS_OPTIONS_MALE = [
  { value: 'SINGLE', label: 'Solteiro' },
  { value: 'MARRIED', label: 'Casado' },
  { value: 'DIVORCED', label: 'Divorciado' },
  { value: 'WIDOWED', label: 'Viúvo' },
  { value: 'SEPARATED', label: 'Separado' },
  { value: 'COMMON_LAW', label: 'União estável' },
] as const;

// Default marital status options (for backwards compatibility)
export const MARITAL_STATUS_OPTIONS = MARITAL_STATUS_OPTIONS_FEMALE;

// Relationship options for references
export const REFERENCE_RELATIONSHIP_OPTIONS = [
  { value: 'FORMER_EMPLOYER', label: 'Ex-empregador(a)' },
  { value: 'FAMILY_MEMBER', label: 'Familiar de criança que cuidei' },
  { value: 'PROFESSIONAL', label: 'Colega de trabalho' },
  { value: 'PERSONAL', label: 'Referência pessoal' },
  { value: 'OTHER', label: 'Outro' },
] as const;

// Period options for availability
export const PERIOD_OPTIONS = [
  { value: 'MORNING', label: 'Manhã', description: '6h - 12h' },
  { value: 'AFTERNOON', label: 'Tarde', description: '12h - 18h' },
  { value: 'NIGHT', label: 'Noite', description: '18h - 22h' },
  { value: 'OVERNIGHT', label: 'Pernoite', description: 'Dormir no local' },
] as const;

// Job type options
export const JOB_TYPE_OPTIONS = [
  { value: 'FIXED', label: 'Fixa', description: 'Trabalho com horário fixo semanal' },
  { value: 'SUBSTITUTE', label: 'Folguista', description: 'Cobertura de folgas e férias' },
  { value: 'OCCASIONAL', label: 'Eventual', description: 'Trabalhos pontuais e avulsos' },
] as const;

// Contract type options
export const CONTRACT_TYPE_OPTIONS = [
  { value: 'CLT', label: 'CLT', description: 'Carteira assinada' },
  { value: 'DAILY_WORKER', label: 'Diarista', description: 'Pagamento por dia trabalhado' },
  { value: 'MEI', label: 'MEI/PJ', description: 'Microempreendedor Individual' },
  { value: 'TO_BE_DISCUSSED', label: 'A combinar', description: 'Aberta a discussão' },
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

// Accepts holiday work labels
export const ACCEPTS_HOLIDAY_WORK_OPTIONS = [
  { value: 'YES', label: 'Sim' },
  { value: 'NO', label: 'Não' },
  { value: 'SOMETIMES', label: 'Às vezes' },
] as const;

// Max travel distance labels - must match MaxTravelDistance enum in Prisma schema
export const MAX_TRAVEL_DISTANCE_LABELS: Record<string, string> = {
  UP_TO_5KM: 'Até 5 km',
  UP_TO_10KM: 'Até 10 km',
  UP_TO_15KM: 'Até 15 km',
  UP_TO_20KM: 'Até 20 km',
  UP_TO_30KM: 'Até 30 km',
  ENTIRE_CITY: 'Cidade inteira',
};
