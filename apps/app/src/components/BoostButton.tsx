'use client';

import { PiLightning } from 'react-icons/pi';

import { useState } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { useApiError } from '@/hooks/useApiError';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { cn } from '@cuidly/shared';
import { NannyProUpsellModal } from '@/components/subscription/nanny-pro-upsell-modal';

interface BoostButtonProps {
  type: 'NANNY_PROFILE' | 'JOB';
  targetId: string | number;
  hasActiveBoost?: boolean;
  canBoost?: boolean;
  daysRemaining?: number;
  onBoostActivated?: () => void;
  className?: string;
}

export function BoostButton({
  type,
  targetId,
  hasActiveBoost = false,
  canBoost = true,
  daysRemaining,
  onBoostActivated,
  className,
}: BoostButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { showSuccess, showError, showWarning } = useApiError();

  const handleActivateBoost = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetId: String(targetId) }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          // Verificar se é erro de plano (Pro required)
          const errorMessage = data.error || '';
          if (
            errorMessage.includes('Pro') ||
            errorMessage.includes('Plano') ||
            data.code === 'PREMIUM_REQUIRED' ||
            data.code === 'NO_SUBSCRIPTION'
          ) {
            setIsOpen(false);
            setShowUpgradeModal(true);
            return;
          }
          showWarning(errorMessage || 'Você não pode usar esta funcionalidade');
          return;
        }
        throw new Error(data.error || 'Erro ao ativar boost');
      }

      showSuccess(data.message || 'Boost ativado com sucesso!');
      setIsOpen(false);
      onBoostActivated?.();
    } catch (error) {
      console.error('Erro ao ativar boost:', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (hasActiveBoost) {
    return (
      <Button
        variant="secondary"
        disabled
        className={cn('gap-2', className)}
      >
        <PiLightning className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        Boost Ativo
      </Button>
    );
  }

  if (!canBoost && daysRemaining !== undefined) {
    return (
      <Button variant="outline" disabled className={cn('gap-2', className)}>
        <PiLightning className="w-4 h-4" />
        Aguarde {daysRemaining} dia(s)
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn('gap-2 bg-yellow-500 hover:bg-yellow-600 text-white', className)}
      >
        <PiLightning className="w-4 h-4" />
        Ativar Boost
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PiLightning className="w-5 h-5 text-yellow-500" />
              Ativar Boost
            </DialogTitle>
            <DialogDescription className="text-left">
              {type === 'NANNY_PROFILE' ? (
                <>
                  Seu perfil ficará no topo das buscas por <strong>24 horas</strong>.
                  <br />
                  <span className="text-muted-foreground">
                    Você pode usar 1 boost por semana.
                  </span>
                </>
              ) : (
                <>
                  Sua vaga ficará no topo da lista por <strong>7 dias</strong>.
                  <br />
                  <span className="text-muted-foreground">
                    Você pode usar 1 boost por mês.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleActivateBoost}
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isLoading ? 'Ativando...' : 'Ativar Boost'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de upgrade para plano Pro */}
      <NannyProUpsellModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="boost"
      />
    </>
  );
}
