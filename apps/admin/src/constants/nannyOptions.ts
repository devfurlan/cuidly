/**
 * Nanny Form Options
 * Constants for nanny registration and editing forms
 */

// Experience years options
export const EXPERIENCE_OPTIONS = [
  { value: '0-1', label: 'Até 1 ano' },
  { value: '1-3', label: '1 a 3 anos' },
  { value: '4-6', label: '4 a 6 anos' },
  { value: '7+', label: 'Mais de 7 anos' },
] as const;

// Specialty options for babysitters
export const SPECIALTIES = [
  'Cuidados com recém-nascidos',
  'Cuidados com bebês (0-2 anos)',
  'Cuidados com crianças pequenas (2-5 anos)',
  'Cuidados com crianças maiores (6-12 anos)',
  'Acompanhamento escolar',
  'Atividades educativas',
  'Primeiros socorros pediátricos',
  'Nutrição infantil',
  'Desenvolvimento infantil',
  'Outra',
] as const;

// Age range options for children
export const CHILD_AGE_RANGES = [
  { value: 'newborn', label: 'Recém-nascido (0-3 meses)' },
  { value: 'infant', label: 'Bebê (3-12 meses)' },
  { value: 'toddler', label: 'Criança pequena (1-3 anos)' },
  { value: 'preschool', label: 'Pré-escolar (3-5 anos)' },
  { value: 'school_age', label: 'Idade escolar (6-12 anos)' },
  { value: 'teenager', label: 'Adolescente (13+ anos)' },
] as const;

// Transport app frequency options
export const TRANSPORT_APP_FREQUENCY_OPTIONS = [
  { value: 'NEVER', label: 'Nunca uso' },
  { value: 'RARELY', label: 'Raramente' },
  { value: 'MONTHLY', label: 'Mensalmente' },
  { value: 'WEEKLY', label: 'Semanalmente' },
  { value: 'DAILY', label: 'Diariamente' },
] as const;

// Availability schedules
export const AVAILABILITY_SCHEDULES = [
  { value: 'manha', label: 'Manhã (6h-12h)' },
  { value: 'tarde', label: 'Tarde (12h-18h)' },
  { value: 'noite', label: 'Noite (18h-22h)' },
  { value: 'pernoite', label: 'Pernoite' },
  { value: 'fim_semana', label: 'Fins de semana' },
  { value: 'feriados', label: 'Feriados' },
  { value: 'integral', label: 'Período integral' },
  { value: 'flexivel', label: 'Flexível' },
] as const;

// Service types for babysitters
export const SERVICE_TYPES = [
  { value: 'babysitting', label: 'Babysitting (horas avulsas)' },
  { value: 'rotina', label: 'Rotina diária (fixo)' },
  { value: 'acompanhamento_escola', label: 'Acompanhamento escolar' },
  { value: 'transporte', label: 'Transporte de crianças' },
  { value: 'alimentacao', label: 'Preparo de alimentação' },
  { value: 'banho_higiene', label: 'Banho e higiene' },
  { value: 'atividades_educativas', label: 'Atividades educativas' },
  { value: 'brincadeiras', label: 'Brincadeiras e recreação' },
  { value: 'leve_limpeza', label: 'Leve limpeza do quarto' },
  { value: 'outro', label: 'Outro' },
] as const;

// Attendance modes
export const ATTENDANCE_MODES = [
  { value: 'domiciliar', label: 'Na casa da família' },
  { value: 'propria_residencia', label: 'Na minha casa' },
  { value: 'eventos', label: 'Eventos e festas' },
  { value: 'viagens', label: 'Viagens' },
] as const;

// Skills for babysitters
export const SKILLS = [
  { value: 'primeiros_socorros', label: 'Primeiros socorros' },
  { value: 'natacao', label: 'Sabe nadar' },
  { value: 'dirigir', label: 'Possui CNH' },
  { value: 'ingles', label: 'Fala inglês' },
  { value: 'espanhol', label: 'Fala espanhol' },
  { value: 'musica', label: 'Habilidades musicais' },
  { value: 'artes', label: 'Artes e artesanato' },
  { value: 'esportes', label: 'Esportes' },
  { value: 'culinaria', label: 'Culinária infantil' },
  { value: 'necessidades_especiais', label: 'Experiência com necessidades especiais' },
] as const;

// ============================================
// NEW V2.0 OPTIONS
// ============================================

