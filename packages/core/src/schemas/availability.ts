/**
 * Nanny Availability Schemas
 * Validation schemas for nanny availability management
 */

import { z } from 'zod';
import {
  JobTypeEnum,
  SchedulePreferenceEnum,
  AcceptsOvernightEnum,
  ContractTypeEnum,
  AllowsMultipleJobsEnum,
} from './nanny';

// ============ SCHEMAS ============

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

// ============ OPTIONS ============
// Note: Options like JOB_TYPE_OPTIONS and CONTRACT_TYPE_OPTIONS
// are exported from constants/job-options.ts to avoid duplication.
// Import from '@cuidly/core/constants' for option arrays.

// Schedule preference options (specific to availability)
export const AVAILABILITY_SCHEDULE_PREFERENCE_OPTIONS = [
  { value: 'FIXED', label: 'Horário fixo' },
  { value: 'FLEXIBLE', label: 'Horário flexível' },
  { value: 'NO_PREFERENCE', label: 'Sem preferência' },
] as const;

// Accepts overnight options (specific to availability)
export const AVAILABILITY_ACCEPTS_OVERNIGHT_OPTIONS = [
  { value: 'YES', label: 'Sim' },
  { value: 'OCCASIONALLY', label: 'Ocasionalmente' },
  { value: 'NO', label: 'Não' },
] as const;

// Allows multiple jobs options (specific to availability)
export const AVAILABILITY_ALLOWS_MULTIPLE_JOBS_OPTIONS = [
  { value: 'YES', label: 'Sim' },
  { value: 'NO', label: 'Não' },
  { value: 'DEPENDS', label: 'Depende' },
] as const;
