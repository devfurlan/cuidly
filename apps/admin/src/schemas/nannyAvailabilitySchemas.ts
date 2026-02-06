import { z } from 'zod';
import {
  JobTypeEnum,
  SchedulePreferenceEnum,
  AcceptsOvernightEnum,
  ContractTypeEnum,
  AllowsMultipleJobsEnum,
} from './nannySchemas';

// Schema for NannyAvailability model
export const NannyAvailabilitySchema = z.object({
  id: z.number(),
  nannyId: z.number(),
  jobTypes: z.array(JobTypeEnum),
  schedule: z.any(), // JSON - schedule by day of week
  schedulePreference: SchedulePreferenceEnum.nullable().optional(),
  acceptsOvernight: AcceptsOvernightEnum.nullable().optional(),
  availableFrom: z.string().datetime(),
  monthlyRate: z.number().nullable().optional(),
  hourlyRate: z.number().nullable().optional(),
  dailyRate: z.number().nullable().optional(),
  preferredContractTypes: z.array(ContractTypeEnum),
  allowsMultipleJobs: AllowsMultipleJobsEnum.nullable().optional(),
  lastUpdated: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type NannyAvailability = z.infer<typeof NannyAvailabilitySchema>;

// Form schema for creating/editing availability
export const FormNannyAvailabilitySchema = z.object({
  jobTypes: z
    .array(JobTypeEnum)
    .min(1, 'Selecione pelo menos um tipo de trabalho'),
  schedule: z.any(), // JSON - will be validated separately
  schedulePreference: SchedulePreferenceEnum.optional().nullable(),
  acceptsOvernight: AcceptsOvernightEnum.optional().nullable(),
  availableFrom: z.string().nonempty('Data de disponibilidade é obrigatória'),
  monthlyRate: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  dailyRate: z.number().min(0).optional(),
  preferredContractTypes: z.array(ContractTypeEnum).optional(),
  allowsMultipleJobs: AllowsMultipleJobsEnum.optional().nullable(),
});

export type FormNannyAvailability = z.infer<typeof FormNannyAvailabilitySchema>;

// Job type options
export const JOB_TYPE_OPTIONS = [
  { value: 'FIXED', label: 'Fixo' },
  { value: 'SUBSTITUTE', label: 'Substituta' },
  { value: 'OCCASIONAL', label: 'Eventual' },
] as const;

// Schedule preference options
export const SCHEDULE_PREFERENCE_OPTIONS = [
  { value: 'FIXED', label: 'Horario fixo' },
  { value: 'FLEXIBLE', label: 'Horario flexivel' },
  { value: 'NO_PREFERENCE', label: 'Sem preferencia' },
] as const;

// Accepts overnight options
export const ACCEPTS_OVERNIGHT_OPTIONS = [
  { value: 'YES', label: 'Sim' },
  { value: 'OCCASIONALLY', label: 'Ocasionalmente' },
  { value: 'NO', label: 'Nao' },
] as const;

// Contract type options
export const CONTRACT_TYPE_OPTIONS = [
  { value: 'CLT', label: 'CLT' },
  { value: 'DAILY_WORKER', label: 'Diarista' },
  { value: 'MEI', label: 'MEI' },
  { value: 'TO_BE_DISCUSSED', label: 'A combinar' },
] as const;

// Allows multiple jobs options
export const ALLOWS_MULTIPLE_JOBS_OPTIONS = [
  { value: 'YES', label: 'Sim' },
  { value: 'NO', label: 'Nao' },
  { value: 'DEPENDS', label: 'Depende' },
] as const;