// Max travel distance options
export const MAX_TRAVEL_DISTANCE_OPTIONS = [
  { value: 'UP_TO_3KM', label: 'Até 3 km' },
  { value: 'UP_TO_5KM', label: 'Até 5 km' },
  { value: 'UP_TO_10KM', label: 'Até 10 km' },
  { value: 'UP_TO_15KM', label: 'Até 15 km' },
  { value: 'ENTIRE_CITY', label: 'Toda a cidade' },
] as const;

// Comfort with pets options
export const COMFORT_WITH_PETS_OPTIONS = [
  { value: 'YES_ANY', label: 'Sim, qualquer animal' },
  { value: 'ONLY_SOME', label: 'Apenas alguns' },
  { value: 'NO', label: 'Não' },
] as const;

// Parent presence preference options
export const PARENT_PRESENCE_PREFERENCE_OPTIONS = [
  { value: 'PRESENT', label: 'Prefiro com pais presentes' },
  { value: 'ABSENT', label: 'Prefiro sem pais presentes' },
  { value: 'NO_PREFERENCE', label: 'Sem preferência' },
] as const;

// Age ranges experience options
export const AGE_RANGES_EXPERIENCE_OPTIONS = [
  { value: 'newborn', label: 'Recém-nascido (0-3 meses)' },
  { value: 'baby', label: 'Bebê (3-12 meses)' },
  { value: 'toddler', label: 'Criança pequena (1-3 anos)' },
  { value: 'preschool', label: 'Pré-escolar (3-5 anos)' },
  { value: 'school_age', label: 'Idade escolar (6-12 anos)' },
  { value: 'teenager', label: 'Adolescente (13+ anos)' },
] as const;

// Certifications options
export const CERTIFICATIONS_OPTIONS = [
  { value: 'primeiros_socorros', label: 'Primeiros Socorros' },
  { value: 'cuidador_infantil', label: 'Cuidador Infantil' },
  { value: 'pedagogia', label: 'Pedagogia' },
  { value: 'enfermagem', label: 'Enfermagem' },
  { value: 'nutricao', label: 'Nutrição' },
  { value: 'psicologia', label: 'Psicologia' },
  { value: 'educacao_especial', label: 'Educação Especial' },
  { value: 'montessori', label: 'Método Montessori' },
  { value: 'waldorf', label: 'Método Waldorf' },
  { value: 'outro', label: 'Outro' },
] as const;

// Languages options
export const LANGUAGES_OPTIONS = [
  { value: 'portugues', label: 'Português' },
  { value: 'ingles', label: 'Inglês' },
  { value: 'espanhol', label: 'Espanhol' },
  { value: 'frances', label: 'Francês' },
  { value: 'alemao', label: 'Alemão' },
  { value: 'italiano', label: 'Italiano' },
  { value: 'libras', label: 'LIBRAS' },
  { value: 'outro', label: 'Outro' },
] as const;

