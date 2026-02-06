import { ValidationStatus, ValidationLevel } from '@prisma/client';

export type ValidationRequest = {
  id: string;
  nannyId: number;
  cpf: string;
  cpfHash: string | null;
  rg: string | null;
  rgIssuingState: string | null;
  name: string;
  motherName: string | null;
  fatherName: string | null;
  birthDate: Date | null;
  bigidResult: unknown | null;
  facematchScore: number | null;
  livenessScore: number | null;
  bigidValid: boolean;
  level: ValidationLevel;
  status: ValidationStatus;
  basicDataResult: unknown | null;
  civilRecordResult: unknown | null;
  federalRecordResult: unknown | null;
  reportUrl: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  completedAt: Date | null;
  nanny: {
    id: number;
    name: string;
    slug: string;
    photoUrl: string | null;
    emailAddress: string | null;
    phoneNumber: string;
    documentValidated: boolean;
    documentExpirationDate: Date | null;
    criminalBackgroundValidated: boolean;
    personalDataValidated: boolean;
  };
};

export const VALIDATION_STATUS_LABELS: Record<ValidationStatus, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluida',
  FAILED: 'Falhou',
};

export const VALIDATION_LEVEL_LABELS: Record<ValidationLevel, string> = {
  BASIC: 'Basica',
  PREMIUM: 'Premium',
};
