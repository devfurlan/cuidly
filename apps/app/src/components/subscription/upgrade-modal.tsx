'use client';

/**
 * Upgrade Modal Component
 *
 * Confirmation modal for upgrading subscription plans.
 * Shows plan details, pricing, and billing information.
 */

import {
  PLAN_PRICES,
  formatPrice as formatPriceCore,
} from '@cuidly/core/subscriptions';
import {
  PiCalendar,
  PiCheckCircle,
  PiCrown,
  PiCurrencyDollar,
} from 'react-icons/pi';

import { Button } from '@/components/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { useState } from 'react';

type UserType = 'FAMILY' | 'NANNY';

type SubscriptionPlan =
  | 'FREE'
  | 'FAMILY_MONTHLY'
  | 'FAMILY_QUARTERLY'
  | 'NANNY_PREMIUM_MONTHLY'
  | 'NANNY_PREMIUM_YEARLY';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  userType: UserType;
}

interface PlanDetails {
  name: string;
  period: string;
  nextBillingDays: number;
  topFeatures: string[];
}

/** Obtém o preço do plano a partir da fonte centralizada */
function getPlanPrice(plan: SubscriptionPlan): number {
  switch (plan) {
    case 'FAMILY_MONTHLY':
      return PLAN_PRICES.FAMILY_PLUS.MONTH.price;
    case 'FAMILY_QUARTERLY':
      return PLAN_PRICES.FAMILY_PLUS.QUARTER.price;
    case 'NANNY_PREMIUM_MONTHLY':
      return PLAN_PRICES.NANNY_PRO.MONTH.price;
    case 'NANNY_PREMIUM_YEARLY':
      return PLAN_PRICES.NANNY_PRO.YEAR.price;
    default:
      return 0;
  }
}

const planDetails: Record<SubscriptionPlan, PlanDetails> = {
  FREE: {
    name: 'Plano Básico',
    period: 'mês',
    nextBillingDays: 0,
    topFeatures: [],
  },
  FAMILY_MONTHLY: {
    name: 'Plano Familiar Mensal',
    period: 'mês',
    nextBillingDays: 30,
    topFeatures: [
      'Perfis ilimitados',
      'Ver todas avaliações',
      'Criar até 3 vagas ativas',
      'Enviar mensagens',
      'Matching inteligente',
      'Favoritar babás',
    ],
  },
  FAMILY_QUARTERLY: {
    name: 'Plano Familiar Trimestral',
    period: 'trimestre',
    nextBillingDays: 90,
    topFeatures: ['Tudo do Plano Mensal', 'Destaque nas vagas'],
  },
  NANNY_PREMIUM_MONTHLY: {
    name: 'Plano Pro Mensal',
    period: 'mês',
    nextBillingDays: 30,
    topFeatures: [
      'Mensagens ilimitadas após candidatura',
      'Selo Verificada / Confiável',
      'Validação Completa (facial + antecedentes)',
      'Perfil em destaque',
      'Matching prioritário',
    ],
  },
  NANNY_PREMIUM_YEARLY: {
    name: 'Plano Pro Anual',
    period: 'ano',
    nextBillingDays: 365,
    topFeatures: ['Tudo do Plano Pro Mensal', '2 meses grátis'],
  },
};

export function UpgradeModal({ isOpen, onClose, plan }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const details = planDetails[plan];
  const price = getPlanPrice(plan);

  const getNextBillingDate = () => {
    const nextDate = addDays(new Date(), details.nextBillingDays);
    return format(nextDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement checkout redirect
      // This will redirect to Stripe checkout or payment page
      console.log('Redirecting to checkout for plan:', plan);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to checkout page
      window.location.href = `/app/checkout?plan=${plan}`;
    } catch (error) {
      console.error('Error during checkout:', error);
      setIsLoading(false);
    }
  };

  if (plan === 'FREE') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <PiCrown className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Confirmar Upgrade</DialogTitle>
          <DialogDescription className="text-center">
            Revise os detalhes do plano antes de confirmar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Summary */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{details.name}</h3>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPriceCore(price)}
                </span>
                <span className="text-sm text-gray-500">/{details.period}</span>
              </div>
            </div>

            {/* Top Features */}
            <div className="mt-4 space-y-2">
              {details.topFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <PiCheckCircle className="size-4 shrink-0 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                <PiCurrencyDollar className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Cobrança de hoje
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {formatPriceCore(price)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-100">
                <PiCalendar className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Próxima cobrança
                </p>
                <p className="text-sm text-gray-600">{getNextBillingDate()}</p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-gray-500">
            Ao confirmar, você concorda com os{' '}
            <Link href="/termos/termos-de-uso" className="text-primary hover:underline">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link href="/termos/politica-de-privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            . Você pode cancelar a qualquer momento.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Processando...' : 'Confirmar e Pagar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
