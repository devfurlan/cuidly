/**
 * Zod schemas for subscription-related validation
 */

import { z } from 'zod';
import { SubscriptionPlan } from './plans';
import { BillingInterval } from './billing';

// Plan enum schema
export const SubscriptionPlanSchema = z.enum([
  SubscriptionPlan.FAMILY_FREE,
  SubscriptionPlan.FAMILY_PLUS,
  SubscriptionPlan.NANNY_FREE,
  SubscriptionPlan.NANNY_PRO,
]);

// Billing interval schema
export const BillingIntervalSchema = z.enum([
  BillingInterval.MONTH,
  BillingInterval.QUARTER,
  BillingInterval.YEAR,
]);

// Paid plans only schema
export const PaidPlanSchema = z.enum([
  SubscriptionPlan.FAMILY_PLUS,
  SubscriptionPlan.NANNY_PRO,
]);

// Schema for checkout/subscription creation
export const SubscriptionCreateSchema = z
  .object({
    plan: PaidPlanSchema,
    billingInterval: BillingIntervalSchema,
  })
  .refine(
    (data) => {
      // Validate that billing interval is valid for the selected plan
      if (data.plan === SubscriptionPlan.FAMILY_PLUS) {
        return (
          data.billingInterval === BillingInterval.MONTH ||
          data.billingInterval === BillingInterval.QUARTER
        );
      }
      if (data.plan === SubscriptionPlan.NANNY_PRO) {
        return (
          data.billingInterval === BillingInterval.MONTH ||
          data.billingInterval === BillingInterval.YEAR
        );
      }
      return false;
    },
    {
      message: 'Combinação de plano e intervalo de cobrança inválida',
      path: ['billingInterval'],
    }
  );

export type SubscriptionCreateInput = z.infer<typeof SubscriptionCreateSchema>;
