import { z } from 'zod';

// Day schedule schema
export const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

// Weekly schedule schema
export const weeklyScheduleSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema,
});

// Job creation schema
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
export type DaySchedule = z.infer<typeof dayScheduleSchema>;
export type WeeklySchedule = z.infer<typeof weeklyScheduleSchema>;

// Job type options
export const JOB_TYPE_OPTIONS = [
  { value: 'FIXED', label: 'Babá Fixa', description: 'Trabalho com horário fixo semanal' },
  { value: 'SUBSTITUTE', label: 'Folguista', description: 'Cobertura de folgas e férias' },
  { value: 'OCCASIONAL', label: 'Eventual', description: 'Trabalhos pontuais e avulsos' },
] as const;

// Contract type options
export const CONTRACT_TYPE_OPTIONS = [
  { value: 'CLT', label: 'CLT', description: 'Carteira assinada' },
  { value: 'DAILY_WORKER', label: 'Diarista', description: 'Pagamento por dia trabalhado' },
  { value: 'MEI', label: 'MEI/PJ', description: 'Microempreendedor Individual' },
  { value: 'TO_BE_DISCUSSED', label: 'A combinar', description: 'Aberta a discussão' },
] as const;

// Payment type options
export const PAYMENT_TYPE_OPTIONS = [
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'HOURLY', label: 'Por hora' },
  { value: 'DAILY', label: 'Por dia' },
] as const;

// Overnight options
export const OVERNIGHT_OPTIONS = [
  { value: 'NO', label: 'Não', description: 'Não requer pernoite' },
  { value: 'SOMETIMES', label: 'Às vezes', description: 'Ocasionalmente pode precisar' },
  { value: 'FREQUENTLY', label: 'Frequentemente', description: 'Pernoite é necessário regularmente' },
] as const;

// Benefits options
export const BENEFITS_OPTIONS = [
  { value: 'MEAL', label: 'Alimentação' },
  { value: 'TRANSPORT', label: 'Vale transporte' },
  { value: 'HEALTH_INSURANCE', label: 'Plano de saúde' },
  { value: 'DENTAL_INSURANCE', label: 'Plano odontológico' },
  { value: 'THIRTEENTH_SALARY', label: '13º salário' },
  { value: 'VACATION', label: 'Férias remuneradas' },
  { value: 'BONUS', label: 'Bônus' },
  { value: 'ACCOMMODATION', label: 'Alojamento' },
] as const;

// Mandatory requirements options
export const MANDATORY_REQUIREMENTS_OPTIONS = [
  { value: 'NON_SMOKER', label: 'Não fumante' },
  { value: 'HAS_VEHICLE', label: 'Possui veículo próprio' },
  { value: 'ACCEPTS_CAMERAS', label: 'Aceita câmeras de monitoramento' },
  { value: 'SPECIAL_NEEDS_EXPERIENCE', label: 'Experiência com necessidades especiais' },
  { value: 'PET_FRIENDLY', label: 'Confortável com animais' },
  { value: 'GENDER_PREFERENCE', label: 'Preferência de gênero obrigatória' },
  { value: 'CERT_FIRST_AID', label: 'Certificado em Primeiros Socorros' },
  { value: 'CERT_CPR', label: 'Certificado em RCP' },
  { value: 'CERT_CHILD_DEVELOPMENT', label: 'Formação em Desenvolvimento Infantil' },
] as const;

// Days of the week
export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira', short: 'Seg' },
  { key: 'tuesday', label: 'Terça-feira', short: 'Ter' },
  { key: 'wednesday', label: 'Quarta-feira', short: 'Qua' },
  { key: 'thursday', label: 'Quinta-feira', short: 'Qui' },
  { key: 'friday', label: 'Sexta-feira', short: 'Sex' },
  { key: 'saturday', label: 'Sábado', short: 'Sáb' },
  { key: 'sunday', label: 'Domingo', short: 'Dom' },
] as const;

// Time options for schedule
export const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00',
] as const;
