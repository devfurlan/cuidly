type PaymentStatus =
  | 'TO_EXECUTE'
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'DELETED';

const gatewayStatusMaps: Record<string, Record<string, PaymentStatus>> = {
  asaas: {
    DONE: 'COMPLETED',
    RECEIVED: 'COMPLETED',
    CONFIRMED: 'COMPLETED',
    PENDING: 'PENDING',
    OVERDUE: 'PENDING',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED',
    CHARGEBACK: 'CANCELLED',
  },
  anotherGateway: {
    SUCCESS: 'COMPLETED',
    FAILED: 'FAILED',
    PENDING: 'PENDING',
  },
};

export function mapPaymentGatewayStatusToLocalStatus(
  status: string,
  gatewayName: string = 'asaas',
): PaymentStatus {
  const statusMap = gatewayStatusMaps[gatewayName];

  if (!statusMap) {
    throw new Error(`Unknown gateway: ${gatewayName}`);
  }

  return statusMap[status] || 'PENDING';
}
