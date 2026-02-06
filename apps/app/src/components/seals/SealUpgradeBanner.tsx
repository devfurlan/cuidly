'use client';

import { useState, useEffect } from 'react';
import {
  PiArrowRight,
  PiCrown,
  PiShieldCheck,
  PiX,
} from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import { NannyProUpsellModal } from '@/components/subscription/nanny-pro-upsell-modal';

interface SealUpgradeBannerProps {
  /** Whether the nanny has Selo Identificada */
  hasIdentificada: boolean;
  /** Whether the nanny already has Pro subscription */
  hasPro: boolean;
  /** Whether the nanny has completed Selo Verificada requirements (except Pro) */
  hasVerificadaRequirements?: boolean;
}

const BANNER_DISMISSED_KEY = 'seal-upgrade-banner-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * A bottom banner that appears when nanny completes Selo Identificada
 * encouraging them to upgrade for Selo Verificada
 */
export function SealUpgradeBanner({
  hasIdentificada,
  hasPro,
  hasVerificadaRequirements = false,
}: SealUpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed recently
    const dismissedAt = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION_MS) {
        setIsDismissed(true);
        return;
      }
    }
    setIsDismissed(false);
  }, []);

  // Don't show if already has Pro or doesn't have Identificada
  if (hasPro || !hasIdentificada || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-fuchsia-50 px-4 py-3 shadow-lg sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 sm:flex">
              <PiShieldCheck className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                Parabens pelo Selo Identificada!
              </p>
              <p className="truncate text-xs text-gray-600 sm:text-sm">
                {hasVerificadaRequirements
                  ? 'Ative o Pro e ganhe o Selo Verificada agora!'
                  : 'Quer se destacar ainda mais? Conhea o Selo Verificada.'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowUpsellModal(true)}
              className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:from-fuchsia-600 hover:to-purple-700"
            >
              <PiCrown className="mr-1 size-4" />
              <span className="hidden sm:inline">Ver plano Pro</span>
              <span className="sm:hidden">Pro</span>
              <PiArrowRight className="ml-1 size-3" />
            </Button>

            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              aria-label="Fechar"
            >
              <PiX className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <NannyProUpsellModal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        feature="validation"
      />
    </>
  );
}
