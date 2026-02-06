/**
 * Plan Schemas
 * Validation schemas for subscription plan management
 */

import { z } from 'zod';

// ============ ENUMS ============

export const PlanTypeEnum = z.enum(['FAMILY', 'NANNY']);

export const BillingCycleEnum = z.enum([
  'MONTHLY',
  'QUARTERLY',
  'YEARLY',
  'ONE_TIME',
]);

// ============ FEATURES SCHEMA ============

export const PlanFeaturesSchema = z.object({
  viewProfiles: z.number().min(0).default(0),
  startConversations: z.number().min(0).default(0),
  boostPerMonth: z.number().min(0).default(0),
  accessPhone: z.boolean().default(false),
  accessWhatsapp: z.boolean().default(false),
  accessChat: z.boolean().default(false),
  highlightInSearch: z.boolean().default(false),
  prioritySupport: z.boolean().default(false),
  unlimitedSearches: z.boolean().default(false),
  customFeatures: z.array(z.string()).default([]),
});

// ============ PLAN SCHEMAS ============

const BasePlanSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  type: PlanTypeEnum,
  price: z.coerce.number().min(0, 'Preço não pode ser negativo'),
  billingCycle: BillingCycleEnum,
  features: PlanFeaturesSchema,
  isActive: z.boolean().default(true),
});

export const CreatePlanSchema = BasePlanSchema;

export const UpdatePlanSchema = BasePlanSchema.partial().extend({
  name: z.string().min(2).max(100).optional(),
});

// ============ TYPES ============

export type PlanFeatures = z.infer<typeof PlanFeaturesSchema>;
export type CreatePlanData = z.infer<typeof CreatePlanSchema>;
export type UpdatePlanData = z.infer<typeof UpdatePlanSchema>;

// ============ LABELS ============

export const PLAN_TYPE_LABELS: Record<string, string> = {
  FAMILY: 'Família',
  NANNY: 'Babá',
};

export const BILLING_CYCLE_LABELS: Record<string, string> = {
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  YEARLY: 'Anual',
  ONE_TIME: 'Pagamento Único',
};

export const FEATURE_LABELS: Record<
  string,
  { label: string; description: string }
> = {
  viewProfiles: {
    label: 'Visualizar Perfis',
    description:
      'Número de perfis que podem ser visualizados por mês (0 = ilimitado)',
  },
  startConversations: {
    label: 'Iniciar Conversas',
    description:
      'Número de conversas que podem ser iniciadas por mês (0 = ilimitado)',
  },
  boostPerMonth: {
    label: 'Boosts por Mês',
    description: 'Número de destaques de perfil inclusos por mês',
  },
  accessPhone: {
    label: 'Acesso ao Telefone',
    description: 'Permite visualizar o telefone dos perfis',
  },
  accessWhatsapp: {
    label: 'Acesso ao WhatsApp',
    description: 'Permite enviar mensagem pelo WhatsApp',
  },
  accessChat: {
    label: 'Acesso ao Chat',
    description: 'Permite usar o chat interno da plataforma',
  },
  highlightInSearch: {
    label: 'Destaque na Busca',
    description: 'Perfil aparece em destaque nos resultados de busca',
  },
  prioritySupport: {
    label: 'Suporte Prioritário',
    description: 'Atendimento prioritário no suporte',
  },
  unlimitedSearches: {
    label: 'Buscas Ilimitadas',
    description: 'Permite realizar buscas ilimitadas',
  },
};

// ============ DEFAULTS ============

export const DEFAULT_FEATURES: PlanFeatures = {
  viewProfiles: 0,
  startConversations: 0,
  boostPerMonth: 0,
  accessPhone: false,
  accessWhatsapp: false,
  accessChat: false,
  highlightInSearch: false,
  prioritySupport: false,
  unlimitedSearches: false,
  customFeatures: [],
};
