import { JobStatus, JobType, ContractType, JobPaymentType, RequiresOvernight } from '@prisma/client';

export type Job = {
  id: number;
  familyId: number;
  title: string;
  description: string | null;
  jobType: JobType;
  schedule: unknown;
  requiresOvernight: RequiresOvernight;
  contractType: ContractType;
  benefits: string[];
  paymentType: JobPaymentType;
  budgetMin: number;
  budgetMax: number;
  childrenIds: number[];
  mandatoryRequirements: string[];
  allowsMultipleJobs: boolean;
  startDate: Date;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  family: {
    id: number;
    name: string;
  };
  _count?: {
    applications: number;
  };
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  ACTIVE: 'Ativa',
  PAUSED: 'Pausada',
  CLOSED: 'Encerrada',
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FIXED: 'Fixa',
  SUBSTITUTE: 'Substituta',
  OCCASIONAL: 'Eventual',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  CLT: 'CLT',
  DAILY_WORKER: 'Diarista',
  MEI: 'MEI',
  TO_BE_DISCUSSED: 'A combinar',
};

export const PAYMENT_TYPE_LABELS: Record<JobPaymentType, string> = {
  MONTHLY: 'Mensal',
  HOURLY: 'Por hora',
  DAILY: 'Por dia',
};

export const REQUIRES_OVERNIGHT_LABELS: Record<RequiresOvernight, string> = {
  NO: 'Nao',
  SOMETIMES: 'As vezes',
  FREQUENTLY: 'Frequentemente',
};