// Language level options
export const LANGUAGE_LEVEL_OPTIONS = [
  { value: 'basic', label: 'Básico' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
  { value: 'fluent', label: 'Fluente' },
  { value: 'native', label: 'Nativo' },
] as const;

// Child type preference options
export const CHILD_TYPE_PREFERENCE_OPTIONS = [
  { value: 'calm', label: 'Crianças calmas' },
  { value: 'active', label: 'Crianças ativas' },
  { value: 'shy', label: 'Crianças tímidas' },
  { value: 'social', label: 'Crianças sociáveis' },
  { value: 'special_needs', label: 'Crianças com necessidades especiais' },
  { value: 'no_preference', label: 'Sem preferência' },
] as const;

// Strengths options
export const STRENGTHS_OPTIONS = [
  { value: 'paciencia', label: 'Paciência' },
  { value: 'criatividade', label: 'Criatividade' },
  { value: 'organizacao', label: 'Organização' },
  { value: 'comunicacao', label: 'Boa comunicação' },
  { value: 'proatividade', label: 'Proatividade' },
  { value: 'empatia', label: 'Empatia' },
  { value: 'dinamismo', label: 'Dinamismo' },
  { value: 'responsabilidade', label: 'Responsabilidade' },
  { value: 'carinho', label: 'Carinho' },
  { value: 'firmeza', label: 'Firmeza com limites' },
] as const;

// Care methodology options
export const CARE_METHODOLOGY_OPTIONS = [
  { value: 'montessori', label: 'Montessori' },
  { value: 'waldorf', label: 'Waldorf' },
  { value: 'tradicional', label: 'Tradicional' },
  { value: 'pikler', label: 'Pikler' },
  { value: 'reggio_emilia', label: 'Reggio Emilia' },
  { value: 'mista', label: 'Mista/Flexível' },
  { value: 'sem_preferencia', label: 'Sem métodologia específica' },
] as const;

// Accepted activities options
export const ACCEPTED_ACTIVITIES_OPTIONS = [
  { value: 'limpeza_leve', label: 'Limpeza leve do quarto' },
  { value: 'preparo_refeicoes', label: 'Preparo de refeições' },
  { value: 'lavar_roupas', label: 'Lavar roupas da criança' },
  { value: 'ajudar_licao', label: 'Ajudar com lição de casa' },
  { value: 'levar_escola', label: 'Levar/buscar na escola' },
  { value: 'passeios', label: 'Passeios ao ar livre' },
  { value: 'atividades_artisticas', label: 'Atividades artísticas' },
  { value: 'brincadeiras_educativas', label: 'Brincadeiras educativas' },
  { value: 'banho_higiene', label: 'Banho e higiene' },
  { value: 'rotina_sono', label: 'Rotina de sono' },
  // Current values (matching with family options)
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
  // Legacy values (backwards compatibility for old database records)
  { value: 'MEAL_PREP', label: 'Preparar refeições' },
  { value: 'CHILD_LAUNDRY', label: 'Lavar roupas da criança' },
  { value: 'SCHOOL_PICKUP', label: 'Levar e buscar na escola' },
  { value: 'HOMEWORK_HELP', label: 'Ajudar com tarefas escolares' },
  { value: 'OUTDOOR_ACTIVITIES', label: 'Passeios ao ar livre' },
  { value: 'SPORTS_ACTIVITIES', label: 'Atividades esportivas' },
] as const;

// Environment preference options
export const ENVIRONMENT_PREFERENCE_OPTIONS = [
  { value: 'casa', label: 'Casa' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'condominio', label: 'Condomínio fechado' },
  { value: 'sem_preferencia', label: 'Sem preferência' },
] as const;

// Accepts holiday work options
export const ACCEPTS_HOLIDAY_WORK_OPTIONS = [
  { value: 'YES', label: 'Sim' },
  { value: 'NO', label: 'Não' },
  { value: 'SOMETIMES', label: 'As vezes' },
] as const;

// Marital status options
export const MARITAL_STATUS_OPTIONS = [
  { value: 'SINGLE', label: 'Solteira' },
  { value: 'MARRIED', label: 'Casada' },
  { value: 'DIVORCED', label: 'Divorciada' },
  { value: 'WIDOWED', label: 'Viuva' },
  { value: 'SEPARATED', label: 'Separada' },
  { value: 'STABLE_UNION', label: 'Uniao estavel' },
] as const;

// Nanny types options
export const NANNY_TYPE_OPTIONS = [
  { value: 'FOLGUISTA', label: 'Folguista' },
  { value: 'DIARISTA', label: 'Diarista' },
  { value: 'MENSALISTA', label: 'Mensalista' },
] as const;

// Contract regime options
export const CONTRACT_REGIME_OPTIONS = [
  { value: 'AUTONOMA', label: 'Autonoma' },
  { value: 'PJ', label: 'PJ' },
  { value: 'CLT', label: 'CLT' },
] as const;

// Hourly rate range options
export const HOURLY_RATE_RANGE_OPTIONS = [
  { value: 'UP_TO_25', label: 'Ate R$ 25/hora' },
  { value: '25_TO_35', label: 'R$ 25 a R$ 35/hora' },
  { value: '35_TO_50', label: 'R$ 35 a R$ 50/hora' },
  { value: '50_TO_75', label: 'R$ 50 a R$ 75/hora' },
  { value: 'ABOVE_75', label: 'Acima de R$ 75/hora' },
] as const;

// Activities not accepted options
export const ACTIVITIES_NOT_ACCEPTED_OPTIONS = [
  { value: 'limpeza_pesada', label: 'Limpeza pesada' },
  { value: 'cozinhar_familia', label: 'Cozinhar para a familia' },
  { value: 'cuidar_pets', label: 'Cuidar de animais' },
  { value: 'lavar_passar', label: 'Lavar e passar roupas' },
  { value: 'pernoite', label: 'Pernoite' },
  { value: 'viagens', label: 'Viagens' },
] as const;
