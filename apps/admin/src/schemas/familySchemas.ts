import { z } from 'zod';

// Status options
export const FAMILY_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
  { value: 'PENDING', label: 'Pendente' },
] as const;

// Enums from Prisma schema
export const HousingTypeEnum = z.enum([
  'HOUSE',
  'APARTMENT_NO_ELEVATOR',
  'APARTMENT_WITH_ELEVATOR',
  'CONDOMINIUM',
]);

export const ParentPresenceEnum = z.enum([
  'ALWAYS',
  'SOMETIMES',
  'RARELY',
  'NEVER',
]);

export const GenderPreferenceEnum = z.enum([
  'FEMALE',
  'MALE',
  'NO_PREFERENCE',
]);

export const AgePreferenceEnum = z.enum([
  'AGE_18_25',
  'AGE_26_35',
  'AGE_36_50',
  'AGE_50_PLUS',
  'NO_PREFERENCE',
]);

// New enums for family
export const GenderEnum = z.enum(['FEMALE', 'MALE', 'OTHER']);

export const FamilyNannyTypeEnum = z.enum(['FOLGUISTA', 'DIARISTA', 'MENSALISTA']);

export const FamilyContractRegimeEnum = z.enum(['AUTONOMA', 'PJ', 'CLT']);

// Form schema for family
export const FormFamilySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phoneNumber: z.string().optional().nullable(),
  emailAddress: z.string().email('E-mail inválido').optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'DELETED']).default('ACTIVE'),
  address: z
    .object({
      zipCode: z.string().min(8, 'CEP inválido'),
      street: z.string().min(1, 'Logradouro obrigatório'),
      number: z.string().min(1, 'Número inválido'),
      complement: z.string().optional().nullable(),
      neighborhood: z.string().min(2, 'Bairro inválido'),
      city: z.string().min(2, 'Cidade inválida'),
      state: z.string().length(2, 'Estado deve ter 2 letras'),
    })
    .optional()
    .nullable(),
  // New fields: CPF, birth date, gender
  cpf: z.string().optional().nullable(),
  birthDate: z.date().optional().nullable(),
  gender: GenderEnum.optional().nullable(),
  // New V2.0 fields
  housingType: HousingTypeEnum.optional().nullable(),
  hasPets: z.boolean().optional(),
  petsDescription: z.string().optional(),
  parentPresence: ParentPresenceEnum.optional().nullable(),
  valuesInNanny: z
    .array(z.string())
    .max(3, 'Máximo 3 valores')
    .optional(),
  careMethodology: z.string().optional(),
  languages: z.array(z.string()).optional(),
  houseRules: z
    .array(z.string())
    .max(4, 'Máximo 4 regras')
    .optional(),
  domesticHelpExpected: z.array(z.string()).optional(),
  nannyGenderPreference: GenderPreferenceEnum.optional().nullable(),
  nannyAgePreference: AgePreferenceEnum.optional().nullable(),
  // New fields: nanny type, contract regime
  nannyType: FamilyNannyTypeEnum.optional().nullable(),
  contractRegime: FamilyContractRegimeEnum.optional().nullable(),
  // New fields: AI-generated content
  familyPresentation: z.string().optional().nullable(),
  jobDescription: z.string().optional().nullable(),
  jobPhotos: z.array(z.string()).optional(),
  // New fields: availability and requirements
  neededDays: z.array(z.string()).optional(),
  neededShifts: z.array(z.string()).optional(),
  requiresNonSmoker: z.boolean().optional(),
  requiresDriverLicense: z.boolean().optional(),
  hourlyRateRange: z.string().optional().nullable(),
});

export type FormFamily = z.infer<typeof FormFamilySchema>;

// Full family schema (from database)
export const FamilySchema = z.object({
  id: z.number(),
  name: z.string(),
  phoneNumber: z.string().nullable(),
  emailAddress: z.string().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'DELETED']),
  addressId: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  // New fields: CPF, birth date, gender
  cpf: z.string().nullable().optional(),
  birthDate: z.date().nullable().optional(),
  gender: GenderEnum.nullable().optional(),
  // New V2.0 fields
  housingType: HousingTypeEnum.nullable().optional(),
  hasPets: z.boolean().optional(),
  petsDescription: z.string().nullable().optional(),
  parentPresence: ParentPresenceEnum.nullable().optional(),
  valuesInNanny: z.array(z.string()).optional(),
  careMethodology: z.string().nullable().optional(),
  languages: z.array(z.string()).optional(),
  houseRules: z.array(z.string()).optional(),
  domesticHelpExpected: z.array(z.string()).optional(),
  nannyGenderPreference: GenderPreferenceEnum.nullable().optional(),
  nannyAgePreference: AgePreferenceEnum.nullable().optional(),
  // New fields: nanny type, contract regime
  nannyType: FamilyNannyTypeEnum.nullable().optional(),
  contractRegime: FamilyContractRegimeEnum.nullable().optional(),
  // New fields: AI-generated content
  familyPresentation: z.string().nullable().optional(),
  jobDescription: z.string().nullable().optional(),
  jobPhotos: z.array(z.string()).optional(),
  // New fields: availability and requirements
  neededDays: z.array(z.string()).optional(),
  neededShifts: z.array(z.string()).optional(),
  requiresNonSmoker: z.boolean().optional(),
  requiresDriverLicense: z.boolean().optional(),
  hourlyRateRange: z.string().nullable().optional(),
  address: z
    .object({
      id: z.number(),
      zipCode: z.string(),
      streetName: z.string().min(1, 'Logradouro obrigatório'),
      number: z.string(),
      complement: z.string().nullable(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string(),
    })
    .nullable(),
  children: z.array(
    z.object({
      id: z.number(),
      name: z.string().nullable().optional(),
      age: z.number().nullable().optional(),
      birthDate: z.date().nullable(),
    }),
  ),
  subscription: z
    .object({
      id: z.number(),
      status: z.string(),
      plan: z.object({
        id: z.number(),
        name: z.string(),
      }),
    })
    .nullable(),
  users: z.array(
    z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable(),
    }),
  ),
  favorites: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
      photoUrl: z.string().nullable(),
    }),
  ),
  jobs: z.array(z.any()).optional(), // New: related jobs
});

