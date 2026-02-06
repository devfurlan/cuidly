/**
 * Payment Status Mappers
 * Maps gateway-specific statuses to domain statuses
 */

import type { PaymentStatus, PaymentMethod } from './types';

// ===============================================
// Asaas Status Mapper
// ===============================================

const ASAAS_PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  RECEIVED: 'PAID',
  OVERDUE: 'OVERDUE',
  REFUNDED: 'REFUNDED',
  RECEIVED_IN_CASH: 'PAID',
  REFUND_REQUESTED: 'PROCESSING',
  CHARGEBACK_REQUESTED: 'CHARGEBACK',
  CHARGEBACK_DISPUTE: 'CHARGEBACK',
  AWAITING_CHARGEBACK_REVERSAL: 'CHARGEBACK',
  AWAITING_RISK_ANALYSIS: 'AWAITING_RISK_ANALYSIS',
};

const ASAAS_PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = {
  CREDIT_CARD: 'CREDIT_CARD',
  BOLETO: 'BOLETO',
  PIX: 'PIX',
  DEBIT_CARD: 'DEBIT_CARD',
};

export class AsaasStatusMapper {
  static toPaymentStatus(asaasStatus: string): PaymentStatus {
    return ASAAS_PAYMENT_STATUS_MAP[asaasStatus] || 'PENDING';
  }

  static toPaymentMethod(asaasBillingType: string): PaymentMethod {
    return ASAAS_PAYMENT_METHOD_MAP[asaasBillingType] || 'MANUAL';
  }
}

// ===============================================
// Stripe Status Mapper
// ===============================================

const STRIPE_PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = {
  succeeded: 'PAID',
  processing: 'PROCESSING',
  requires_payment_method: 'PENDING',
  requires_confirmation: 'PENDING',
  requires_action: 'PENDING',
  canceled: 'CANCELED',
  failed: 'FAILED',
};

export class StripeStatusMapper {
  static toPaymentStatus(stripeStatus: string): PaymentStatus {
    return STRIPE_PAYMENT_STATUS_MAP[stripeStatus] || 'PENDING';
  }
}

// ===============================================
// Functional alternatives (if you prefer)
// ===============================================

export function mapAsaasStatusToPaymentStatus(
  asaasStatus: string
): PaymentStatus {
  return ASAAS_PAYMENT_STATUS_MAP[asaasStatus] || 'PENDING';
}

export function mapAsaasBillingTypeToPaymentMethod(
  billingType: string
): PaymentMethod {
  return ASAAS_PAYMENT_METHOD_MAP[billingType] || 'MANUAL';
}

export function mapStripeStatusToPaymentStatus(
  stripeStatus: string
): PaymentStatus {
  return STRIPE_PAYMENT_STATUS_MAP[stripeStatus] || 'PENDING';
}
