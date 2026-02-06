/**
 * Family Schemas
 * Consolidated validation schemas for family data
 */

import { z } from 'zod';
import { GenderEnum, FormAddressSchema, AddressSchema } from './common';

// ============ ENUMS ============

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

export const FamilyNannyTypeEnum = z.enum(['FOLGUISTA', 'DIARISTA', 'MENSALISTA']);

export const FamilyContractRegimeEnum = z.enum(['AUTONOMA', 'PJ', 'CLT']);

// ============ ONBOARDING STEP SCHEMAS ============

// Step 1: Personal Data
export const familyStep1Schema = z.object({
  responsibleName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().min(14, 'Telefone inválido'),
  email: z.string().email('E-mail inválido'),
  numberOfChildren: z.string().min(1, 'Selecione o número de filhos'),
});

export type FamilyStep1Data = z.infer<typeof familyStep1Schema>;

// Step 2: Child Basic Info
export const familyStep2Schema = z.object({
  name: z.string().optional(),
  birthDate: z.string().min(1, 'Data de nascimento obrigatória').refine(
    (date) => {
      if (!date) return false;
      const birthDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return birthDate <= today;
    },
    { message: 'Data de nascimento não pode ser no futuro' }
  ),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
    required_error: 'Selecione o gênero',
  }),
});

export type FamilyStep2Data = z.infer<typeof familyStep2Schema>;

// Step 3: Child Care Priorities
export const familyStep3Schema = z.object({
  carePriorities: z.array(z.string()).min(1, 'Selecione pelo menos 1').max(3, 'Máximo 3 prioridades'),
});

export type FamilyStep3Data = z.infer<typeof familyStep3Schema>;

// Step 4: Child Special Needs
export const familyStep4Schema = z.object({
  hasSpecialNeeds: z.boolean(),
  specialNeedsTypes: z.array(z.string()).optional(),
  specialNeedsDescription: z.string().optional(),
  allergies: z.string().optional(),
  routine: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.hasSpecialNeeds) {
      return data.specialNeedsTypes && data.specialNeedsTypes.length > 0;
    }
    return true;
  },
  {
    message: 'Selecione pelo menos um tipo de necessidade especial',
    path: ['specialNeedsTypes'],
  }
);

export type FamilyStep4Data = z.infer<typeof familyStep4Schema>;

// Step 6: Housing and Pets
export const familyStep6Schema = z.object({
  housingType: z.enum(['HOUSE', 'APARTMENT_NO_ELEVATOR', 'APARTMENT_WITH_ELEVATOR', 'CONDOMINIUM'], {
    required_error: 'Selecione o tipo de moradia',
  }),
  hasPets: z.boolean(),
  petTypes: z.array(z.string()).optional(),
  petsDescription: z.string().optional(),
});

export type FamilyStep6Data = z.infer<typeof familyStep6Schema>;

// Step 7: Work Environment
export const familyStep7Schema = z.object({
  parentPresence: z.enum(['ALWAYS', 'SOMETIMES', 'RARELY', 'NEVER'], {
    required_error: 'Selecione uma opção',
  }),
});

export type FamilyStep7Data = z.infer<typeof familyStep7Schema>;

// Step 8: Values (max 3)
export const familyStep8Schema = z.object({
  values: z.array(z.string()).min(1, 'Selecione pelo menos 1 valor').max(3, 'Máximo 3 valores'),
});

export type FamilyStep8Data = z.infer<typeof familyStep8Schema>;

// Step 9: General Preferences (optional)
export const familyStep9Schema = z.object({
  careMethodology: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

export type FamilyStep9Data = z.infer<typeof familyStep9Schema>;

// Step 10: Rules and Domestic Help
export const familyStep10Schema = z.object({
  houseRules: z.array(z.string()).max(4, 'Máximo 4 regras').optional(),
  domesticHelp: z.array(z.string()).optional(),
});

export type FamilyStep10Data = z.infer<typeof familyStep10Schema>;

// ============ CHILD SCHEMAS ============

// Child Basic Info Schema
export const childBasicInfoSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento obrigatória'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    required_error: 'Selecione o gênero',
  }),
});

export type ChildBasicInfoData = z.infer<typeof childBasicInfoSchema>;

// Child Care Priorities Schema
export const childCarePrioritiesSchema = z.object({
  carePriorities: z.array(z.string()).min(1, 'Selecione pelo menos 1').max(3, 'Máximo 3 prioridades'),
  routine: z.string().optional(),
});

export type ChildCarePrioritiesData = z.infer<typeof childCarePrioritiesSchema>;

