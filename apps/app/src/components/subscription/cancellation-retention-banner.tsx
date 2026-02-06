'use client';

/**
 * Cancellation Retention Banner Component
 *
 * Shows a fixed banner when user has scheduled a cancellation,
 * encouraging them to revert the cancellation.
 */

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { PiCircleNotch, PiWarningCircle, PiX } from 'react-icons/pi';

import { Button } from '@/components/ui/shadcn/button';
import { toast } from 'sonner';

interface SubscriptionData {
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
  plan: string;
}

const DISMISS_STORAGE_KEY = 'cancellation_banner_dismissed';
const DISMISS_DURATION_HOURS = 24;

export function CancellationRetentionBanner() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReverting, setIsReverting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was recently dismissed
    const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const hoursElapsed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursElapsed < DISMISS_DURATION_HOURS) {
        setIsDismissed(true);
        setIsLoading(false);
        return;
      } else {
        localStorage.removeItem(DISMISS_STORAGE_KEY);
      }
    }

    loadSubscription();
  }, []);

  // Listen for subscription updates from other components
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      loadSubscription();
    };

    window.addEventListener('subscription-updated', handleSubscriptionUpdate);
    return () => {
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate);
    };
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async () => {
    setIsReverting(true);

    try {
      const response = await fetch('/api/subscription/revert-cancel', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Cancelamento revertido! Seu plano continua ativo.');
        setSubscription((prev) =>
          prev ? { ...prev, cancelAtPeriodEnd: false } : null,
        );
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

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  // Don't render if loading, dismissed, or no cancellation scheduled
  if (isLoading || isDismissed || !subscription?.cancelAtPeriodEnd) {
    return null;
  }

  const formattedDate = format(
    new Date(subscription.currentPeriodEnd),
    "d 'de' MMMM",
    { locale: ptBR },
  );

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="flex items-center gap-x-2 text-sm font-medium text-white">
            <PiWarningCircle className="size-5 shrink-0" />
            <span>
              Seu plano será cancelado em {formattedDate}.
              <span className="hidden sm:inline">
                {' '}
                Você ainda pode manter seus benefícios!
              </span>
            </span>
          </p>
          <div className="flex items-center gap-x-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRevert}
              disabled={isReverting}
              className="bg-white text-amber-700 hover:bg-amber-50"
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
            <button
              type="button"
              onClick={handleDismiss}
              className="text-white/80 transition-colors hover:text-white"
              aria-label="Dispensar aviso"
            >
              <PiX className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
