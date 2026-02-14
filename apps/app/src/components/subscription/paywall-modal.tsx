'use client';

/**
 * Paywall Modal Component
 *
 * Shows when user tries to access a blocked feature
 * Different content based on whether user is logged in or not
 * If logged in + eligible for trigger trial, shows trial offer
 */

import {
  PiChatCircle,
  PiCheckCircle,
  PiCrown,
  PiGift,
  PiHeart,
  PiLock,
  PiMagnifyingGlass,
  PiStar,
  PiUserPlus,
} from 'react-icons/pi';
import { PLAN_PRICES } from '@cuidly/core/subscriptions';

import { Button } from '@/components/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { useTrialEligibility } from '@/hooks/useTrialEligibility';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  feature?: 'contact' | 'reviews' | 'references' | 'price' | 'details';
  nannyName?: string;
}

const FEATURE_TITLES: Record<string, string> = {
  contact: 'Enviar Mensagem',
  reviews: 'Ver todas avaliações',
  references: 'Ver Referências',
  price: 'Ver Valores',
  details: 'Ver Detalhes Completos',
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  contact: 'para conversar com babás',
  reviews: 'para ver todas as avaliações',
  references: 'para ver as referências verificadas',
  price: 'para ver os valores cobrados',
  details: 'para ver informações detalhadas',
};

export function PaywallModal({
  isOpen,
  onClose,
  isLoggedIn,
  feature = 'contact',
  nannyName,
}: PaywallModalProps) {
  const featureTitle = FEATURE_TITLES[feature] || 'Acessar Recurso';
  const featureDesc = FEATURE_DESCRIPTIONS[feature] || 'para acessar este recurso';
  const router = useRouter();
  const { eligible, trialDays, isLoading, activateTrial, isActivating } = useTrialEligibility();

  const handleActivateTrial = async () => {
    const result = await activateTrial();
    if (result.success) {
      toast.success(result.message || 'Período de teste ativado!');
      onClose();
      router.refresh();
    } else {
      toast.error(result.message || 'Erro ao ativar período de teste');
    }
  };

  if (!isLoggedIn) {
    // User is not logged in - show signup CTA
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-fuchsia-100">
              <PiUserPlus className="size-8 text-fuchsia-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              Cadastre-se Grátis
            </DialogTitle>
            <DialogDescription className="text-center">
              Crie sua conta {featureDesc}
              {nannyName && ` com ${nannyName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Benefits */}
            <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50/50 p-4">
              <h3 className="mb-3 font-semibold text-gray-900">
                Com uma conta grátis você pode:
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <PiCheckCircle className="size-5 shrink-0 text-green-600" />
                  <span className="text-sm text-gray-700">
                    Ver perfis completos de babás
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <PiCheckCircle className="size-5 shrink-0 text-green-600" />
                  <span className="text-sm text-gray-700">
                    Ver bio completa e experiência
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <PiCheckCircle className="size-5 shrink-0 text-green-600" />
                  <span className="text-sm text-gray-700">
                    Buscar e filtrar babás
                  </span>
                </div>
              </div>
            </div>

            {/* Plus Teaser */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <PiCrown className="size-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">
                  Cuidly Plus a partir de R$ {PLAN_PRICES.FAMILY_PLUS.MONTH.price}/mês
                </h3>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <PiChatCircle className="size-4 text-fuchsia-600" />
                  Enviar mensagens
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <PiMagnifyingGlass className="size-4 text-blue-600" />
                  Pontuação de match personalizada
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <PiStar className="size-4 text-yellow-500" />
                  Criar vagas de emprego
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2">
              <Button className="w-full" size="lg" asChild>
                <Link href="/cadastro">
                  <PiUserPlus className="mr-2 size-5" />
                  Cadastrar Grátis
                </Link>
              </Button>
              <Button variant="outline" className="w-full" size="lg" asChild>
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // User is logged in + eligible for trigger trial
  if (eligible && !isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400 to-purple-500">
              <PiGift className="size-8 text-white" />
            </div>
            <DialogTitle className="text-center text-xl">
              Experimente o Plus Grátis!
            </DialogTitle>
            <DialogDescription className="text-center">
              {trialDays} dias com todos os recursos, sem compromisso
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Trial Benefits */}
            <div className="rounded-xl border-2 border-fuchsia-200 bg-fuchsia-50/30 p-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <PiCheckCircle className="size-5 shrink-0 text-fuchsia-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Chat ilimitado com babás
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <PiCheckCircle className="size-5 shrink-0 text-fuchsia-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Pontuação de match personalizada
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <PiCheckCircle className="size-5 shrink-0 text-fuchsia-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Ver todas as avaliações
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <PiCheckCircle className="size-5 shrink-0 text-fuchsia-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Criar até 3 vagas
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2">
              <Button
                className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700"
                size="lg"
                onClick={handleActivateTrial}
                disabled={isActivating}
              >
                <PiGift className="mr-2 size-5" />
                {isActivating ? 'Ativando...' : `Ativar ${trialDays} dias grátis`}
              </Button>
              <Button variant="ghost" className="w-full" size="sm" asChild>
                <Link href="/app/assinatura">
                  Ou assine agora
                </Link>
              </Button>
            </div>

            {/* Trust */}
            <p className="text-center text-xs text-gray-500">
              Sem cartão de crédito. Sem compromisso. Cancela automaticamente.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // User is logged in but doesn't have paid plan (and no trial available)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-400">
            <PiLock className="size-8 text-white" />
          </div>
          <DialogTitle className="text-center text-xl">
            {featureTitle}
          </DialogTitle>
          <DialogDescription className="text-center">
            Assine um plano {featureDesc}
            {nannyName && ` com ${nannyName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Benefits */}
          <div className="rounded-xl border-2 border-fuchsia-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Plano Mensal</h3>
              <div className="text-right">
                <span className="text-sm text-gray-400 line-through mr-1">R$ {PLAN_PRICES.FAMILY_PLUS.MONTH.original}</span>
                <span className="text-2xl font-bold text-fuchsia-600">R$ {PLAN_PRICES.FAMILY_PLUS.MONTH.price}</span>
                <span className="text-sm text-gray-500">/mês</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-fuchsia-100">
                  <PiChatCircle className="size-4 text-fuchsia-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Enviar mensagens
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                  <PiStar className="size-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Ver todas avaliações
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-purple-100">
                  <PiMagnifyingGlass className="size-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Match personalizado
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-green-100">
                  <PiHeart className="size-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Criar vagas
                </span>
              </div>
            </div>
          </div>

          {/* Quarterly Plan Teaser */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-900">
                  Plano Trimestral
                </span>
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  21% de desconto
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 line-through mr-1">R$ {PLAN_PRICES.FAMILY_PLUS.QUARTER.original}</span>
                <span className="font-bold text-gray-900">R$ {PLAN_PRICES.FAMILY_PLUS.QUARTER.price}</span>
                <span className="text-xs text-gray-500">/trimestre</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700"
              size="lg"
              asChild
            >
              <Link href="/app/assinatura">
                <PiCrown className="mr-2 size-5" />
                Ver Planos e Assinar
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" onClick={onClose}>
              Talvez depois
            </Button>
          </div>

          {/* Trust */}
          <p className="text-center text-xs text-gray-500">
            Cancele a qualquer momento. Sem compromisso.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
