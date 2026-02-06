'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  PiArrowLeft,
  PiCheck,
  PiCircleNotch,
  PiCopy,
  PiCreditCard,
  PiPixLogo,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import { toast } from 'sonner';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/shadcn/alert';
import { Button } from '@/components/ui/shadcn/button';
import { cn } from '@cuidly/shared';

// Tipos
interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  description: string | null;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
  externalPaymentId: string | null;
  externalInvoiceUrl: string | null;
  subscription: {
    id: string;
    plan: string;
    billingInterval: string;
    status: string;
  } | null;
  pixData: {
    qrCodeImage: string;
    copyPaste: string;
    expiresAt: string;
  } | null;
  cardData: {
    lastDigits: string | null;
    brand: string | null;
  } | null;
}

// Helpers
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusConfig(status: string, paymentMethod: string | null) {
  const isPix = paymentMethod === 'PIX';

  switch (status) {
    case 'PENDING':
      return {
        label: isPix ? 'Aguardando pagamento' : 'Processando',
        color: 'bg-yellow-100 text-yellow-800',
        icon: PiCircleNotch,
        iconClass: isPix ? '' : 'animate-spin',
      };
    case 'AWAITING_RISK_ANALYSIS':
      return {
        label: 'Em análise antifraude',
        color: 'bg-blue-100 text-blue-800',
        icon: PiCircleNotch,
        iconClass: 'animate-spin',
      };
    case 'PROCESSING':
      return {
        label: 'Processando',
        color: 'bg-yellow-100 text-yellow-800',
        icon: PiCircleNotch,
        iconClass: 'animate-spin',
      };
    case 'CONFIRMED':
    case 'PAID':
      return {
        label: 'Pago',
        color: 'bg-green-100 text-green-800',
        icon: PiCheck,
        iconClass: '',
      };
    case 'FAILED':
      return {
        label: isPix ? 'Expirado' : 'Recusado',
        color: 'bg-red-100 text-red-800',
        icon: PiX,
        iconClass: '',
      };
    case 'CANCELED':
      return {
        label: 'Cancelado',
        color: 'bg-gray-100 text-gray-800',
        icon: PiX,
        iconClass: '',
      };
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return {
        label: 'Estornado',
        color: 'bg-purple-100 text-purple-800',
        icon: PiArrowLeft,
        iconClass: '',
      };
    case 'OVERDUE':
      return {
        label: 'Vencido',
        color: 'bg-red-100 text-red-800',
        icon: PiWarningCircle,
        iconClass: '',
      };
    default:
      return {
        label: status,
        color: 'bg-gray-100 text-gray-800',
        icon: PiCircleNotch,
        iconClass: '',
      };
  }
}

function getPlanName(plan: string): string {
  switch (plan) {
    case 'FAMILY_PLUS':
      return 'Cuidly Plus';
    case 'NANNY_PRO':
      return 'Cuidly Pro';
    default:
      return plan;
  }
}

function getBillingIntervalName(interval: string): string {
  switch (interval) {
    case 'MONTH':
      return 'Mensal';
    case 'QUARTER':
      return 'Trimestral';
    case 'YEAR':
      return 'Anual';
    default:
      return interval;
  }
}

