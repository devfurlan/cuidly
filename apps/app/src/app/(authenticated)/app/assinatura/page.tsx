'use client';

import {
  PLAN_LABELS,
  SubscriptionPlan as CoreSubscriptionPlan,
  PLAN_PRICES,
} from '@cuidly/core';
import {
  PiArrowCounterClockwise,
  PiCalendar,
  PiCheckCircle,
  PiCircleNotch,
  PiCreditCard,
  PiCrown,
  PiReceipt,
  PiSparkle,
  PiWarningCircle,
  PiXCircle,
} from 'react-icons/pi';

import { PageTitle } from '@/components/PageTitle';
import { PremiumUpsellModal } from '@/components/PremiumUpsellModal';
import { CancellationModal } from '@/components/subscription/cancellation-modal';
import { CheckoutModal } from '@/components/subscription/checkout-modal';
import { NannyProUpsellModal } from '@/components/subscription/nanny-pro-upsell-modal';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  paymentMethod: string | null;
}

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  PROCESSING: { label: 'Processando', color: 'bg-blue-100 text-blue-700' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  PAID: { label: 'Pago', color: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Pago', color: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Falhou', color: 'bg-red-100 text-red-700' },
  CANCELED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-purple-100 text-purple-700' },
  PARTIALLY_REFUNDED: { label: 'Reembolso parcial', color: 'bg-purple-100 text-purple-700' },
  OVERDUE: { label: 'Vencido', color: 'bg-red-100 text-red-700' },
  CHARGEBACK: { label: 'Estornado', color: 'bg-red-100 text-red-700' },
  AWAITING_RISK_ANALYSIS: { label: 'Em análise', color: 'bg-yellow-100 text-yellow-700' },
};

type BillingInterval = 'MONTH' | 'QUARTER' | 'YEAR';

interface Subscription {
  id?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingInterval?: BillingInterval;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
  discountAmount?: number | null;
  payments: Payment[];
}

// Legacy plan names (for backwards compatibility with old plan names)
const LEGACY_PLAN_NAMES: Partial<Record<SubscriptionPlan, string>> = {
  FREE: 'Plano Gratuito',
  FAMILY_MONTHLY: 'Familiar Mensal',
  FAMILY_QUARTERLY: 'Familiar Trimestral',
  NANNY_PREMIUM_MONTHLY: 'Pro Mensal',
  NANNY_PREMIUM_YEARLY: 'Pro Anual',
};

function getPlanName(plan: SubscriptionPlan): string {
  if (plan in PLAN_LABELS) {
    return PLAN_LABELS[plan as CoreSubscriptionPlan];
  }
  return LEGACY_PLAN_NAMES[plan] ?? plan;
}

/** Get plan price from centralized pricing */
function getPlanPrice(plan: SubscriptionPlan, billingInterval?: BillingInterval): number {
  // Current plans with billing interval
  if (plan === 'FAMILY_PLUS' && billingInterval) {
    return PLAN_PRICES.FAMILY_PLUS[billingInterval]?.price ?? 0;
  }
  if (plan === 'NANNY_PRO' && billingInterval) {
    return PLAN_PRICES.NANNY_PRO[billingInterval]?.price ?? 0;
  }

  // Legacy plan names (backwards compatibility)
  switch (plan) {
    case 'FAMILY_MONTHLY':
      return PLAN_PRICES.FAMILY_PLUS.MONTH.price;
    case 'FAMILY_QUARTERLY':
      return PLAN_PRICES.FAMILY_PLUS.QUARTER.price;
    case 'NANNY_PREMIUM_MONTHLY':
      return PLAN_PRICES.NANNY_PRO.MONTH.price;
    case 'NANNY_PREMIUM_YEARLY':
      return PLAN_PRICES.NANNY_PRO.YEAR.price;
    case 'FREE':
    case 'FAMILY_FREE':
    case 'NANNY_FREE':
    default:
      return 0;
  }
}

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  {
    label: string;
    variant: 'success' | 'destructive' | 'warning' | 'info' | 'secondary';
    icon: React.ReactNode;
  }
