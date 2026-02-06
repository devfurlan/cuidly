'use client';

/**
 * Subscription Management Page
 * /app/assinatura/gerenciar
 *
 * Displays current subscription, payment history and cancellation option
 */

import { PLAN_LABELS, formatPriceWithPeriod, SubscriptionPlan as CoreSubscriptionPlan, BillingInterval } from '@cuidly/core';
import { PiArrowRight, PiArrowSquareOut, PiCalendar, PiCircleNotch, PiCrown, PiFileText, PiWarningCircle } from 'react-icons/pi';

import { CancellationModal } from '@/components/subscription/cancellation-modal';
import { PageTitle } from '@/components/PageTitle';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/shadcn/pagination';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type SubscriptionPlan =
  | 'FREE'
  | 'FAMILY_FREE'
  | 'FAMILY_PLUS'
  | 'FAMILY_MONTHLY'
  | 'FAMILY_QUARTERLY'
  | 'NANNY_FREE'
  | 'NANNY_PRO'
  | 'NANNY_PREMIUM_MONTHLY'
  | 'NANNY_PREMIUM_YEARLY';

type SubscriptionStatus =
  | 'ACTIVE'
  | 'CANCELED'
  | 'PAST_DUE'
  | 'TRIALING'
  | 'INCOMPLETE'
  | 'EXPIRED';

type PaymentStatus =
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

interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: string;
  description: string | null;
  paymentMethod: string | null;
  externalInvoiceUrl: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Legacy plan names mapping (for backwards compatibility with old data)
const LEGACY_PLAN_NAMES: Partial<Record<SubscriptionPlan, string>> = {
  FREE: 'Cuidly Free',
  FAMILY_MONTHLY: 'Cuidly Plus Mensal',
  FAMILY_QUARTERLY: 'Cuidly Plus Trimestral',
  NANNY_PREMIUM_MONTHLY: 'Plano Pro Mensal',
  NANNY_PREMIUM_YEARLY: 'Plano Pro Anual',
};

function getPlanName(plan: SubscriptionPlan): string {
  // Try core labels first
  if (plan in PLAN_LABELS) {
    return PLAN_LABELS[plan as CoreSubscriptionPlan];
  }
  // Fall back to legacy
  return LEGACY_PLAN_NAMES[plan] ?? plan;
}

/** Get plan price label from centralized pricing */
function getPlanPriceLabel(plan: SubscriptionPlan): string {
  // Try core pricing first
  if (plan in PLAN_LABELS) {
    const formatted = formatPriceWithPeriod(plan as CoreSubscriptionPlan, BillingInterval.MONTH);
    if (formatted) return formatted;
  }
  // Map legacy plan names to centralized pricing
  switch (plan) {
    case 'FAMILY_MONTHLY':
      return formatPriceWithPeriod('FAMILY_PLUS' as CoreSubscriptionPlan, BillingInterval.MONTH) ?? 'Grátis';
    case 'FAMILY_QUARTERLY':
      return formatPriceWithPeriod('FAMILY_PLUS' as CoreSubscriptionPlan, BillingInterval.QUARTER) ?? 'Grátis';
    case 'NANNY_PREMIUM_MONTHLY':
      return formatPriceWithPeriod('NANNY_PRO' as CoreSubscriptionPlan, BillingInterval.MONTH) ?? 'Grátis';
    case 'NANNY_PREMIUM_YEARLY':
      return formatPriceWithPeriod('NANNY_PRO' as CoreSubscriptionPlan, BillingInterval.YEAR) ?? 'Grátis';
    case 'FREE':
    default:
      return 'Grátis';
  }
}

const statusLabels: Record<SubscriptionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: 'Ativo', variant: 'default' },
  CANCELED: { label: 'Cancelado', variant: 'destructive' },
  PAST_DUE: { label: 'Vencido', variant: 'destructive' },
  TRIALING: { label: 'Período de Teste', variant: 'secondary' },
  INCOMPLETE: { label: 'Incompleto', variant: 'outline' },
  EXPIRED: { label: 'Expirado', variant: 'destructive' },
};

const paymentStatusLabels: Record<PaymentStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'text-amber-600 bg-amber-100' },
  PROCESSING: { label: 'Processando', color: 'text-blue-600 bg-blue-100' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600 bg-blue-100' },
  PAID: { label: 'Pago', color: 'text-green-600 bg-green-100' },
  FAILED: { label: 'Falhou', color: 'text-red-600 bg-red-100' },
  CANCELED: { label: 'Cancelado', color: 'text-gray-600 bg-gray-100' },
  REFUNDED: { label: 'Reembolsado', color: 'text-gray-600 bg-gray-100' },
  PARTIALLY_REFUNDED: { label: 'Reembolso Parcial', color: 'text-gray-600 bg-gray-100' },
  OVERDUE: { label: 'Vencido', color: 'text-red-600 bg-red-100' },
  CHARGEBACK: { label: 'Contestado', color: 'text-red-600 bg-red-100' },
  AWAITING_RISK_ANALYSIS: { label: 'Em Análise', color: 'text-amber-600 bg-amber-100' },
};

