/**
 * Family Onboarding Schemas
 * Zod schemas for family onboarding validation
 */

import { z } from 'zod';

// Step 1: Dados Pessoais
export const step1Schema = z.object({
  responsibleName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().min(14, 'Telefone inválido'),
  email: z.string().email('E-mail inválido'),
  numberOfChildren: z.string().min(1, 'Selecione o número de filhos'),
});

export type Step1Data = z.infer<typeof step1Schema>;

// Step 2: Child Basic Info
export const step2Schema = z.object({
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

export type Step2Data = z.infer<typeof step2Schema>;

// Step 3: Child Care Priorities
export const step3Schema = z.object({
  carePriorities: z.array(z.string()).min(1, 'Selecione pelo menos 1').max(3, 'Máximo 3 prioridades'),
});

export type Step3Data = z.infer<typeof step3Schema>;

// Step 4: Child Special Needs
export const step4Schema = z.object({
  hasSpecialNeeds: z.boolean(),
  specialNeedsTypes: z.array(z.string()).optional(),
  specialNeedsDescription: z.string().optional(), // deprecated
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

export type Step4Data = z.infer<typeof step4Schema>;

// Step 6: Moradia e Pets
export const step6Schema = z.object({
  housingType: z.enum(['HOUSE', 'APARTMENT_NO_ELEVATOR', 'APARTMENT_WITH_ELEVATOR', 'CONDOMINIUM'], {
    required_error: 'Selecione o tipo de moradia',
  }),
  hasPets: z.boolean(),
  petTypes: z.array(z.string()).optional(),
  petsDescription: z.string().optional(),
});

export type Step6Data = z.infer<typeof step6Schema>;

// Step 7: Ambiente de Trabalho
export const step7Schema = z.object({
  parentPresence: z.enum(['ALWAYS', 'SOMETIMES', 'RARELY', 'NEVER'], {
    required_error: 'Selecione uma opção',
  }),
});

export type Step7Data = z.infer<typeof step7Schema>;

// Step 8: O Que Você Valoriza (max 3)
export const step8Schema = z.object({
  values: z.array(z.string()).min(1, 'Selecione pelo menos 1 valor').max(3, 'Máximo 3 valores'),
});

export type Step8Data = z.infer<typeof step8Schema>;

// Step 9: Preferências Gerais (optional)
export const step9Schema = z.object({
  careMethodology: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

export type Step9Data = z.infer<typeof step9Schema>;

// Step 10: Regras e Ajuda Doméstica
export const step10Schema = z.object({
  houseRules: z.array(z.string()).max(4, 'Máximo 4 regras').optional(),
  domesticHelp: z.array(z.string()).optional(),
});

export type Step10Data = z.infer<typeof step10Schema>;

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
  specialNeedsDescription: z.string().optional(), // deprecated
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
  specialNeedsDescription: z.string().optional(), // deprecated
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

export type ChildData = z.infer<typeof childDataSchema>;

// Schema para dados de criança no onboarding
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
  specialNeedsDescription: z.string().optional(), // deprecated
  unborn: z.boolean(),
});

export type OnboardingChildData = z.infer<typeof onboardingChildSchema>;

// Schema para validar lista de crianças
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

// Schema para disponibilidade no onboarding
// Slots are stored as "DAY_SHIFT" strings, e.g., "MONDAY_MORNING", "TUESDAY_AFTERNOON"
export const availabilitySchema = z.object({
  slots: z.array(z.string()).min(1, 'Selecione pelo menos um horário'),
});

export type AvailabilityData = z.infer<typeof availabilitySchema>;

// Helper to convert slots to neededDays/neededShifts for database
export function slotsToArrays(slots: string[]): { neededDays: string[]; neededShifts: string[] } {
  const daysSet = new Set<string>();
  const shiftsSet = new Set<string>();

  for (const slot of slots) {
    const lastUnderscore = slot.lastIndexOf('_');
    if (lastUnderscore > 0) {
      const day = slot.substring(0, lastUnderscore);
      const shift = slot.substring(lastUnderscore + 1);
      daysSet.add(day);
      shiftsSet.add(shift);
    }
  }

  return {
    neededDays: Array.from(daysSet),
    neededShifts: Array.from(shiftsSet),
  };
}

// Helper to convert neededDays/neededShifts back to slots (for loading existing data)
// Note: This creates all combinations, which may not be accurate for existing data
export function arraysToSlots(neededDays: string[], neededShifts: string[]): string[] {
  const slots: string[] = [];
  for (const day of neededDays) {
    for (const shift of neededShifts) {
      slots.push(`${day}_${shift}`);
    }
  }
  return slots;
}

// Combined schema for full onboarding data
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
