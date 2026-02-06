// Re-export types from core
export type {
  SubscriptionPlan,
  BillingInterval,
} from '@cuidly/core/subscriptions';

export type {
  PaymentStatus,
  PaymentMethod,
  BillingType,
  UserType,
  CreateCustomerInput,
  CreateCustomerResponse,
  CreateSubscriptionInput,
  CreateSubscriptionResponse,
  CreatePaymentLinkInput,
  CreatePaymentLinkResponse,
  CreditCardData,
  CreditCardHolderInfo,
  CreateSubscriptionWithCardInput,
  CreateSubscriptionWithCardResponse,
  CreatePixPaymentInput,
  PixQrCodeData,
  CreatePixPaymentResponse,
  PaymentGatewayResponse,
  IPaymentGateway,
} from '@cuidly/core/payment';

// Re-export status mappers from core
export {
  AsaasStatusMapper,
  StripeStatusMapper,
  mapAsaasStatusToPaymentStatus,
  mapAsaasBillingTypeToPaymentMethod,
  mapStripeStatusToPaymentStatus,
} from '@cuidly/core/payment';

// Local implementations
export { PaymentGatewayFactory } from './gateway-factory';
export { AsaasGateway } from './asaas-gateway';