export default function SubscriptionManagePage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isReverting, setIsReverting] = useState(false);

  useEffect(() => {
    loadSubscription();
    loadPayments(1);
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast.error('Erro ao carregar dados da assinatura');
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const loadPayments = async (page: number) => {
    setIsLoadingPayments(true);
    try {
      const response = await fetch(`/api/payments/history?page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Erro ao carregar histórico de pagamentos');
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const handleRevertCancellation = async () => {
    setIsReverting(true);
    try {
      const response = await fetch('/api/subscription/revert-cancel', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Cancelamento revertido! Seu plano continua ativo.');
        loadSubscription();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao reverter cancelamento');
      }
    } catch {
      toast.error('Erro ao reverter cancelamento');
    } finally {
      setIsReverting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });
  };

  const currentPlan = subscription?.plan || 'FREE';
  const currentStatus = subscription?.status || 'ACTIVE';
  const statusInfo = statusLabels[currentStatus];
  const isPaidPlan = currentPlan === 'FAMILY_PLUS' || currentPlan === 'NANNY_PRO' ||
    currentPlan === 'FAMILY_MONTHLY' || currentPlan === 'FAMILY_QUARTERLY' ||
    currentPlan === 'NANNY_PREMIUM_MONTHLY' || currentPlan === 'NANNY_PREMIUM_YEARLY';
  const isFreePlan = !isPaidPlan;
  const userType = currentPlan.startsWith('FAMILY') || currentPlan === 'FREE' ? 'family' : 'nanny';

  return (
    <>
      <PageTitle title="Gerenciar Assinatura - Cuidly" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciar Assinatura
          </h1>
          <p className="mt-1 text-gray-600">
            Visualize e gerencie sua assinatura e histórico de pagamentos
          </p>
        </div>

        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-fuchsia-100 p-2">
                <PiCrown className="size-6 text-fuchsia-600" />
              </div>
              <div>
                <CardTitle>Seu Plano Atual</CardTitle>
                <CardDescription>
                  Detalhes da sua assinatura ativa
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSubscription ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-40" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {getPlanName(currentPlan)}
                    </h3>
                    <p className="text-lg text-gray-600">
                      {getPlanPriceLabel(currentPlan)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                    {subscription?.cancelAtPeriodEnd && (
                      <Badge variant="warning-outline">
                        Cancelamento Agendado
                      </Badge>
                    )}
                  </div>
                </div>

                {!isFreePlan && subscription && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <PiCalendar className="size-5" />
                      <span>
                        Próxima cobrança:{' '}
                        <strong>
                          {subscription.cancelAtPeriodEnd
                            ? 'Cancelado - Acesso até ' +
                              formatDate(subscription.currentPeriodEnd)
                            : formatDate(subscription.currentPeriodEnd)}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Link href="/app/assinatura">
                    <Button variant="outline">
                      {isFreePlan ? 'Fazer Upgrade' : 'Alterar Plano'}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <PiFileText className="size-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>
                  Seus pagamentos e recibos anteriores
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingPayments ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : payments.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => {
                      const paymentStatus = paymentStatusLabels[payment.status];
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(new Date(payment.createdAt), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell>
                            {payment.description || 'Pagamento de assinatura'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${paymentStatus.color}`}
                            >
                              {paymentStatus.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {payment.status === 'PAID' && payment.externalInvoiceUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                >
                                  <a
                                    href={payment.externalInvoiceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <PiArrowSquareOut className="size-4" />
                                    <span className="ml-1 hidden sm:inline">
                                      Recibo
                                    </span>
                                  </a>
                                </Button>
                              )}
                              <Link href={`/app/assinatura/pagamentos/${payment.id}`}>
                                <Button variant="ghost" size="sm">
                                  <PiArrowRight className="size-4" />
                                  <span className="ml-1 hidden sm:inline">
                                    Detalhes
                                  </span>
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {pagination.totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              pagination.page > 1 &&
                              loadPayments(pagination.page - 1)
                            }
                            className={
                              pagination.page === 1
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>

                        {Array.from(
                          { length: pagination.totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => loadPayments(page)}
                              isActive={pagination.page === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              pagination.page < pagination.totalPages &&
                              loadPayments(pagination.page + 1)
                            }
                            className={
                              pagination.page === pagination.totalPages
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <PiFileText className="mx-auto size-12 text-gray-300" />
                <p className="mt-2 text-gray-500">
                  Nenhum pagamento encontrado
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Seus pagamentos aparecerão aqui
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancellation scheduled message with revert option */}
        {subscription?.cancelAtPeriodEnd && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <PiWarningCircle className="size-6 shrink-0 text-amber-600" />
                  <p className="text-amber-800">
                    Sua assinatura está agendada para cancelamento. Você terá
                    acesso aos recursos do plano até{' '}
                    <strong>{formatDate(subscription.currentPeriodEnd)}</strong>.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevertCancellation}
                  disabled={isReverting}
                  className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  {isReverting ? (
                    <>
                      <PiCircleNotch className="size-4 animate-spin" />
                      Revertendo...
                    </>
                  ) : (
                    'Manter meu plano'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer with discrete cancel link */}
        {!isFreePlan && subscription && !subscription.cancelAtPeriodEnd && (
          <div className="border-t pt-6">
            <p className="text-center text-sm text-gray-500">
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="text-gray-400 hover:text-gray-600 hover:underline"
              >
                Cancelar assinatura
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {subscription && (
        <CancellationModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => loadSubscription()}
          userType={userType}
          currentPeriodEnd={new Date(subscription.currentPeriodEnd)}
        />
      )}
    </>
  );
}
