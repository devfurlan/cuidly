/**
 * Zod Schema and TypeScript types for Nanny Registration
 * Simplified version for babysitter marketplace
 */

import { z } from 'zod';

// Specialties (tipos de baba)
export const SPECIALTIES = [
  'Babá',
  'Babá de recém-nascido',
  'Babá folguista',
  'Babá noturna',
  'Babá de fim de semana',
  'Babá eventual',
  'Babysitter',
  'Nanny',
  'Au pair',
] as const;

// Skills (habilidades)
export const SKILLS = [
  { value: 'culinaria', label: 'Culinária infantil' },
  { value: 'primeiros_socorros', label: 'Primeiros socorros' },
  { value: 'natacao', label: 'Natação' },
  { value: 'idiomas', label: 'Idiomas estrangeiros' },
  { value: 'musica', label: 'Música' },
  { value: 'artes', label: 'Artes e artesanato' },
  { value: 'esportes', label: 'Esportes' },
  { value: 'pedagogia', label: 'Pedagogia' },
  { value: 'cuidados_especiais', label: 'Cuidados especiais' },
] as const;

// Service types (tipos de servico)
export const SERVICE_TYPES = [
  { value: 'baba_fixa', label: 'Babá fixa (tempo integral)' },
  { value: 'baba_meio_periodo', label: 'Babá meio período' },
  { value: 'baba_eventual', label: 'Babá eventual / por hora' },
  { value: 'baba_noturna', label: 'Babá noturna' },
  { value: 'baba_fins_semana', label: 'Babá fins de semana' },
  { value: 'baba_viagem', label: 'Acompanhamento em viagens' },
  { value: 'baba_folguista', label: 'Babá folguista' },
] as const;

// Attendance modes (modalidade de atendimento)
export const ATTENDANCE_MODES = [
  { value: 'residencia_familia', label: 'Na residência da família' },
  { value: 'residencia_baba', label: 'Na residência da babá' },
  { value: 'ambos', label: 'Ambos' },
  { value: 'viagens', label: 'Disponível para viagens' },
] as const;

// Child age experiences (experiencia com faixas etarias)
export const CHILD_AGE_EXPERIENCES = [
  { value: 'recem_nascidos', label: 'Recém-nascidos (0-3 meses)' },
  { value: 'bebes', label: 'Bebês (3-12 meses)' },
  { value: 'crianças_pequenas', label: 'Crianças pequenas (1-3 anos)' },
  { value: 'pre_escolares', label: 'Pré-escolares (3-5 anos)' },
  { value: 'escolares', label: 'Escolares (6-12 anos)' },
  { value: 'adolescentes', label: 'Adolescentes (13+)' },
] as const;

// Age group specialties for babysitters
export const AGE_GROUP_SPECIALTIES = [
  'Recém-nascidos (0-3 meses)',
  'Bebês (3-12 meses)',
  'Crianças pequenas (1-3 anos)',
  'Pré-escolares (3-5 anos)',
  'Escolares (6-12 anos)',
  'Adolescentes (13+)',
] as const;

// Special needs experience
export const SPECIAL_NEEDS_EXPERIENCE = [
  { value: 'autismo', label: 'Autismo / TEA' },
  { value: 'tdah', label: 'TDAH' },
  { value: 'sindrome_down', label: 'Síndrome de Down' },
  { value: 'deficiencia_fisica', label: 'Deficiência física' },
  { value: 'deficiencia_intelectual', label: 'Deficiência intelectual' },
  { value: 'multiplas', label: 'Múltiplas deficiências' },
  { value: 'nenhuma', label: 'Nenhuma experiência específica' },
] as const;

// Experience years options
export const EXPERIENCE_OPTIONS = [
  { value: '0-1', label: 'Até 1 ano' },
  { value: '1-3', label: '1 a 3 anos' },
  { value: '4-6', label: '4 a 6 anos' },
  { value: '7+', label: 'Mais de 7 anos' },
] as const;

// Availability periods
export const PERIODS = [
  { value: 'MORNING', label: 'Manhã (6h-12h)' },
  { value: 'AFTERNOON', label: 'Tarde (12h-18h)' },
  { value: 'EVENING', label: 'Noite (18h-22h)' },
  { value: 'OVERNIGHT', label: 'Pernoite' },
  { value: 'FULL_DAY', label: 'Período integral' },
] as const;

