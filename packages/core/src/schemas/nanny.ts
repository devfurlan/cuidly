/**
 * Nanny Schemas
 * Consolidated validation schemas for nanny data
 */

import { z } from 'zod';
import { isSafeText } from '../content-moderation';
import { GenderEnum, AddressSchema, FormAddressSchema, dayScheduleSchema } from './common';

// ============ ENUMS ============

export const MaxTravelDistanceEnum = z.enum([
  'UP_TO_5KM',
  'UP_TO_10KM',
  'UP_TO_15KM',
  'UP_TO_20KM',
  'UP_TO_30KM',
  'ENTIRE_CITY',
]);

export const ComfortWithPetsEnum = z.enum(['YES_ANY', 'ONLY_SOME', 'NO']);

export const ParentPresencePreferenceEnum = z.enum([
  'PRESENT',
  'ABSENT',
  'NO_PREFERENCE',
]);

export const SchedulePreferenceEnum = z.enum([
  'FIXED',
  'FLEXIBLE',
  'NO_PREFERENCE',
]);

export const AcceptsOvernightEnum = z.enum(['YES', 'OCCASIONALLY', 'NO']);

export const AcceptsHolidayWorkEnum = z.enum(['YES', 'NO', 'SOMETIMES']);

export const MaritalStatusEnum = z.enum([
  'SINGLE',
  'MARRIED',
  'DIVORCED',
  'WIDOWED',
  'SEPARATED',
  'STABLE_UNION',
  'COMMON_LAW',
]);

export const AllowsMultipleJobsEnum = z.enum(['YES', 'NO', 'DEPENDS']);

export const JobTypeEnum = z.enum(['FIXED', 'SUBSTITUTE', 'OCCASIONAL']);

export const ContractTypeEnum = z.enum([
  'CLT',
  'DAILY_WORKER',
  'MEI',
  'TO_BE_DISCUSSED',
]);

// ============ ONBOARDING STEP SCHEMAS ============

// Step 1: Location + Travel radius
export const nannyStep1Schema = z.object({
  zipCode: z.string().min(9, 'CEP obrigatório'),
  streetName: z.string().min(1, 'Logradouro obrigatório'),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro obrigatório'),
  city: z.string().min(1, 'Cidade obrigatória'),
  state: z.string().min(2, 'Estado obrigatório'),
  travelRadius: z.number().min(1, 'Raio de deslocamento obrigatório').max(100, 'Máximo 100 km'),
});

export type NannyStep1Data = z.infer<typeof nannyStep1Schema>;

// Step 2: Birth date, Phone, Gender
export const nannyStep2Schema = z.object({
  birthDate: z.string().min(10, 'Data de nascimento obrigatória'),
  phoneNumber: z.string().min(14, 'Telefone obrigatório'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    required_error: 'Selecione o gênero',
  }),
});

export type NannyStep2Data = z.infer<typeof nannyStep2Schema>;

// Step 3: Experience years, Age ranges
export const nannyStep3Schema = z.object({
  experienceYears: z.number().min(-1, 'Selecione os anos de experiência'),
  childAgeExperiences: z.array(z.string()).min(1, 'Selecione pelo menos uma faixa etária'),
});

export type NannyStep3Data = z.infer<typeof nannyStep3Schema>;

// Step 4: Special needs experience
export const nannyStep4Schema = z.object({
  hasSpecialNeedsExperience: z.boolean(),
  specialNeedsExperiences: z.array(z.string()).optional(),
  specialNeedsDescription: z.string().optional(),
});

export type NannyStep4Data = z.infer<typeof nannyStep4Schema>;

// Step 5: Certifications and Languages (optional)
export const nannyStep5Schema = z.object({
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type NannyStep5Data = z.infer<typeof nannyStep5Schema>;

// Step 6: Child type preference + Strengths + Max children
export const nannyStep6Schema = z.object({
  childTypePreference: z.array(z.string()).max(2, 'Máximo 2 preferências'),
  strengths: z.array(z.string()).min(1, 'Selecione pelo menos 1').max(3, 'Máximo 3 pontos fortes'),
  maxChildrenCare: z.number().min(1, 'Selecione uma opção'),
});

export type NannyStep6Data = z.infer<typeof nannyStep6Schema>;

// Step 7: About Me (200-2000 characters)
export const nannyStep7Schema = z.object({
  aboutMe: z.string()
    .min(200, 'Mínimo de 200 caracteres')
    .max(2000, 'Máximo de 2000 caracteres')
    .refine(
      (val) => isSafeText(val).safe,
      'Não é permitido incluir dados de contato (telefone, e-mail, redes sociais) na bio'
    ),
});

export type NannyStep7Data = z.infer<typeof nannyStep7Schema>;

// Step 8: Pets, Activities
export const nannyStep8Schema = z.object({
  comfortableWithPets: z.enum(['YES_ANY', 'ONLY_SOME', 'NO'], {
    required_error: 'Selecione uma opção',
  }),
  petsDescription: z.string().optional(),
  acceptedActivities: z.array(z.string()).min(1, 'Selecione pelo menos uma atividade'),
});

export type NannyStep8Data = z.infer<typeof nannyStep8Schema>;

// Step 9: Methodology, Car, Smoking, Parent presence, Children, CNH
export const nannyStep9Schema = z.object({
  careMethodology: z.string().optional(),
  hasVehicle: z.boolean(),
  isSmoker: z.boolean(),
  parentPresencePreference: z.enum(['PRESENT', 'ABSENT', 'NO_PREFERENCE'], {
    required_error: 'Selecione uma opção',
  }),
  hasChildren: z.boolean().optional(),
  hasCnh: z.boolean().optional(),
});

export type NannyStep9Data = z.infer<typeof nannyStep9Schema>;

// Step 10: References
export const onboardingReferenceSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().min(14, 'Telefone obrigatório'),
  relationship: z.string().min(1, 'Relacionamento obrigatório'),
});

