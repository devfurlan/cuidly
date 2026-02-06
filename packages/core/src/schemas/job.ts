/**
 * Job Schemas
 * Consolidated validation schemas for job data
 */

import { z } from 'zod';
import { dayScheduleSchema, weeklyScheduleSchema } from './common';

// ============ ENUMS ============

export const JobTypeEnum = z.enum(['FIXED', 'SUBSTITUTE', 'OCCASIONAL']);

export const ContractTypeEnum = z.enum([
  'CLT',
  'DAILY_WORKER',
  'MEI',
  'TO_BE_DISCUSSED',
]);

export const PaymentTypeEnum = z.enum(['MONTHLY', 'HOURLY', 'DAILY']);

export const RequiresOvernightEnum = z.enum(['NO', 'SOMETIMES', 'FREQUENTLY']);

export const JobStatusEnum = z.enum([
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'FILLED',
  'CLOSED',
  'EXPIRED',
]);

export const JobApplicationStatusEnum = z.enum([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
]);

// ============ JOB CREATION SCHEMA ============

export const createJobSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  jobType: z.enum(['FIXED', 'SUBSTITUTE', 'OCCASIONAL'], {
    required_error: 'Selecione o tipo de trabalho',
  }),
  schedule: weeklyScheduleSchema,
  requiresOvernight: z.enum(['NO', 'SOMETIMES', 'FREQUENTLY'], {
    required_error: 'Selecione se requer pernoite',
  }),
  contractType: z.enum(['CLT', 'DAILY_WORKER', 'MEI', 'TO_BE_DISCUSSED'], {
    required_error: 'Selecione o tipo de contratação',
  }),
  benefits: z.array(z.string()).optional(),
  paymentType: z.enum(['MONTHLY', 'HOURLY', 'DAILY'], {
    required_error: 'Selecione o tipo de pagamento',
  }),
  budgetMin: z.number().min(0, 'Valor mínimo inválido'),
  budgetMax: z.number().min(0, 'Valor máximo inválido'),
  childrenIds: z.array(z.number()).min(1, 'Selecione pelo menos uma criança'),
  mandatoryRequirements: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  startDate: z.string().min(1, 'Data de início obrigatória'),
}).refine(
  (data) => data.budgetMax >= data.budgetMin,
  {
    message: 'Valor máximo deve ser maior ou igual ao mínimo',
    path: ['budgetMax'],
  }
);

export type CreateJobData = z.infer<typeof createJobSchema>;

// Re-export types from common
export type { DaySchedule, WeeklySchedule } from './common';

// ============ ADMIN JOB SCHEMAS ============

// Full Job schema (for API responses)
export const JobSchema = z.object({
  id: z.number(),
  familyId: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  jobType: JobTypeEnum,
  contractType: ContractTypeEnum,
  paymentType: PaymentTypeEnum,
  requiresOvernight: RequiresOvernightEnum,
  budgetMin: z.number(),
  budgetMax: z.number(),
  benefits: z.array(z.string()).optional(),
  mandatoryRequirements: z.array(z.string()).optional(),
  schedule: z.any().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  status: JobStatusEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  // Relations
  family: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  children: z.array(
    z.object({
      id: z.number(),
      name: z.string().nullable(),
      birthDate: z.date().nullable().optional(),
    })
  ).optional(),
  applications: z.array(z.any()).optional(),
});

export type Job = z.infer<typeof JobSchema>;

// Form schema for creating/editing jobs (admin)
export const FormJobSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().optional(),
  jobType: JobTypeEnum,
  contractType: ContractTypeEnum,
  paymentType: PaymentTypeEnum,
  requiresOvernight: RequiresOvernightEnum,
  budgetMin: z.number().min(0, 'Valor mínimo inválido'),
  budgetMax: z.number().min(0, 'Valor máximo inválido'),
  benefits: z.array(z.string()).optional(),
  mandatoryRequirements: z.array(z.string()).optional(),
  schedule: weeklyScheduleSchema.optional(),
  startDate: z.string().optional(),
  status: JobStatusEnum.default('DRAFT'),
  childrenIds: z.array(z.number()).optional(),
}).refine(
  (data) => data.budgetMax >= data.budgetMin,
  {
    message: 'Valor máximo deve ser maior ou igual ao mínimo',
    path: ['budgetMax'],
  }
);

export type FormJob = z.infer<typeof FormJobSchema>;

// ============ JOB APPLICATION SCHEMAS ============

export const JobApplicationSchema = z.object({
  id: z.number(),
  jobId: z.number(),
  nannyId: z.number(),
  status: JobApplicationStatusEnum,
  message: z.string().nullable().optional(),
  appliedAt: z.string().datetime(),
  respondedAt: z.string().datetime().nullable().optional(),
  // Relations
  job: z.object({
    id: z.number(),
    title: z.string(),
    family: z.object({
      id: z.number(),
      name: z.string(),
    }),
  }).optional(),
  nanny: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    photoUrl: z.string().nullable(),
  }).optional(),
});

export type JobApplication = z.infer<typeof JobApplicationSchema>;

export const FormJobApplicationSchema = z.object({
  jobId: z.number(),
  nannyId: z.number(),
  message: z.string().optional(),
});

export type FormJobApplication = z.infer<typeof FormJobApplicationSchema>;