// Weekdays
export const WEEKDAYS = [
  { value: 'MONDAY', label: 'Segunda' },
  { value: 'TUESDAY', label: 'Terça' },
  { value: 'WEDNESDAY', label: 'Quarta' },
  { value: 'THURSDAY', label: 'Quinta' },
  { value: 'FRIDAY', label: 'Sexta' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
] as const;

// Services offered
export const SERVICES_OFFERED = [
  { value: 'cuidado_basico', label: 'Cuidado básico de crianças' },
  { value: 'banho_higiene', label: 'Banho e higiene' },
  { value: 'alimentacao', label: 'Preparação de refeições' },
  { value: 'atividades', label: 'Atividades educativas e recreativas' },
  { value: 'escola', label: 'Acompanhamento escolar' },
  { value: 'transporte', label: 'Transporte escolar' },
  { value: 'tarefas_domesticas', label: 'Tarefas domésticas leves' },
  { value: 'pernoite', label: 'Pernoite' },
] as const;

// Availability schedules
export const AVAILABILITY_SCHEDULES = [
  { value: 'manha', label: 'Manhã (6h-12h)' },
  { value: 'tarde', label: 'Tarde (12h-18h)' },
  { value: 'noite', label: 'Noite (18h-22h)' },
  { value: 'fim_semana', label: 'Fins de semana' },
  { value: 'pernoite', label: 'Pernoite' },
  { value: 'integral', label: 'Período integral' },
  { value: 'flexivel', label: 'Flexível' },
] as const;

// Availability schema
const availabilitySchema = z.object({
  period: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'OVERNIGHT', 'FULL_DAY']),
  weekdays: z.array(z.string()).min(1, 'Selecione pelo menos um dia'),
});

// Main registration schema for nannies
export const nannyRegistrationSchema = z
  .object({
    // Section 1: Identification
    name: z
      .string()
      .min(1, 'Nome completo é obrigatório')
      .refine(
        (name) => name.trim().split(/\s+/).length >= 2,
        'Digite nome e sobrenome'
      ),
    cpf: z
      .string()
      .min(11, 'CPF é obrigatório')
      .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
    birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHERWISE'], {
      errorMap: () => ({ message: 'Selecione o gênero' }),
    }),

    // Section 2: Contact and Address
    phoneNumber: z
      .string()
      .min(1, 'WhatsApp é obrigatório')
      .regex(/^\+55\d{10,11}$/, 'Telefone inválido. Use formato +55XXXXXXXXXXX'),
    zipCode: z
      .string()
      .min(8, 'CEP é obrigatório')
      .regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
    streetName: z.string().min(1, 'Logradouro é obrigatório'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z
      .string()
      .length(2, 'Estado deve ter 2 caracteres')
      .toUpperCase(),

    // Section 3: Experience
    ageGroupSpecialties: z
      .array(z.string())
      .min(1, 'Selecione pelo menos uma faixa etária'),
    experienceYears: z.enum(['0-1', '1-3', '4-6', '7+'], {
      errorMap: () => ({ message: 'Selecione o tempo de experiência' }),
    }),
    servicesOffered: z
      .array(z.string())
      .min(1, 'Selecione pelo menos um serviço'),
    specialNeedsExperience: z.array(z.string()).optional(),

    // Section 4: Account and consent
    email: z.string().email('E-mail inválido'),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    passwordConfirmation: z.string(),
    consentTerms: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos',
    }),
    recaptchaToken: z.string().optional(),

    // Optional fields for profile
    availability: z.array(availabilitySchema).optional(),
    isSmoker: z.boolean().optional(),
    hasDriverLicense: z.boolean().optional(),
    hasCar: z.boolean().optional(),
    hourlyRate: z.number().optional(),
    dailyRate: z.number().optional(),
    monthlyRate: z.number().optional(),

    // New V2.0 optional fields
    aboutMe: z.string().max(2000).optional(),
    maxTravelDistance: z
      .enum([
        'UP_TO_5KM',
        'UP_TO_10KM',
        'UP_TO_15KM',
        'UP_TO_20KM',
        'UP_TO_30KM',
        'ENTIRE_CITY',
      ])
      .optional(),
    ageRangesExperience: z.array(z.string()).optional(),
    hasSpecialNeedsExperience: z.boolean().optional(),
    specialNeedsExperienceDescription: z.string().optional(),
    certifications: z.array(z.string()).optional(),
    languages: z.any().optional(),
    childTypePreference: z.array(z.string()).max(2).optional(),
    strengths: z.array(z.string()).max(3).optional(),
    careMethodology: z.string().optional(),
    hasVehicle: z.boolean().optional(),
    comfortableWithPets: z.enum(['YES_ANY', 'ONLY_SOME', 'NO']).optional(),
    petsDescription: z.string().optional(),
    acceptedActivities: z.array(z.string()).optional(),
    environmentPreference: z.string().optional(),
    parentPresencePreference: z
      .enum(['PRESENT', 'ABSENT', 'NO_PREFERENCE'])
      .optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirmation'],
  });

