import { BillingInterval } from '@prisma/client';
import { getPlanPrice } from '@/services/coupon';
import {
  CreateCustomerInput,
  CreateCustomerResponse,
  CreatePaymentLinkInput,
  CreatePaymentLinkResponse,
  CreateSubscriptionInput,
  CreateSubscriptionResponse,
  CreateSubscriptionWithCardInput,
  CreateSubscriptionWithCardResponse,
  CreatePixPaymentInput,
  CreatePixPaymentResponse,
  IPaymentGateway,
  PaymentGatewayResponse,
  InvoiceData,
} from '@cuidly/core/payment';

// Nomes dos grupos de clientes no Asaas
const ASAAS_CUSTOMER_GROUPS = {
  FAMILY: 'Famílias',
  NANNY: 'Profissionais',
} as const;

export class AsaasGateway implements IPaymentGateway {
  private accessToken: string;
  private baseUrl: string;

  constructor() {
    this.accessToken = process.env.ASAAS_API_KEY!;
    this.baseUrl =
      process.env.ASAAS_ENVIRONMENT === 'production'
        ? 'https://api.asaas.com/v3'
        : 'https://sandbox.asaas.com/api/v3';
  }

  async createCustomer(
    input: CreateCustomerInput,
  ): Promise<PaymentGatewayResponse<CreateCustomerResponse>> {
    try {
      // Determinar o grupo do cliente baseado no tipo de usuário
      const groupId = input.userType === 'family'
        ? ASAAS_CUSTOMER_GROUPS.FAMILY
        : ASAAS_CUSTOMER_GROUPS.NANNY;

      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: this.accessToken,
        },
        body: JSON.stringify({
          name: input.name,
          email: input.email,
          cpfCnpj: input.cpfCnpj,
          phone: input.phone,
          groupName: groupId,
          notificationDisabled: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.errors?.[0]?.description || 'Erro ao criar cliente',
        };
      }

      return { success: true, data: { externalCustomerId: data.id } };
    } catch {
      return { success: false, error: 'Erro de conexão com o gateway' };
    }
  }

  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<PaymentGatewayResponse<CreateSubscriptionResponse>> {
    try {
      const cycle = this.getBillingCycle(input.billingInterval);
      const value = input.value ?? getPlanPrice(input.plan, input.billingInterval);

      const nextDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]; // 7 dias

      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: this.accessToken,
        },
        body: JSON.stringify({
          customer: input.customerId,
          billingType: input.billingType,
          cycle,
          value,
          nextDueDate,
          invoice: {
            effectiveDate: nextDueDate, // Ativa emissão automática de NF
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.errors?.[0]?.description || 'Erro ao criar assinatura',
        };
      }

      return { success: true, data: { externalSubscriptionId: data.id } };
    } catch {
      return { success: false, error: 'Erro de conexao com o gateway' };
    }
  }

  async createPaymentLink(
    input: CreatePaymentLinkInput,
  ): Promise<PaymentGatewayResponse<CreatePaymentLinkResponse>> {
    try {
      // No Asaas, o link de pagamento e gerado automaticamente na criação da assinatura
      // Aqui retornamos o link de checkout do Asaas
      const checkoutUrl = `${this.baseUrl.replace('/v3', '')}/checkout/${input.subscriptionId}`;

      return { success: true, data: { checkoutUrl } };
    } catch {
      return { success: false, error: 'Erro ao gerar link de pagamento' };
    }
  }

  async cancelSubscription(
    subscriptionId: string,
  ): Promise<PaymentGatewayResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/subscriptions/${subscriptionId}`,
        {
          method: 'DELETE',
          headers: {
            access_token: this.accessToken,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        return {
          success: false,
          error: data.errors?.[0]?.description || 'Erro ao cancelar assinatura',
        };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Erro de conexao com o gateway' };
    }
  }

  async getSubscription(
    subscriptionId: string,
  ): Promise<PaymentGatewayResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/subscriptions/${subscriptionId}`,
        {
          headers: {
            access_token: this.accessToken,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: 'Assinatura nao encontrada' };
      }

      return { success: true, data };
    } catch {
      return { success: false, error: 'Erro de conexao com o gateway' };
    }
  }

  async getPayment(paymentId: string): Promise<PaymentGatewayResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          access_token: this.accessToken,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: 'Pagamento nao encontrado' };
      }

      return { success: true, data };
    } catch {
      return { success: false, error: 'Erro de conexao com o gateway' };
    }
  }

  /**
   * Buscar pagamentos de uma assinatura
   */
  async getSubscriptionPayments(
    subscriptionId: string,
  ): Promise<PaymentGatewayResponse<Array<{ id: string; status: string }>>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/subscriptions/${subscriptionId}/payments`,
        {
          headers: {
            access_token: this.accessToken,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: 'Erro ao buscar pagamentos da assinatura' };
      }

      return { success: true, data: data.data || [] };
    } catch {
      return { success: false, error: 'Erro de conexao com o gateway' };
    }
  }

  /**
   * Buscar QR Code PIX de um pagamento
   */
  async getPixQrCode(
    paymentId: string,
  ): Promise<PaymentGatewayResponse<{ encodedImage: string; payload: string; expirationDate: string }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/payments/${paymentId}/pixQrCode`,
        {
          headers: {
            access_token: this.accessToken,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: 'Erro ao buscar QR Code PIX' };
      }

      return {
        success: true,
        data: {
          encodedImage: data.encodedImage,
          payload: data.payload,
          expirationDate: data.expirationDate,
        },
      };
    } catch {
      return { success: false, error: 'Erro de conexao com o gateway' };
    }
  }

  /**
   * Checkout Transparente - Criar assinatura com cartão de crédito
   * Os dados do cartão são enviados diretamente ao Asaas (sem armazenar)
   */
  async createSubscriptionWithCard(
    input: CreateSubscriptionWithCardInput,
  ): Promise<PaymentGatewayResponse<CreateSubscriptionWithCardResponse>> {
    try {
      const cycle = this.getBillingCycle(input.billingInterval);
      // Use provided nextDueDate (for trials) or today for immediate charge
      const nextDueDate = input.nextDueDate ?? new Date().toISOString().split('T')[0];

      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: this.accessToken,
        },
        body: JSON.stringify({
          customer: input.customerId,
          billingType: 'CREDIT_CARD',
          cycle,
          value: input.value,
          nextDueDate,
          description: input.description,
          creditCard: {
            holderName: input.creditCard.holderName,
            number: input.creditCard.number,
            expiryMonth: input.creditCard.expiryMonth,
            expiryYear: input.creditCard.expiryYear,
            ccv: input.creditCard.ccv,
          },
          creditCardHolderInfo: {
            name: input.creditCardHolderInfo.name,
            email: input.creditCardHolderInfo.email,
            cpfCnpj: input.creditCardHolderInfo.cpfCnpj,
            postalCode: input.creditCardHolderInfo.postalCode,
            addressNumber: input.creditCardHolderInfo.addressNumber,
            addressComplement: input.creditCardHolderInfo.addressComplement,
            phone: input.creditCardHolderInfo.phone,
            mobilePhone: input.creditCardHolderInfo.mobilePhone,
          },
          invoice: {
            effectiveDate: nextDueDate, // Ativa emissão automática de NF
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Asaas createSubscriptionWithCard error:', data);
        return {
          success: false,
          error: data.errors?.[0]?.description || 'Erro ao processar pagamento com cartao',
        };
      }

      return {
        success: true,
        data: {
          externalSubscriptionId: data.id,
          status: data.status,
        },
      };
    } catch (error) {
      console.error('Asaas createSubscriptionWithCard exception:', error);
      return { success: false, error: 'Erro de conexao com o gateway de pagamento' };
    }
  }

  /**
   * Checkout Transparente - Criar assinatura com PIX recorrente
   * Cria uma assinatura e retorna o QR Code da primeira cobrança
   */
  async createPixSubscription(
    input: CreatePixPaymentInput & { billingInterval: BillingInterval },
  ): Promise<PaymentGatewayResponse<CreatePixPaymentResponse & { externalSubscriptionId: string }>> {
    try {
      const cycle = this.getBillingCycle(input.billingInterval);
      const dueDate = new Date().toISOString().split('T')[0]; // Hoje

      // 1. Criar assinatura com PIX
      const subscriptionResponse = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: this.accessToken,
        },
        body: JSON.stringify({
          customer: input.customerId,
          billingType: 'PIX',
          cycle,
          value: input.value,
          nextDueDate: dueDate,
          description: input.description,
          invoice: {
            effectiveDate: dueDate, // Ativa emissão automática de NF
          },
        }),
      });

      const subscriptionData = await subscriptionResponse.json();

      if (!subscriptionResponse.ok) {
        console.error('Asaas createPixSubscription error:', subscriptionData);
        return {
          success: false,
          error: subscriptionData.errors?.[0]?.description || 'Erro ao criar assinatura PIX',
        };
      }

      // 2. Buscar a primeira cobrança da assinatura para pegar o QR Code
      const paymentsResponse = await fetch(
        `${this.baseUrl}/subscriptions/${subscriptionData.id}/payments`,
        {
          headers: {
            access_token: this.accessToken,
          },
        },
      );

      const paymentsData = await paymentsResponse.json();

      if (!paymentsResponse.ok || !paymentsData.data?.length) {
        console.error('Asaas getSubscriptionPayments error:', paymentsData);
        return {
          success: false,
          error: 'Erro ao buscar cobrança da assinatura',
        };
      }

      const firstPayment = paymentsData.data[0];

      // 3. Buscar QR Code do PIX da primeira cobrança
      const qrCodeResponse = await fetch(
        `${this.baseUrl}/payments/${firstPayment.id}/pixQrCode`,
        {
          headers: {
            access_token: this.accessToken,
          },
        },
      );

      const qrCodeData = await qrCodeResponse.json();

      if (!qrCodeResponse.ok) {
        console.error('Asaas getPixQrCode error:', qrCodeData);
        return {
          success: false,
          error: 'Erro ao gerar QR Code PIX',
        };
      }

      return {
        success: true,
        data: {
          externalSubscriptionId: subscriptionData.id,
          externalPaymentId: firstPayment.id,
          status: subscriptionData.status,
          pixQrCode: {
            encodedImage: qrCodeData.encodedImage,
            payload: qrCodeData.payload,
            expirationDate: qrCodeData.expirationDate,
          },
        },
      };
    } catch (error) {
      console.error('Asaas createPixSubscription exception:', error);
      return { success: false, error: 'Erro de conexao com o gateway de pagamento' };
    }
  }

  /**
   * Checkout Transparente - Criar cobrança PIX avulsa (sem recorrência)
   * @deprecated Use createPixSubscription para cobranças recorrentes
   */
  async createPixPayment(
    input: CreatePixPaymentInput,
  ): Promise<PaymentGatewayResponse<CreatePixPaymentResponse>> {
    try {
      // 1. Criar cobrança PIX
      const dueDate = input.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 24h

      const paymentResponse = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: this.accessToken,
        },
        body: JSON.stringify({
          customer: input.customerId,
          billingType: 'PIX',
          value: input.value,
          dueDate,
          description: input.description,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        console.error('Asaas createPixPayment error:', paymentData);
        return {
          success: false,
          error: paymentData.errors?.[0]?.description || 'Erro ao criar cobranca PIX',
        };
      }

      // 2. Buscar QR Code do PIX
      const qrCodeResponse = await fetch(`${this.baseUrl}/payments/${paymentData.id}/pixQrCode`, {
        headers: {
          access_token: this.accessToken,
        },
      });

      const qrCodeData = await qrCodeResponse.json();

      if (!qrCodeResponse.ok) {
        console.error('Asaas getPixQrCode error:', qrCodeData);
        return {
          success: false,
          error: 'Erro ao gerar QR Code PIX',
        };
      }

      return {
        success: true,
        data: {
          externalPaymentId: paymentData.id,
          status: paymentData.status,
          pixQrCode: {
            encodedImage: qrCodeData.encodedImage,
            payload: qrCodeData.payload,
            expirationDate: qrCodeData.expirationDate,
          },
        },
      };
    } catch (error) {
      console.error('Asaas createPixPayment exception:', error);
      return { success: false, error: 'Erro de conexao com o gateway de pagamento' };
    }
  }

  /**
   * Cancelar Nota Fiscal (Invoice)
   * Cancela uma NF emitida pelo Asaas
   */
  async cancelInvoice(invoiceId: string): Promise<PaymentGatewayResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/invoices/${invoiceId}`,
        {
          method: 'DELETE',
          headers: {
            access_token: this.accessToken,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        return {
          success: false,
          error: data.errors?.[0]?.description || 'Erro ao cancelar NF',
        };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Erro de conexão com o gateway' };
    }
  }

  /**
   * Buscar informações de uma Nota Fiscal (Invoice)
   */
  async getInvoice(
    invoiceId: string,
  ): Promise<PaymentGatewayResponse<InvoiceData>> {
    try {
      const response = await fetch(`${this.baseUrl}/invoices/${invoiceId}`, {
        headers: {
          access_token: this.accessToken,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: 'NF não encontrada' };
      }

      return {
        success: true,
        data: {
          id: data.id,
          status: data.status,
          externalInvoiceUrl: data.pdfUrl || data.xmlUrl,
          paymentId: data.payment,
        },
      };
    } catch {
      return { success: false, error: 'Erro de conexão com o gateway' };
    }
  }

  /**
   * Convert BillingInterval to Asaas cycle format
   */
  private getBillingCycle(
    interval: BillingInterval,
  ): 'MONTHLY' | 'QUARTERLY' | 'YEARLY' {
    switch (interval) {
      case 'MONTH':
        return 'MONTHLY';
      case 'QUARTER':
        return 'QUARTERLY';
      case 'YEAR':
        return 'YEARLY';
      default:
        return 'MONTHLY';
    }
  }
}