> = {
  ACTIVE: {
    label: 'Ativa',
    variant: 'success',
    icon: <PiCheckCircle className="size-4" />,
  },
  CANCELED: {
    label: 'Cancelada',
    variant: 'destructive',
    icon: <PiXCircle className="size-4" />,
  },
  PAST_DUE: {
    label: 'Pagamento Pendente',
    variant: 'warning',
    icon: <PiWarningCircle className="size-4" />,
  },
  TRIALING: {
    label: 'Período de Teste',
    variant: 'info',
    icon: <PiSparkle className="size-4" />,
  },
  INCOMPLETE: {
    label: 'Incompleta',
    variant: 'secondary',
    icon: <PiWarningCircle className="size-4" />,
  },
  EXPIRED: {
    label: 'Expirada',
    variant: 'secondary',
    icon: <PiXCircle className="size-4" />,
  },
};

export default function SubscriptionManagementPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [userType, setUserType] = useState<'family' | 'nanny'>('family');
  const [showRevertPrompt, setShowRevertPrompt] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    loadSubscription();
  }, []);

  // Handle ?action= from email links
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'revert-cancel' && subscription?.cancelAtPeriodEnd) {
      setShowRevertPrompt(true);
    }
    // Handle ?action=update-payment from payment failed email
    if (action === 'update-payment' && subscription?.status === 'PAST_DUE') {
      setShowPaymentModal(true);
    }
  }, [searchParams, subscription]);

  const loadSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/me');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
        // Determine user type based on plan
        if (data.plan?.startsWith('NANNY')) {
          setUserType('nanny');
        } else {
          setUserType('family');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
      toast.error('Erro ao carregar dados da assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertCancellation = async () => {
    setIsReverting(true);
    try {
      const response = await fetch('/api/subscription/revert-cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao reverter cancelamento');
        return;
      }

      toast.success(data.message);
      loadSubscription();

      // Notify other components (like the retention banner) that subscription was updated
      window.dispatchEvent(new CustomEvent('subscription-updated'));
    } catch (error) {
      console.error('Erro ao reverter cancelamento:', error);
      toast.error('Erro ao reverter cancelamento');
    } finally {
      setIsReverting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });
  };

  if (isLoading) {
    return (
      <>
        <PageTitle title="Minha Assinatura - Cuidly" />
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </>
    );
  }

  // Check if it's a paid plan (any plan that's not FREE or ends with _FREE)
  const isPaidPlan = subscription &&
    subscription.plan !== 'FREE' &&
    !subscription.plan.endsWith('_FREE');
  const statusConfig = subscription
    ? STATUS_CONFIG[subscription.status]
    : STATUS_CONFIG.ACTIVE;

  return (
    <>
      <PageTitle title="Minha Assinatura - Cuidly" />

      <div className="space-y-6">
        {/* Card Principal - Plano Atual */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-12 items-center justify-center rounded-full ${
                    isPaidPlan ? 'bg-primary/10' : 'bg-gray-100'
                  }`}
                >
                  {isPaidPlan ? (
                    <PiCrown className="size-6 text-primary" />
                  ) : (
                    <PiSparkle className="size-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {subscription ? getPlanName(subscription.plan) : 'Carregando...'}
                  </CardTitle>
                  <CardDescription>
                    {isPaidPlan
                      ? `${formatPrice(getPlanPrice(subscription!.plan, subscription!.billingInterval))} por ${
                          subscription!.billingInterval === 'YEAR' ||
                          subscription!.plan.includes('YEARLY')
                            ? 'ano'
                            : subscription!.billingInterval === 'QUARTER' ||
                                subscription!.plan.includes('QUARTERLY')
                              ? 'trimestre'
                              : 'mês'
                        }`
                      : 'Sem cobrança'}
                  </CardDescription>
                </div>
              </div>

              {subscription && (
                <Badge variant={statusConfig.variant}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Aviso de cancelamento agendado */}
            {subscription?.cancelAtPeriodEnd && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <PiWarningCircle className="size-5 shrink-0 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        Cancelamento agendado
                      </p>
                      <p className="text-sm text-yellow-700">
                        Sua assinatura será cancelada em{' '}
                        {formatDate(subscription.currentPeriodEnd)}. Você terá acesso
                        até esta data.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRevertCancellation}
                    disabled={isReverting}
                    className="shrink-0 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    {isReverting ? (
                      <>
                        <PiCircleNotch className="size-4 animate-spin" />
                        Revertendo...
                      </>
                    ) : (
                      <>
                        <PiArrowCounterClockwise className="size-4" />
                        Manter meu plano
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Datas do período */}
            {isPaidPlan && subscription?.currentPeriodEnd && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                    <PiCalendar className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Próxima renovação</p>
                    <p className="font-medium">
                      {subscription.cancelAtPeriodEnd
                        ? 'Não haverá renovação'
                        : formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                    <PiCreditCard className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Próxima cobrança</p>
                    <p className="font-medium">
                      {subscription.cancelAtPeriodEnd
                        ? 'Cancelada'
                        : formatPrice(getPlanPrice(subscription.plan, subscription.billingInterval))}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-wrap gap-3 pt-2">
              {!isPaidPlan && (
                <Button onClick={() => setShowUpgradeModal(true)}>
                  <PiCrown className="size-4" />
                  Fazer Upgrade
                </Button>
              )}

              {isPaidPlan && subscription?.cancelAtPeriodEnd && (
                <Button
                  variant="outline"
                  onClick={handleRevertCancellation}
                  disabled={isReverting}
                >
                  {isReverting ? (
                    <>
                      <PiCircleNotch className="size-4 animate-spin" />
                      Revertendo...
                    </>
                  ) : (
                    <>
                      <PiArrowCounterClockwise className="size-4" />
                      Reativar Assinatura
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Pagamentos */}
        {isPaidPlan && subscription?.payments && subscription.payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PiReceipt className="size-5" />
                Histórico de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscription.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{formatPrice(payment.amount)}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <Badge
                      className={
                        PAYMENT_STATUS_LABELS[payment.status]?.color ?? 'bg-gray-100 text-gray-700'
                      }
                    >
                      {PAYMENT_STATUS_LABELS[payment.status]?.label ?? payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Link discreto de cancelamento (apenas para planos pagos ativos) */}
        {isPaidPlan && !subscription?.cancelAtPeriodEnd && (
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

      {/* Modal de cancelamento */}
      {subscription?.currentPeriodEnd && (
        <CancellationModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => loadSubscription()}
          userType={userType}
          currentPeriodEnd={new Date(subscription.currentPeriodEnd)}
        />
      )}

      {/* Modal de upgrade */}
      {userType === 'family' ? (
        <PremiumUpsellModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="upgrade"
        />
      ) : (
        <NannyProUpsellModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="upgrade"
        />
      )}

      {/* Modal de reversão de cancelamento (vindo do e-mail) */}
      <Dialog
        open={showRevertPrompt && !!subscription?.cancelAtPeriodEnd}
        onOpenChange={(open) => !open && setShowRevertPrompt(false)}
      >
        <DialogContent size="sm">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <PiArrowCounterClockwise className="size-8 text-primary" />
            </div>
            <DialogTitle className="text-xl">Manter sua assinatura?</DialogTitle>
            <DialogDescription className="text-base">
              Vimos que você solicitou o cancelamento do seu plano{' '}
              <strong>{subscription ? getPlanName(subscription.plan) : ''}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <PiWarningCircle className="size-5 shrink-0 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Seu acesso termina em {formatDate(subscription?.currentPeriodEnd ?? null)}
                  </p>
                  <p className="mt-1 text-sm text-yellow-700">
                    Após essa data, você perderá acesso aos recursos premium.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600">
              Clique abaixo para continuar aproveitando todos os benefícios do seu plano.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setShowRevertPrompt(false)}
              className="w-full sm:w-auto"
            >
              Não, pode cancelar
            </Button>
            <Button
              onClick={async () => {
                await handleRevertCancellation();
                setShowRevertPrompt(false);
              }}
              disabled={isReverting}
              className="w-full sm:w-auto"
            >
              {isReverting ? (
                <>
                  <PiCircleNotch className="size-4 animate-spin" />
                  Revertendo...
                </>
              ) : (
                <>
                  <PiCheckCircle className="size-4" />
                  Manter meu plano
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de pagamento (vindo do e-mail de pagamento falhou) */}
      {subscription && isPaidPlan && (
        <CheckoutModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            loadSubscription();
            window.dispatchEvent(new CustomEvent('subscription-updated'));
          }}
          plan={
            subscription.plan === 'FAMILY_PLUS' || subscription.plan.startsWith('FAMILY')
              ? 'FAMILY_PLUS'
              : 'NANNY_PRO'
          }
          defaultBillingInterval={subscription.billingInterval}
        />
      )}
    </>
  );
}