// TypeScript type
export type NannyRegistrationFormData = z.infer<typeof nannyRegistrationSchema>;

// Default values
export const defaultValues: Partial<NannyRegistrationFormData> = {
  name: '',
  cpf: '',
  birthDate: '',
  gender: undefined,
  phoneNumber: '',
  zipCode: '',
  streetName: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  ageGroupSpecialties: [],
  experienceYears: undefined,
  servicesOffered: [],
  specialNeedsExperience: [],
  email: '',
  password: '',
  passwordConfirmation: '',
  consentTerms: false,
  recaptchaToken: '',
  isSmoker: false,
  hasDriverLicense: false,
  hasCar: false,
  // New V2.0 defaults
  aboutMe: '',
  maxTravelDistance: undefined,
  ageRangesExperience: [],
  hasSpecialNeedsExperience: false,
  specialNeedsExperienceDescription: '',
  certifications: [],
  languages: null,
  childTypePreference: [],
  strengths: [],
  careMethodology: undefined,
  hasVehicle: false,
  comfortableWithPets: undefined,
  petsDescription: '',
  acceptedActivities: [],
  environmentPreference: undefined,
  parentPresencePreference: undefined,
};

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

// Certifications options
export const CERTIFICATIONS_OPTIONS = [
  { value: 'primeiros_socorros', label: 'Primeiros Socorros' },
  { value: 'cuidador_infantil', label: 'Cuidador Infantil' },
  { value: 'pedagogia', label: 'Pedagogia' },
  { value: 'enfermagem', label: 'Enfermagem' },
  { value: 'nutricao', label: 'Nutrição' },
  { value: 'educacao_especial', label: 'Educação Especial' },
  { value: 'montessori', label: 'Método Montessori' },
  { value: 'outro', label: 'Outro' },
] as const;

// Strengths options
export const STRENGTHS_OPTIONS = [
  { value: 'paciencia', label: 'Paciência' },
  { value: 'criatividade', label: 'Criatividade' },
  { value: 'organizacao', label: 'Organização' },
  { value: 'comunicacao', label: 'Boa comunicação' },
  { value: 'proatividade', label: 'Proatividade' },
  { value: 'empatia', label: 'Empatia' },
  { value: 'responsabilidade', label: 'Responsabilidade' },
  { value: 'carinho', label: 'Carinho' },
] as const;

// Care methodology options
export const CARE_METHODOLOGY_OPTIONS = [
  { value: 'montessori', label: 'Montessori' },
  { value: 'waldorf', label: 'Waldorf' },
  { value: 'tradicional', label: 'Tradicional' },
  { value: 'mista', label: 'Mista/Flexível' },
  { value: 'sem_preferencia', label: 'Sem metodologia específica' },
] as const;

// Child type preference options
export const CHILD_TYPE_PREFERENCE_OPTIONS = [
  { value: 'calm', label: 'Crianças calmas' },
  { value: 'active', label: 'Crianças ativas' },
  { value: 'shy', label: 'Crianças tímidas' },
  { value: 'social', label: 'Crianças sociáveis' },
  { value: 'no_preference', label: 'Sem preferência' },
] as const;

// Accepted activities options
export const ACCEPTED_ACTIVITIES_OPTIONS = [
  { value: 'limpeza_leve', label: 'Limpeza leve do quarto' },
  { value: 'preparo_refeicoes', label: 'Preparo de refeições' },
  { value: 'lavar_roupas', label: 'Lavar roupas da criança' },
  { value: 'ajudar_licao', label: 'Ajudar com lição de casa' },
  { value: 'levar_escola', label: 'Levar/buscar na escola' },
  { value: 'passeios', label: 'Passeios ao ar livre' },
  { value: 'banho_higiene', label: 'Banho e higiene' },
] as const;