// Child Special Needs Schema
export const childSpecialNeedsSchema = z.object({
  hasSpecialNeeds: z.boolean(),
  specialNeedsTypes: z.array(z.string()).optional(),
  specialNeedsDescription: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

export type ChildSpecialNeedsData = z.infer<typeof childSpecialNeedsSchema>;

// Combined Child Data
export const childDataSchema = z.object({
  name: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  carePriorities: z.array(z.string()).optional(),
  routine: z.string().optional(),
  hasSpecialNeeds: z.boolean().optional(),
  specialNeedsTypes: z.array(z.string()).optional(),
  specialNeedsDescription: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

export type ChildData = z.infer<typeof childDataSchema>;

// Onboarding Child Schema (with unborn support)
export const onboardingChildSchema = z.object({
  id: z.number().optional(),
  tempId: z.string().optional(),
  name: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']),
  birthDate: z.string().nullable(),
  expectedBirthDate: z.string().nullable(),
  carePriorities: z.array(z.string()).max(3, 'Máximo 3 prioridades de cuidado'),
  hasSpecialNeeds: z.boolean(),
  specialNeedsTypes: z.array(z.string()).optional(),
  specialNeedsDescription: z.string().optional(),
  unborn: z.boolean(),
});

export type OnboardingChildData = z.infer<typeof onboardingChildSchema>;

// Children list validation
export const childrenListSchema = z.array(onboardingChildSchema).min(1, 'Adicione pelo menos uma criança').refine(
  (children) => {
    for (const child of children) {
      if (!child.unborn) {
        if (!child.name?.trim()) return false;
        if (!child.birthDate) return false;
        const birthDate = new Date(child.birthDate);
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
        eighteenYearsAgo.setHours(0, 0, 0, 0);
        if (birthDate <= eighteenYearsAgo) return false;
      } else {
        if (!child.expectedBirthDate) return false;
        const expectedDate = new Date(child.expectedBirthDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expectedDate <= today) return false;
      }
    }
    return true;
  },
  {
    message: 'Preencha todos os dados obrigatórios das crianças',
  }
);

// ============ AVAILABILITY SCHEMA ============

export const availabilitySchema = z.object({
  slots: z.array(z.string()).min(1, 'Selecione pelo menos um horário'),
});

export type AvailabilityData = z.infer<typeof availabilitySchema>;

// Helper functions for slot conversion are in @cuidly/core/matching
// Re-export for backwards compatibility
export {
  slotsToArrays,
  arraysToSlots,
} from '../matching/availability';

// ============ COMBINED ONBOARDING SCHEMA ============

export const familyOnboardingSchema = z.object({
  // Step 1
  responsibleName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  numberOfChildren: z.string().optional(),
  // Step 2
  housingType: z.enum(['HOUSE', 'APARTMENT_NO_ELEVATOR', 'APARTMENT_WITH_ELEVATOR', 'CONDOMINIUM']).optional(),
  hasPets: z.boolean().optional(),
  petsDescription: z.string().optional(),
  // Step 3
  parentPresence: z.enum(['ALWAYS', 'SOMETIMES', 'RARELY', 'NEVER']).optional(),
  houseRules: z.array(z.string()).optional(),
  // Step 4
  values: z.array(z.string()).optional(),
  // Step 5
  preferredAge: z.string().optional(),
  preferredExperience: z.string().optional(),
  languagePreference: z.string().optional(),
  otherPreferences: z.string().optional(),
  // Step 6
  domesticHelp: z.boolean().optional(),
  domesticHelpDetails: z.string().optional(),
  additionalRules: z.string().optional(),
});

export type FamilyOnboardingData = z.infer<typeof familyOnboardingSchema>;

// ============ ADMIN/FULL ENTITY SCHEMAS ============

// Status options
export const FAMILY_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
  { value: 'PENDING', label: 'Pendente' },
] as const;

// Form schema for family (admin)
export const FormFamilySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phoneNumber: z.string().optional().nullable(),
  emailAddress: z.string().email('E-mail inválido').optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'DELETED']).default('ACTIVE'),
  address: FormAddressSchema.optional().nullable(),
  // Personal data
  cpf: z.string().optional().nullable(),
  birthDate: z.date().optional().nullable(),
  gender: GenderEnum.optional().nullable(),
  // V2.0 fields
  housingType: HousingTypeEnum.optional().nullable(),
  hasPets: z.boolean().optional(),
  petsDescription: z.string().optional(),
  parentPresence: ParentPresenceEnum.optional().nullable(),
  valuesInNanny: z.array(z.string()).max(3, 'Máximo 3 valores').optional(),
  careMethodology: z.string().optional(),
  languages: z.array(z.string()).optional(),
  houseRules: z.array(z.string()).max(4, 'Máximo 4 regras').optional(),
  domesticHelpExpected: z.array(z.string()).optional(),
  nannyGenderPreference: GenderPreferenceEnum.optional().nullable(),
  nannyAgePreference: AgePreferenceEnum.optional().nullable(),
  nannyType: FamilyNannyTypeEnum.optional().nullable(),
  contractRegime: FamilyContractRegimeEnum.optional().nullable(),
  // AI-generated content
  familyPresentation: z.string().optional().nullable(),
  jobDescription: z.string().optional().nullable(),
  jobPhotos: z.array(z.string()).optional(),
  // Availability and requirements
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
  // Personal data
  cpf: z.string().nullable().optional(),
  birthDate: z.date().nullable().optional(),
  gender: GenderEnum.nullable().optional(),
  // V2.0 fields
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
  nannyType: FamilyNannyTypeEnum.nullable().optional(),
  contractRegime: FamilyContractRegimeEnum.nullable().optional(),
  familyPresentation: z.string().nullable().optional(),
  jobDescription: z.string().nullable().optional(),
  jobPhotos: z.array(z.string()).optional(),
  neededDays: z.array(z.string()).optional(),
  neededShifts: z.array(z.string()).optional(),
  requiresNonSmoker: z.boolean().optional(),
  requiresDriverLicense: z.boolean().optional(),
  hourlyRateRange: z.string().nullable().optional(),
  address: AddressSchema.nullable().optional(),
  children: z.array(
    z.object({
      id: z.number(),
      name: z.string().nullable().optional(),
      age: z.number().nullable().optional(),
      birthDate: z.date().nullable(),
    })
  ).optional(),
  subscription: z
    .object({
      id: z.number(),
      status: z.string(),
      plan: z.object({
        id: z.number(),
        name: z.string(),
      }),
    })
    .nullable()
    .optional(),
  users: z.array(
    z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable(),
    })
  ).optional(),
  favorites: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
      photoUrl: z.string().nullable(),
    })
  ).optional(),
  jobs: z.array(z.any()).optional(),
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
      name: z.string(),
    })
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