export type Family = z.infer<typeof FamilySchema>;

// List item schema (for table display)
export const FamilyListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  phoneNumber: z.string().nullable(),
  emailAddress: z.string().nullable(),
  status: z.string(),
  address: z
    .object({
      city: z.string().nullable(),
      state: z.string().nullable(),
      neighborhood: z.string().nullable(),
    })
    .nullable(),
  children: z.array(
    z.object({
      id: z.number(),
      name: z.string().nullable().optional(),
    }),
  ),
  subscription: z
    .object({
      status: z.string(),
      plan: z.object({
        name: z.string(),
      }),
    })
    .nullable(),
});

export type FamilyListItem = z.infer<typeof FamilyListItemSchema>;

// Subscription schema
export const FamilySubscriptionSchema = z.object({
  id: z.number(),
  familyId: z.number(),
  planId: z.number(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CANCELLED', 'PENDING']),
  startDate: z.date(),
  endDate: z.date().nullable(),
  plan: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.number(),
    billingCycle: z.string(),
    features: z.any(),
  }),
});

export type FamilySubscription = z.infer<typeof FamilySubscriptionSchema>;

// ============ OPÇÕES PARA NOVOS CAMPOS ============

// Opções de gênero para criança
export const CHILD_GENDER_OPTIONS = [
  { value: 'FEMALE', label: 'Feminino' },
  { value: 'MALE', label: 'Masculino' },
] as const;

// Características da criança (máximo 3)
export const CHILD_TRAITS_OPTIONS = [
  { value: 'CALM', label: 'Calmo(a)' },
  { value: 'ACTIVE', label: 'Ativo(a)' },
  { value: 'PLAYFUL', label: 'Brincalhão(a)' },
  { value: 'CREATIVE', label: 'Criativo(a)' },
  { value: 'CURIOUS', label: 'Curioso(a)' },
  { value: 'SENSITIVE', label: 'Sensível' },
  { value: 'SOCIABLE', label: 'Sociável' },
  { value: 'INDEPENDENT', label: 'Independente' },
  { value: 'STUBBORN', label: 'Teimoso(a)' },
] as const;

// Dias da semana
export const NEEDED_DAYS_OPTIONS = [
  { value: 'MONDAY', label: 'Segunda' },
  { value: 'TUESDAY', label: 'Terça' },
  { value: 'WEDNESDAY', label: 'Quarta' },
  { value: 'THURSDAY', label: 'Quinta' },
  { value: 'FRIDAY', label: 'Sexta' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
] as const;

// Turnos
export const NEEDED_SHIFTS_OPTIONS = [
  { value: 'MORNING', label: 'Manhã' },
  { value: 'AFTERNOON', label: 'Tarde' },
  { value: 'NIGHT', label: 'Noite' },
  { value: 'OVERNIGHT', label: 'Pernoite' },
] as const;

// Requisitos obrigatórios
export const MANDATORY_REQUIREMENTS_OPTIONS = [
  { value: 'NON_SMOKER', label: 'Não fumante' },
  { value: 'DRIVER_LICENSE', label: 'Com CNH' },
] as const;

// Valor por hora
export const HOURLY_RATE_OPTIONS = [
  { value: 'UP_TO_20', label: 'Até R$ 20/hora' },
  { value: '20_TO_30', label: 'R$ 20 a R$ 30/hora' },
  { value: '30_TO_40', label: 'R$ 30 a R$ 40/hora' },
  { value: '40_TO_50', label: 'R$ 40 a R$ 50/hora' },
  { value: 'ABOVE_50', label: 'Acima de R$ 50/hora' },
] as const;

// Helper para labels
export function getChildTraitLabel(value: string): string {
  const option = CHILD_TRAITS_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getNeededDayLabel(value: string): string {
  const option = NEEDED_DAYS_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getNeededShiftLabel(value: string): string {
  const option = NEEDED_SHIFTS_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getHourlyRateLabel(value: string): string {
  const option = HOURLY_RATE_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}
