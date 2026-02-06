import { z } from 'zod';
import { JobTypeEnum, ContractTypeEnum } from './nannySchemas';

// Enums specific to Job
export const RequiresOvernightEnum = z.enum(['NO', 'SOMETIMES', 'FREQUENTLY']);

export const PaymentTypeEnum = z.enum(['MONTHLY', 'HOURLY', 'DAILY']);

export const JobStatusEnum = z.enum(['ACTIVE', 'PAUSED', 'CLOSED']);

export const JobApplicationStatusEnum = z.enum([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
]);

// Schema for Job model
export const JobSchema = z.object({
  id: z.number(),
  familyId: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  jobType: JobTypeEnum,
  schedule: z.any(), // JSON - schedule by day of week
  requiresOvernight: RequiresOvernightEnum,
  contractType: ContractTypeEnum,
  benefits: z.array(z.string()),
  paymentType: PaymentTypeEnum,
  budgetMin: z.number(),
  budgetMax: z.number(),
  childrenIds: z.array(z.number()),
  mandatoryRequirements: z.array(z.string()),
  allowsMultipleJobs: z.boolean(),
  startDate: z.string().datetime(),
  status: JobStatusEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().nullable().optional(),
  // Relations
  family: z.any().optional(),
  applications: z.array(z.any()).optional(),
});

export type Job = z.infer<typeof JobSchema>;

// Form schema for creating/editing jobs
export const FormJobSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().max(2000).optional(),
  jobType: JobTypeEnum,
  schedule: z.any(), // JSON - will be validated separately
  requiresOvernight: RequiresOvernightEnum,
  contractType: ContractTypeEnum,
  benefits: z.array(z.string()).optional(),
  paymentType: PaymentTypeEnum,
  budgetMin: z.number().min(0, 'Valor mínimo deve ser maior que 0'),
  budgetMax: z.number().min(0, 'Valor máximo deve ser maior que 0'),
  childrenIds: z.array(z.number()).min(1, 'Selecione pelo menos uma criança'),
  mandatoryRequirements: z.array(z.string()).optional(),
  allowsMultipleJobs: z.boolean().default(true),
  startDate: z.string().nonempty('Data de início é obrigatória'),
  status: JobStatusEnum.default('ACTIVE'),
});

export type FormJob = z.infer<typeof FormJobSchema>;

// Schema for JobApplication model
export const JobApplicationSchema = z.object({
  id: z.number(),
  jobId: z.number(),
  nannyId: z.number(),
  status: JobApplicationStatusEnum,
  matchScore: z.number().nullable().optional(),
  message: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  // Relations
  job: z.any().optional(),
  nanny: z.any().optional(),
});

export type JobApplication = z.infer<typeof JobApplicationSchema>;

// Form schema for creating job applications
export const FormJobApplicationSchema = z.object({
  jobId: z.number(),
  message: z.string().max(500, 'Mensagem muito longa').optional(),
});

export type FormJobApplication = z.infer<typeof FormJobApplicationSchema>;

// Requires overnight options
export const REQUIRES_OVERNIGHT_OPTIONS = [
  { value: 'NO', label: 'Não' },
  { value: 'SOMETIMES', label: 'Às vezes' },
  { value: 'FREQUENTLY', label: 'Frequentemente' },
] as const;

// Payment type options
export const PAYMENT_TYPE_OPTIONS = [
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'HOURLY', label: 'Por hora' },
  { value: 'DAILY', label: 'Diária' },
] as const;

// Job status options
export const JOB_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'CLOSED', label: 'Encerrado' },
] as const;

// Job application status options
export const JOB_APPLICATION_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'ACCEPTED', label: 'Aceita' },
  { value: 'REJECTED', label: 'Rejeitada' },
  { value: 'WITHDRAWN', label: 'Retirada' },
] as const;

// Common job benefits options
export const JOB_BENEFITS_OPTIONS = [
  { value: 'vale_transporte', label: 'Vale Transporte' },
  { value: 'vale_alimentacao', label: 'Vale Alimentação' },
  { value: 'plano_saude', label: 'Plano de Saúde' },
  { value: 'decimo_terceiro', label: '13º Salário' },
  { value: 'ferias', label: 'Férias remuneradas' },
  { value: 'fgts', label: 'FGTS' },
  { value: 'folga_semanal', label: 'Folga semanal' },
  { value: 'alimentacao_local', label: 'Alimentação no local' },
] as const;

// Mandatory requirements options
export const MANDATORY_REQUIREMENTS_OPTIONS = [
  { value: 'experiencia_comprovada', label: 'Experiência comprovada' },
  { value: 'referencias', label: 'Referências verificáveis' },
  { value: 'primeiros_socorros', label: 'Curso de primeiros socorros' },
  { value: 'nao_fumante', label: 'Não fumante' },
  { value: 'cnh', label: 'Carteira de motorista' },
  { value: 'disponibilidade_imediata', label: 'Disponibilidade imediata' },
  { value: 'morar_proximo', label: 'Morar próximo' },
] as const;
