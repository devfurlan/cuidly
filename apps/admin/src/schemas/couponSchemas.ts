import { z } from 'zod';
import { SubscriptionPlanSchema } from '@cuidly/core';

export const DiscountTypeEnum = z.enum(['PERCENTAGE', 'FIXED', 'FREE_TRIAL_DAYS']);
export const CouponApplicableToEnum = z.enum([
  'ALL',
  'FAMILIES',
  'NANNIES',
  'SPECIFIC_PLAN',
]);
export const SubscriptionPlanEnum = SubscriptionPlanSchema;

const AllowedUserIdsSchema = z.object({
  nannyIds: z.array(z.number()).default([]),
  familyIds: z.array(z.number()).default([]),
});

const BaseCouponSchema = z.object({
  code: z
    .string()
    .nonempty('Código é obrigatório')
    .min(3, 'Código deve ter no mínimo 3 caracteres')
    .max(50, 'Código deve ter no máximo 50 caracteres')
    .transform((val) => val.toUpperCase().trim()),
  description: z.string().optional().nullable(),
  discountType: DiscountTypeEnum,
  discountValue: z.coerce
    .number()
    .positive('Valor do desconto deve ser maior que 0'),
  maxDiscount: z.coerce.number().positive().optional().nullable(),
  minPurchaseAmount: z.coerce.number().min(0).optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  applicableTo: CouponApplicableToEnum.default('ALL'),
  applicablePlanIds: z.array(z.string()).default([]),
  hasUserRestriction: z.boolean().default(false),
  allowedUserIds: AllowedUserIdsSchema.default({ nannyIds: [], familyIds: [] }),
  allowedEmails: z
    .array(
      z
        .string()
        .email('E-mail inválido')
        .transform((val) => val.toLowerCase().trim()),
    )
    .default([]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
});

export const CouponFormSchema = BaseCouponSchema.refine(
  (data) => {
    if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
      return false;
    }
    return true;
  },
  {
    message: 'Percentual não pode ser maior que 100%',
    path: ['discountValue'],
  },
)
  .refine(
    (data) => {
      if (data.discountType === 'FREE_TRIAL_DAYS') {
        return Number.isInteger(data.discountValue) && data.discountValue > 0 && data.discountValue <= 365;
      }
      return true;
    },
    {
      message: 'Número de dias deve ser um inteiro entre 1 e 365',
      path: ['discountValue'],
    },
  )
  .refine((data) => data.endDate > data.startDate, {
    message: 'Data de término deve ser após a data de início',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (
        data.applicableTo === 'SPECIFIC_PLAN' &&
        data.applicablePlanIds.length === 0
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Selecione pelo menos um plano',
      path: ['applicablePlanIds'],
    },
  )
  .refine(
    (data) => {
      if (data.hasUserRestriction) {
        const hasUsers =
          (data.allowedUserIds?.nannyIds?.length ?? 0) > 0 ||
          (data.allowedUserIds?.familyIds?.length ?? 0) > 0 ||
          (data.allowedEmails?.length ?? 0) > 0;
        return hasUsers;
      }
      return true;
    },
    {
      message:
        'Selecione pelo menos um usuário ou e-mail quando a restrição está ativa',
      path: ['allowedEmails'],
    },
  );

export const CreateCouponSchema = BaseCouponSchema.refine(
  (data) => {
    if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
      return false;
    }
    return true;
  },
  {
    message: 'Percentual não pode ser maior que 100%',
    path: ['discountValue'],
  },
)
  .refine(
    (data) => {
      if (data.discountType === 'FREE_TRIAL_DAYS') {
        return Number.isInteger(data.discountValue) && data.discountValue > 0 && data.discountValue <= 365;
      }
      return true;
    },
    {
      message: 'Número de dias deve ser um inteiro entre 1 e 365',
      path: ['discountValue'],
    },
  )
  .refine((data) => data.endDate > data.startDate, {
    message: 'Data de término deve ser após a data de início',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (
        data.applicableTo === 'SPECIFIC_PLAN' &&
        data.applicablePlanIds.length === 0
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Selecione pelo menos um plano',
      path: ['applicablePlanIds'],
    },
  )
  .refine(
    (data) => {
      if (data.hasUserRestriction) {
        const hasUsers =
          (data.allowedUserIds?.nannyIds?.length ?? 0) > 0 ||
          (data.allowedUserIds?.familyIds?.length ?? 0) > 0 ||
          (data.allowedEmails?.length ?? 0) > 0;
        return hasUsers;
      }
      return true;
    },
    {
      message:
        'Selecione pelo menos um usuário ou e-mail quando a restrição está ativa',
      path: ['allowedEmails'],
    },
  );

export const UpdateCouponSchema = BaseCouponSchema.partial()
  .extend({
    code: z
      .string()
      .nonempty('Código é obrigatório')
      .min(3, 'Código deve ter no mínimo 3 caracteres')
      .max(50, 'Código deve ter no máximo 50 caracteres')
      .transform((val) => val.toUpperCase().trim()),
  })
  .refine(
    (data) => {
      if (
        data.discountType === 'PERCENTAGE' &&
        data.discountValue &&
        data.discountValue > 100
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Percentual não pode ser maior que 100%',
      path: ['discountValue'],
    },
  )
  .refine(
    (data) => {
      if (data.discountType === 'FREE_TRIAL_DAYS' && data.discountValue) {
        return Number.isInteger(data.discountValue) && data.discountValue > 0 && data.discountValue <= 365;
      }
      return true;
    },
    {
      message: 'Número de dias deve ser um inteiro entre 1 e 365',
      path: ['discountValue'],
    },
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate && data.endDate <= data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: 'Data de término deve ser após a data de início',
      path: ['endDate'],
    },
  )
  .refine(
    (data) => {
      if (
        data.applicableTo === 'SPECIFIC_PLAN' &&
        data.applicablePlanIds &&
        data.applicablePlanIds.length === 0
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Selecione pelo menos um plano',
      path: ['applicablePlanIds'],
    },
  )
  .refine(
    (data) => {
      if (data.hasUserRestriction) {
        const hasUsers =
          (data.allowedUserIds?.nannyIds?.length ?? 0) > 0 ||
          (data.allowedUserIds?.familyIds?.length ?? 0) > 0 ||
          (data.allowedEmails?.length ?? 0) > 0;
        return hasUsers;
      }
      return true;
    },
    {
      message:
        'Selecione pelo menos um usuário ou e-mail quando a restrição está ativa',
      path: ['allowedEmails'],
    },
  );

export type CouponFormData = z.infer<typeof CouponFormSchema>;
export type CreateCouponData = z.infer<typeof CreateCouponSchema>;
export type UpdateCouponData = z.infer<typeof UpdateCouponSchema>;

// Labels para exibicao
export const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: 'Percentual',
  FIXED: 'Valor Fixo',
  FREE_TRIAL_DAYS: 'Dias de Teste Grátis',
};

export const APPLICABLE_TO_LABELS: Record<string, string> = {
  ALL: 'Todos',
  FAMILIES: 'Apenas Famílias',
  NANNIES: 'Apenas Babás',
  SPECIFIC_PLAN: 'Planos Específicos',
};

export { PLAN_LABELS as SUBSCRIPTION_PLAN_LABELS } from '@cuidly/core';