function getPaymentMethodName(method: string | null): string {
  switch (method) {
    case 'PIX':
      return 'PIX';
    case 'CREDIT_CARD':
      return 'Cartão de Crédito';
    case 'DEBIT_CARD':
      return 'Cartão de Débito';
    case 'BOLETO':
      return 'Boleto';
    default:
      return method || 'Não informado';
  }
}

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.paymentId as string;

  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Carregar detalhes do pagamento
  useEffect(() => {
    const loadPayment = async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erro ao carregar pagamento');
          return;
        }

        setPayment(data);
      } catch (err) {
        console.error('Erro ao carregar pagamento:', err);
        setError('Erro ao carregar pagamento');
      } finally {
        setIsLoading(false);
      }
    };

    loadPayment();
  }, [paymentId]);

  // Copiar código PIX
  const handleCopyPix = async () => {
    if (!payment?.pixData?.copyPaste) return;

    try {
      await navigator.clipboard.writeText(payment.pixData.copyPaste);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar código');
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 animate-spin rounded-full border-4 border-fuchsia-200 border-t-fuchsia-600" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (error || !payment) {
    return (
      <div className="py-8">
        <Alert variant="destructive">
          <PiWarningCircle className="size-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {error || 'Pagamento não encontrado'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/app/assinatura/gerenciar">
            <Button variant="outline">
              <PiArrowLeft className="mr-2 size-4" />
              Voltar para Histórico
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(payment.status, payment.paymentMethod);
  const StatusIcon = statusConfig.icon;
  const isPending = [
    'PENDING',
    'PROCESSING',
    'AWAITING_RISK_ANALYSIS',
  ].includes(payment.status);
  const isPaid = ['CONFIRMED', 'PAID'].includes(payment.status);
  const isFailed = ['FAILED', 'CANCELED', 'OVERDUE'].includes(payment.status);

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/app/assinatura/gerenciar"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <PiArrowLeft className="mr-1 size-4" />
          Voltar para Histórico
        </Link>
      </div>

      {/* Card principal */}
      <div className="rounded-xl border bg-white shadow-sm">
        {/* Header do card */}
        <div className="border-b p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Pagamento #{payment.id.slice(-8)}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Criado em {formatDate(payment.createdAt)}
              </p>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
                statusConfig.color,
              )}
            >
              <StatusIcon className={cn('size-4', statusConfig.iconClass)} />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Conteúdo baseado no status */}
        <div className="p-6">
          {/* PIX Pendente - Mostrar QR Code */}
          {payment.paymentMethod === 'PIX' && isPending && payment.pixData && (
            <div className="mb-6 space-y-4">
              <Alert variant="warning">
                <PiPixLogo className="size-4" />
                <AlertTitle>PIX aguardando pagamento</AlertTitle>
                <AlertDescription>
                  Escaneie o QR Code ou copie o código para pagar.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col items-center gap-4">
                <div className="rounded-lg border bg-white p-4">
                  <img
                    src={`data:image/png;base64,${payment.pixData.qrCodeImage}`}
                    alt="QR Code PIX"
                    className="size-48"
                  />
                </div>

                <div className="flex w-full items-center gap-2">
                  <input
                    type="text"
                    value={payment.pixData.copyPaste}
                    readOnly
                    className="flex-1 rounded-lg border bg-gray-50 px-3 py-2 text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopyPix}
                    className="shrink-0"
                  >
                    {copied ? (
                      <PiCheck className="size-4 text-green-600" />
                    ) : (
                      <PiCopy className="size-4" />
                    )}
                  </Button>
                </div>

                {payment.pixData.expiresAt && (
                  <p className="text-xs text-gray-500">
                    Expira em: {formatDate(payment.pixData.expiresAt)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cartão em análise */}
          {payment.paymentMethod === 'CREDIT_CARD' &&
            payment.status === 'AWAITING_RISK_ANALYSIS' && (
              <div className="mb-6">
                <Alert variant="info">
                  <PiCircleNotch className="size-4 animate-spin" />
                  <AlertTitle>Pagamento em análise</AlertTitle>
                  <AlertDescription>
                    Seu pagamento está sendo analisado pelo sistema antifraude.
                    Isso pode levar alguns minutos.
                  </AlertDescription>
                </Alert>
              </div>
            )}

          {/* Cartão processando */}
          {payment.paymentMethod === 'CREDIT_CARD' &&
            payment.status === 'PENDING' && (
              <div className="mb-6">
                <Alert variant="info">
                  <PiCircleNotch className="size-4 animate-spin" />
                  <AlertTitle>Processando pagamento</AlertTitle>
                  <AlertDescription>
                    Seu pagamento está sendo processado. Aguarde alguns
                    instantes.
                  </AlertDescription>
                </Alert>
              </div>
            )}

          {/* Pagamento confirmado */}
          {isPaid && (
            <div className="mb-6">
              <Alert variant="success">
                <PiCheck className="size-4" />
                <AlertTitle>Pagamento confirmado!</AlertTitle>
                <AlertDescription>
                  {payment.paidAt
                    ? `Pago em ${formatDate(payment.paidAt)}`
                    : 'Seu pagamento foi processado com sucesso.'}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Pagamento falhou */}
          {isFailed && (
            <div className="mb-6">
              <Alert variant="destructive">
                <PiX className="size-4" />
                <AlertTitle>
                  {payment.status === 'FAILED'
                    ? payment.paymentMethod === 'PIX'
                      ? 'PIX expirado'
                      : 'Pagamento recusado'
                    : payment.status === 'OVERDUE'
                      ? 'Pagamento vencido'
                      : 'Pagamento cancelado'}
                </AlertTitle>
                <AlertDescription>
                  {payment.status === 'FAILED' &&
                  payment.paymentMethod === 'PIX'
                    ? 'O QR Code PIX expirou. Tente novamente.'
                    : payment.status === 'FAILED'
                      ? 'O pagamento foi recusado pela operadora do cartão.'
                      : 'Este pagamento foi cancelado.'}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Detalhes do pagamento */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Detalhes</h2>

            <div className="grid gap-3">
              {/* Plano */}
              {payment.subscription && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Plano</span>
                  <span className="font-medium">
                    {getPlanName(payment.subscription.plan)}
                  </span>
                </div>
              )}

              {/* Período */}
              {payment.subscription?.billingInterval && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Período</span>
                  <span className="font-medium">
                    {getBillingIntervalName(
                      payment.subscription.billingInterval,
                    )}
                  </span>
                </div>
              )}

              {/* Valor */}
              <div className="flex justify-between">
                <span className="text-gray-500">Valor</span>
                <span className="text-lg font-medium">
                  {formatCurrency(payment.amount)}
                </span>
              </div>

              {/* Método de pagamento */}
              <div className="flex justify-between">
                <span className="text-gray-500">Método</span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  {payment.paymentMethod === 'PIX' ? (
                    <PiPixLogo className="size-4" />
                  ) : (
                    <PiCreditCard className="size-4" />
                  )}
                  {getPaymentMethodName(payment.paymentMethod)}
                  {payment.cardData?.lastDigits && (
                    <span className="text-gray-500">
                      **** {payment.cardData.lastDigits}
                    </span>
                  )}
                </span>
              </div>

              {/* Data de criação */}
              <div className="flex justify-between">
                <span className="text-gray-500">Criado em</span>
                <span className="font-medium">
                  {formatDate(payment.createdAt)}
                </span>
              </div>

              {/* Data de pagamento */}
              {payment.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Pago em</span>
                  <span className="font-medium">
                    {formatDate(payment.paidAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
