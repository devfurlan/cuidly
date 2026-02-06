'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PiCheck,
  PiCircleNotch,
  PiCrown,
  PiLock,
  PiShieldCheck,
  PiSparkle,
  PiStar,
} from 'react-icons/pi';

import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { CheckoutModal } from '@/components/subscription/checkout-modal';

interface PremiumUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: 'match' | 'recommendations' | 'contact' | 'general' | 'upgrade';
}

const featureMessages = {
  match: {
    title: 'Descubra sua Compatibilidade',
    description:
      'Veja o score de compatibilidade detalhado com cada babá e encontre a profissional perfeita para sua família.',
    icon: PiSparkle,
  },
  recommendations: {
    title: 'Babás Recomendadas para Você',
    description:
      'Acesse recomendações personalizadas de babás com maior compatibilidade para suas vagas.',
    icon: PiStar,
  },
  contact: {
    title: 'Entre em Contato Diretamente',
    description:
      'Converse diretamente com as babás e agilize o processo de contratação.',
    icon: PiShieldCheck,
  },
  general: {
    title: 'Recurso Exclusivo Plus',
    description:
      'Este recurso está disponível apenas para assinantes do plano Plus.',
    icon: PiCrown,
  },
  upgrade: {
    title: 'Assine o Cuidly Plus',
    description:
      'Aproveite todos os recursos premium e encontre a babá perfeita para sua família.',
    icon: PiCrown,
  },
};

const benefits = [
  'Score de compatibilidade detalhado',
  'Babás recomendadas para suas vagas',
  'Contato direto com candidatas',
  'Perfil em destaque para babás',
  'Suporte prioritário',
  'Sem limite de mensagens',
];

export function PremiumUpsellModal({
  isOpen,
  onClose,
  feature = 'general',
}: PremiumUpsellModalProps) {
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isCheckingPending, setIsCheckingPending] = useState(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-3rem)] overflow-hidden rounded-2xl border-0 p-0 sm:max-w-md">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-fuchsia-500 via-purple-500 to-purple-600 px-4 pb-6 pt-8 text-center sm:px-6 sm:pb-8 sm:pt-10">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-4 -top-4 size-24 rounded-full bg-white/10" />
            <div className="absolute -left-8 bottom-0 size-32 rounded-full bg-white/5" />
            <PiStar className="absolute right-8 top-12 size-4 text-yellow-300 opacity-80" />
            <PiStar className="absolute left-12 top-8 size-3 text-yellow-300 opacity-60" />
            <PiStar className="absolute bottom-12 right-16 size-3 text-yellow-300 opacity-70" />
          </div>

          {/* Icon */}
          <div className="relative mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:mb-4 sm:size-16">
            <PiLock className="size-7 text-white sm:size-8" />
          </div>

          {/* Badge */}
          <Badge variant="warning-solid" className="mb-2 sm:mb-3">
            <PiCrown className="size-3" />
            Plus
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
          {/* Benefits */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-gray-500">
              Com o plano Plus você tem:
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
                Assinar Plus
              </>
            )}
          </Button>

          {/* Trust badge */}
          <p className="mt-4 text-center text-xs text-gray-400">
            Cancele quando quiser. Sem compromisso.
          </p>
        </div>
      </DialogContent>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={handleCheckoutClose}
        onSuccess={handleCheckoutSuccess}
        plan="FAMILY_PLUS"
      />
    </Dialog>
  );
}