export const nannyStep10Schema = z.object({
  references: z.array(onboardingReferenceSchema).min(2, 'Adicione pelo menos 2 referências'),
});

export type NannyStep10Data = z.infer<typeof nannyStep10Schema>;

// Step 11: Availability and Rates
export const nannyStep11Schema = z.object({
  jobTypes: z.array(z.enum(['FIXED', 'SUBSTITUTE', 'OCCASIONAL'])).min(1, 'Selecione pelo menos um tipo de trabalho'),
  schedule: z.object({
    monday: dayScheduleSchema,
    tuesday: dayScheduleSchema,
    wednesday: dayScheduleSchema,
    thursday: dayScheduleSchema,
    friday: dayScheduleSchema,
    saturday: dayScheduleSchema,
    sunday: dayScheduleSchema,
  }),
  monthlyRate: z.number().optional(),
  hourlyRate: z.number().optional(),
  dailyRate: z.number().optional(),
  preferredContractTypes: z.array(z.enum(['CLT', 'DAILY_WORKER', 'MEI', 'TO_BE_DISCUSSED'])).min(1, 'Selecione pelo menos um tipo de contratação'),
});

export type NannyStep11Data = z.infer<typeof nannyStep11Schema>;

// ============ COMBINED ONBOARDING SCHEMA ============

export const nannyOnboardingSchema = z.object({
  // Step 1
  zipCode: z.string().optional(),
  streetName: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  travelRadius: z.number().optional(),
  // Step 2
  birthDate: z.string().optional(),
  phoneNumber: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  // Step 3
  experienceYears: z.number().optional(),
  childAgeExperiences: z.array(z.string()).optional(),
  // Step 4
  hasSpecialNeedsExperience: z.boolean().optional(),
  specialNeedsExperiences: z.array(z.string()).optional(),
  specialNeedsDescription: z.string().optional(),
  // Step 5
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  // Step 6
  childTypePreference: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  // Step 7
  aboutMe: z.string().optional(),
  // Step 8
  comfortableWithPets: z.enum(['YES_ANY', 'ONLY_SOME', 'NO']).optional(),
  petsDescription: z.string().optional(),
  acceptedActivities: z.array(z.string()).optional(),
  // Step 9
  careMethodology: z.string().optional(),
  hasVehicle: z.boolean().optional(),
  isSmoker: z.boolean().optional(),
  parentPresencePreference: z.enum(['PRESENT', 'ABSENT', 'NO_PREFERENCE']).optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'COMMON_LAW']).optional(),
  hasChildren: z.boolean().optional(),
  hasCnh: z.boolean().optional(),
});

export type NannyOnboardingData = z.infer<typeof nannyOnboardingSchema>;

// ============ ADMIN/FULL ENTITY SCHEMAS ============

// Full Nanny schema (for API responses)
export const NannySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  phoneNumber: z.string(),
  addressId: z.number().default(0),
  neighborhood: z.string().nullable().optional(),
  city: z.string().default(''),
  state: z.string().default(''),
  status: z
    .enum(['pending', 'active', 'inactive', 'suspended', 'deleted'])
    .default('pending'),
  birthDate: z.string().datetime().optional(),
  gender: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  emailAddress: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  experienceYears: z.number().nullable().optional(),
  hourlyRate: z.number().nullable().optional(),
  dailyRate: z.number().nullable().optional(),
  monthlyRate: z.number().nullable().optional(),
  viewsCount: z.number(),
  sharesCount: z.number(),
  favoritesCount: z.number(),
  // V2.0 fields
  aboutMe: z.string().nullable().optional(),
  maxTravelDistance: MaxTravelDistanceEnum.nullable().optional(),
  ageRangesExperience: z.array(z.string()).optional(),
  hasSpecialNeedsExperience: z.boolean().optional(),
  specialNeedsExperienceDescription: z.string().nullable().optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.any().nullable().optional(),
  childTypePreference: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  careMethodology: z.string().nullable().optional(),
  hasVehicle: z.boolean().optional(),
  comfortableWithPets: ComfortWithPetsEnum.nullable().optional(),
  petsDescription: z.string().nullable().optional(),
  acceptedActivities: z.array(z.string()).optional(),
  environmentPreference: z.string().nullable().optional(),
  parentPresencePreference: ParentPresencePreferenceEnum.nullable().optional(),
  hasReferences: z.boolean().optional(),
  referencesVerified: z.boolean().optional(),
});

