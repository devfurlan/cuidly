'use client';

import {
  BillingInterval,
  formatPrice,
  getDiscountPercentage,
  getMonthlyEquivalentPrice,
  getPlanPrice,
  SubscriptionPlan,
} from '@cuidly/core';
import { cn } from '@cuidly/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  PiChatCircle,
  PiCheck,
  PiCircleNotch,
  PiCrown,
  PiLock,
  PiShieldCheck,
  PiSparkle,
  PiStar,
} from 'react-icons/pi';

import { CheckoutModal } from '@/components/subscription/checkout-modal';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';

interface NannyProUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: 'validation' | 'messages' | 'highlight' | 'general' | 'upgrade';
}

const featureMessages = {
  validation: {
    title: 'Validação Pro',
    description:
      'Faça a validação facial e verificação de segurança para conquistar o selo Verificada.',
    icon: PiShieldCheck,
  },
  messages: {
    title: 'Mensagens Ilimitadas',
    description:
      'Converse livremente com as famílias após se candidatar às vagas.',
    icon: PiChatCircle,
  },
  highlight: {
    title: 'Perfil em Destaque',
    description: 'Seu perfil aparece primeiro nas buscas das famílias.',
    icon: PiSparkle,
  },
  general: {
    title: 'Recurso Exclusivo Pro',
    description:
      'Este recurso está disponível apenas para assinantes do plano Pro.',
    icon: PiCrown,
  },
  upgrade: {
    title: 'Assine o Cuidly Pro',
    description:
      'Destaque seu perfil e aumente suas chances de ser contratada.',
    icon: PiCrown,
  },
};

const benefits = [
  'Mensagens liberadas após candidatura',
  'Selo "Verificada" no perfil',
  'Perfil em destaque nas buscas',
  'Matching prioritário',
];

export function NannyProUpsellModal({
  isOpen,
  onClose,
  feature = 'general',
}: NannyProUpsellModalProps) {
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isCheckingPending, setIsCheckingPending] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'MONTH' | 'YEAR'>(
    'YEAR',
  );
  const featureInfo = featureMessages[feature];

  const handleSubscribe = async () => {
    setIsCheckingPending(true);

    try {
      // Verificar se há pagamento pendente
      const response = await fetch('/api/payments/pending');
      const data = await response.json();

      if (data.hasPending && data.paymentId) {
        // Redirecionar para página de detalhes do pagamento pendente
        onClose();
        router.push(`/app/assinatura/pagamentos/${data.paymentId}`);
      } else {
        // Abrir checkout normalmente
        setShowCheckout(true);
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento pendente:', error);
      // Em caso de erro, abrir checkout normalmente
      setShowCheckout(true);
    } finally {
      setIsCheckingPending(false);
    }
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    onClose();
  };

  // Preços do @cuidly/core
  const monthlyPrice =
    getPlanPrice(SubscriptionPlan.NANNY_PRO, BillingInterval.MONTH) ?? 0;
  const yearlyPrice =
    getPlanPrice(SubscriptionPlan.NANNY_PRO, BillingInterval.YEAR) ?? 0;
  const yearlyDiscount =
    getDiscountPercentage(SubscriptionPlan.NANNY_PRO, BillingInterval.YEAR) ??
    0;
  const yearlyMonthlyEquivalent =
    getMonthlyEquivalentPrice(
      SubscriptionPlan.NANNY_PRO,
      BillingInterval.YEAR,
    ) ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-3rem)] overflow-hidden rounded-2xl border-0 p-0 sm:max-w-md">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-fuchsia-500 via-purple-500 to-purple-600 px-4 pt-8 pb-6 text-center sm:px-6 sm:pt-10 sm:pb-8">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 size-24 rounded-full bg-white/10" />
            <div className="absolute bottom-0 -left-8 size-32 rounded-full bg-white/5" />
            <PiStar className="absolute top-12 right-8 size-4 text-yellow-300 opacity-80" />
            <PiStar className="absolute top-8 left-12 size-3 text-yellow-300 opacity-60" />
            <PiStar className="absolute right-16 bottom-12 size-3 text-yellow-300 opacity-70" />
          </div>

          {/* Icon */}
          <div className="relative mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:mb-4 sm:size-16">
            <PiLock className="size-7 text-white sm:size-8" />
          </div>

          {/* Badge */}
          <Badge variant="warning-solid" className="mb-2 sm:mb-3">
            <PiCrown className="size-3" />
            Pro
          </Badge>

          <DialogTitle className="mb-2 text-xl font-bold text-white sm:text-2xl">
            {featureInfo.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-purple-100 sm:text-base">
            {featureInfo.description}
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="bg-white p-4 sm:p-6">
          {/* Pricing Toggle */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedInterval('YEAR')}
              className={cn(
                'relative rounded-lg border-2 p-3 text-left transition-all',
                selectedInterval === 'YEAR'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              {yearlyDiscount > 0 && (
                <span className="absolute -top-2 left-3 rounded-full bg-green-500 px-2 py-0.5 text-2xs font-medium text-white">
                  Economize {yearlyDiscount}%
                </span>
              )}
              <div className="text-xs font-medium text-gray-500">Anual</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(yearlyMonthlyEquivalent)}
                </span>
                <span className="text-xs text-gray-500">/mês</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Total: {formatPrice(yearlyPrice)}/ano
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedInterval('MONTH')}
              className={cn(
                'rounded-lg border-2 p-3 text-left transition-all',
                selectedInterval === 'MONTH'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <div className="text-xs font-medium text-gray-500">Mensal</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(monthlyPrice)}
                </span>
                <span className="text-xs text-gray-500">/mês</span>
              </div>
            </button>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-gray-500">
              Com o plano Pro você tem:
            </p>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <PiCheck className="size-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <Button
            onClick={handleSubscribe}
            disabled={isCheckingPending}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:from-fuchsia-600 hover:to-purple-700"
            size="lg"
          >
            {isCheckingPending ? (
              <>
                <PiCircleNotch className="size-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <PiCrown className="size-4" />
                Assinar Pro
              </>
            )}
          </Button>

          {/* Dismiss */}
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-600"
          >
            Talvez depois
          </button>

          {/* Trust badge */}
          <p className="mt-3 text-center text-xs text-gray-400">
            Cancele quando quiser. Sem compromisso.
          </p>
        </div>
      </DialogContent>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={handleCheckoutClose}
        onSuccess={handleCheckoutSuccess}
        plan="NANNY_PRO"
        defaultBillingInterval={selectedInterval}
      />
    </Dialog>
  );
}
