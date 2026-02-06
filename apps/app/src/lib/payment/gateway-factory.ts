import { PaymentGateway } from '@prisma/client';
import { AsaasGateway } from './asaas-gateway';
import { IPaymentGateway } from '@cuidly/core/payment';

export class PaymentGatewayFactory {
  static create(gateway: PaymentGateway): IPaymentGateway {
    switch (gateway) {
      case 'ASAAS':
        return new AsaasGateway();
      case 'STRIPE':
        throw new Error('Stripe gateway não implementado');
      case 'MERCADO_PAGO':
        throw new Error('Mercado Pago gateway não implementado');
      default:
        throw new Error(`Gateway ${gateway} não suportado`);
    }
  }
}