export type Nanny = z.infer<typeof NannySchema>;

// Form schema for creating/editing nannies (admin)
export const FormNannySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'Digite o nome completo (nome e sobrenome)',
    }),
  birthDate: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((val) => {
      const cleanDate = val.replace(/\D/g, '');
      if (cleanDate.length !== 8) return false;
      const day = parseInt(cleanDate.substring(0, 2));
      const month = parseInt(cleanDate.substring(2, 4));
      const year = parseInt(cleanDate.substring(4, 8));
      if (day < 1 || day > 31) return false;
      if (month < 1 || month > 12) return false;
      if (year < 1900 || year > new Date().getFullYear()) return false;
      return true;
    }, {
      message: 'Data de nascimento inválida',
    }),
  cpf: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const cleanCpf = val.replace(/\D/g, '');
      return cleanCpf.length === 11;
    }, {
      message: 'CPF inválido',
    }),
  phoneNumber: z
    .string()
    .min(1, 'Número de telefone é obrigatório')
    .refine((val) => {
      const cleaned = val.replace(/\D/g, '');
      if (cleaned.length !== 10 && cleaned.length !== 11) return false;
      const ddd = parseInt(cleaned.substring(0, 2));
      if (ddd < 11 || ddd > 99) return false;
      if (cleaned.length === 11 && cleaned[2] !== '9') return false;
      if (cleaned.length === 10 && cleaned[2] === '9') return false;
      return true;
    }, {
      message: 'Telefone inválido. Use formato (XX) XXXXX-XXXX',
    }),
  emailAddress: z
    .string()
    .email('E-mail inválido')
    .min(1, 'E-mail é obrigatório'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', '']).optional().nullable(),
  photoUrl: z.string().optional(),
  isSmoker: z.boolean().default(false),
  pixKey: z.string().optional(),
  pixType: z.enum(['CNPJ', 'CPF', 'EMAIL', 'PHONE', 'EVP', 'null']).optional(),
  status: z
    .enum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
    .default('PENDING'),
  // Personal data
  motherName: z.string().optional(),
  birthCity: z.string().optional(),
  birthState: z.string().optional(),
  // Professional fields
  experienceYears: z.number().min(-1).optional(),
  hourlyRate: z.number().min(0).optional(),
  minChildAge: z.number().min(0).max(18).optional(),
  maxChildAge: z.number().min(0).max(18).optional(),
  specialties: z.array(z.string()).optional(),
  availabilitySchedules: z.array(z.string()).optional(),
  serviceTypes: z.array(z.string()).optional(),
  attendanceModes: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  // Bio
  aboutMe: z.string().max(2000, 'Texto muito longo (máximo 2000 caracteres)').optional(),
  // Rates
  dailyRate: z.number().min(0).optional(),
  monthlyRate: z.number().min(0).optional(),
  // V2.0 fields
  maxTravelDistance: MaxTravelDistanceEnum.optional().nullable(),
  ageRangesExperience: z.array(z.string()).optional(),
  hasSpecialNeedsExperience: z.boolean().optional(),
  specialNeedsExperienceDescription: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.any().optional(),
  childTypePreference: z.array(z.string()).max(2, 'Máximo 2 tipos de criança').optional(),
  strengths: z.array(z.string()).max(3, 'Máximo 3 pontos fortes').optional(),
  careMethodology: z.string().optional(),
  hasVehicle: z.boolean().optional(),
  comfortableWithPets: ComfortWithPetsEnum.optional().nullable(),
  petsDescription: z.string().optional(),
  acceptedActivities: z.array(z.string()).optional(),
  environmentPreference: z.string().optional(),
  parentPresencePreference: ParentPresencePreferenceEnum.optional().nullable(),
  hasReferences: z.boolean().optional(),
  referencesVerified: z.boolean().optional(),
  acceptsHolidayWork: AcceptsHolidayWorkEnum.optional().nullable(),
  hourlyRateReference: z.number().min(0).optional(),
  maritalStatus: MaritalStatusEnum.optional().nullable(),
  hasChildren: z.boolean().optional(),
  hasCnh: z.boolean().optional(),
  nannyTypes: z.array(z.string()).optional(),
  contractRegimes: z.array(z.string()).optional(),
  hourlyRateRange: z.string().optional().nullable(),
  activitiesNotAccepted: z.array(z.string()).optional(),
  maxChildrenCare: z.number().min(1).max(10).optional(),
  address: FormAddressSchema,
});

export type FormNanny = z.infer<typeof FormNannySchema>;

// Schema for editing nannies - email is optional
export const FormNannyEditSchema = FormNannySchema.extend({
  emailAddress: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

export type FormNannyEdit = z.infer<typeof FormNannyEditSchema>;
