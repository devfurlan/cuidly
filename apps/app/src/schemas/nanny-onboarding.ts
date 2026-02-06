/**
 * Nanny Onboarding Schemas
 * Zod schemas for nanny onboarding validation
 */

import { z } from 'zod';
import { isSafeText } from '@/services/content-moderation';

// Step 1: Localização + Raio de deslocamento
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

// Step 2: Data de nascimento, Telefone, Gênero
export const nannyStep2Schema = z.object({
  birthDate: z.string().min(10, 'Data de nascimento obrigatória'),
  phoneNumber: z.string().min(14, 'Telefone obrigatório'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    required_error: 'Selecione o gênero',
  }),
});

export type NannyStep2Data = z.infer<typeof nannyStep2Schema>;

// Step 3: Anos de experiência, Faixas etárias
export const nannyStep3Schema = z.object({
  experienceYears: z.number().min(-1, 'Selecione os anos de experiência'),
  childAgeExperiences: z.array(z.string()).min(1, 'Selecione pelo menos uma faixa etária'),
});

export type NannyStep3Data = z.infer<typeof nannyStep3Schema>;

// Step 4: Experiência com necessidades especiais
export const nannyStep4Schema = z.object({
  hasSpecialNeedsExperience: z.boolean(),
  specialNeedsExperiences: z.array(z.string()).optional(),
  specialNeedsDescription: z.string().optional(),
});

export type NannyStep4Data = z.infer<typeof nannyStep4Schema>;

// Step 5: Certificações e Idiomas (opcional)
export const nannyStep5Schema = z.object({
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type NannyStep5Data = z.infer<typeof nannyStep5Schema>;

// Step 6: Tipo de criança + Pontos fortes + Quantidade máxima de crianças
export const nannyStep6Schema = z.object({
  childTypePreference: z.array(z.string()).max(2, 'Máximo 2 preferências'),
  strengths: z.array(z.string()).min(1, 'Selecione pelo menos 1').max(3, 'Máximo 3 pontos fortes'),
  maxChildrenCare: z.number().min(1, 'Selecione uma opção'),
});

export type NannyStep6Data = z.infer<typeof nannyStep6Schema>;

// Step 7: Sobre Você (200-2000 caracteres)
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

// Step 8: Pets, Atividades
export const nannyStep8Schema = z.object({
  comfortableWithPets: z.enum(['YES_ANY', 'ONLY_SOME', 'NO'], {
    required_error: 'Selecione uma opção',
  }),
  petsDescription: z.string().optional(),
  acceptedActivities: z.array(z.string()).min(1, 'Selecione pelo menos uma atividade'),
});

export type NannyStep8Data = z.infer<typeof nannyStep8Schema>;

// Step 9: Metodologia, Carro, Fumo, Presença dos pais, Filhos, CNH
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

// Step 10: Referências
export const referenceSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().min(14, 'Telefone obrigatório'),
  relationship: z.string().min(1, 'Relacionamento obrigatório'),
});

export const nannyStep10Schema = z.object({
  references: z.array(referenceSchema).min(2, 'Adicione pelo menos 2 referências'),
});

export type ReferenceData = z.infer<typeof referenceSchema>;
export type NannyStep10Data = z.infer<typeof nannyStep10Schema>;

// Step 11: Disponibilidade e Valores
export const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  periods: z.array(z.enum(['MORNING', 'AFTERNOON', 'NIGHT', 'OVERNIGHT'])).optional(),
});

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

export type DaySchedule = z.infer<typeof dayScheduleSchema>;
export type NannyStep11Data = z.infer<typeof nannyStep11Schema>;

// Combined schema for full nanny onboarding data
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
  // Step 10 - references handled separately
  // Step 11+ - photo handled separately
});

export type NannyOnboardingData = z.infer<typeof nannyOnboardingSchema>;
