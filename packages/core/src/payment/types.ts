/**
 * Payment Types
 * Core payment types and interfaces - gateway agnostic
 */

// Re-use SubscriptionPlan and BillingInterval from subscriptions module
import type {
  SubscriptionPlan,
  BillingInterval,
} from '../subscriptions';

// ===============================================
// Payment-specific types
// ===============================================

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'PAID'
  | 'FAILED'
  | 'CANCELED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'OVERDUE'
  | 'CHARGEBACK'
  | 'AWAITING_RISK_ANALYSIS';

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'PIX'
  | 'BOLETO'
  | 'BANK_TRANSFER'
  | 'PAYPAL'
  | 'WALLET'
  | 'MANUAL';

export type BillingType = 'CREDIT_CARD' | 'BOLETO' | 'PIX';

export type UserType = 'nanny' | 'family';

// ===============================================
// Customer Inputs/Outputs
// ===============================================

export interface CreateCustomerInput {
  userId: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  userType: UserType;
}

export interface CreateCustomerResponse {
  externalCustomerId: string;
}

// ===============================================
// Subscription Inputs/Outputs
// ===============================================

export interface CreateSubscriptionInput {
  customerId: string;
  plan: SubscriptionPlan;
  billingInterval: BillingInterval;
  billingType: BillingType;
  value?: number; // Custom value (with coupon discount)
}

export interface CreateSubscriptionResponse {
  externalSubscriptionId: string;
}

// ===============================================
// Payment Link Inputs/Outputs
// ===============================================

export interface CreatePaymentLinkInput {
  subscriptionId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePaymentLinkResponse {
  checkoutUrl: string;
}

// ===============================================
// Credit Card (Transparent Checkout)
// ===============================================

export interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string;
  phone: string;
  mobilePhone: string;
}

export interface CreateSubscriptionWithCardInput {
  customerId: string;
  plan: SubscriptionPlan;
  billingInterval: BillingInterval;
  value: number;
  creditCard: CreditCardData;
  creditCardHolderInfo: CreditCardHolderInfo;
  /** Description shown in payment gateway */
  description: string;
  /** Optional: Set the first payment date (for free trials). Format: YYYY-MM-DD */
  nextDueDate?: string;
}

export interface CreateSubscriptionWithCardResponse {
  externalSubscriptionId: string;
  status: string;
}

// ===============================================
// PIX (Transparent Checkout)
// ===============================================

export interface CreatePixPaymentInput {
  customerId: string;
  value: number;
  description: string;
  dueDate?: string;
}

export interface PixQrCodeData {
  encodedImage: string; // Base64 QR Code image
  payload: string; // Pix copia e cola
  expirationDate: string;
}

export interface CreatePixPaymentResponse {
  externalPaymentId: string;
  status: string;
  pixQrCode: PixQrCodeData;
}

// ===============================================
// Invoice/NF Management
// ===============================================

export interface InvoiceData {
  id: string;
  status: 'PENDING' | 'AUTHORIZED' | 'PROCESSING' | 'SENT' | 'CANCELLED' | 'ERROR';
  externalInvoiceUrl?: string;
  paymentId: string;
}

// ===============================================
// Generic Gateway Response
// ===============================================

export interface PaymentGatewayResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
}

// ===============================================
// Abstract Payment Gateway Interface
// ===============================================

export interface IPaymentGateway {
  createCustomer(
    input: CreateCustomerInput
  ): Promise<PaymentGatewayResponse<CreateCustomerResponse>>;
  createSubscription(
    input: CreateSubscriptionInput
  ): Promise<PaymentGatewayResponse<CreateSubscriptionResponse>>;
  createPaymentLink(
    input: CreatePaymentLinkInput
  ): Promise<PaymentGatewayResponse<CreatePaymentLinkResponse>>;
  cancelSubscription(subscriptionId: string): Promise<PaymentGatewayResponse>;
  getSubscription(subscriptionId: string): Promise<PaymentGatewayResponse>;
  getPayment(paymentId: string): Promise<PaymentGatewayResponse>;
  cancelInvoice(invoiceId: string): Promise<PaymentGatewayResponse>;
  getInvoice(invoiceId: string): Promise<PaymentGatewayResponse<InvoiceData>>;
}
