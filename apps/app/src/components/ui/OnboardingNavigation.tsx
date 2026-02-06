'use client';

import { PiArrowLeft, PiArrowRight } from 'react-icons/pi';

import { Button } from '@/components/ui/shadcn/button';

interface OnboardingNavigationProps {
  onBack?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  backLabel?: string;
  continueLabel?: string;
  loadingLabel?: string;
  showBackButton?: boolean;
  submitType?: 'submit' | 'button';
  onContinue?: () => void;
  onSkip?: () => void;
  skipLabel?: string;
}

export function OnboardingNavigation({
  onBack,
  isLoading = false,
  disabled = false,
  backLabel = 'Voltar',
  continueLabel = 'Continuar',
  loadingLabel = 'Salvando...',
  showBackButton = true,
  submitType = 'submit',
  onContinue,
  onSkip,
  skipLabel = 'Pular esta etapa',
}: OnboardingNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      {showBackButton && onBack ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isLoading}
        >
          <PiArrowLeft className="mr-1 size-4" />
          {backLabel}
        </Button>
      ) : (
        <div />
      )}
      <div className="flex items-center gap-2">
        {onSkip && (
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            disabled={isLoading}
          >
            {skipLabel}
          </Button>
        )}
        <Button
          type={submitType}
          disabled={isLoading || disabled}
          onClick={submitType === 'button' ? onContinue : undefined}
        >
          {isLoading ? loadingLabel : continueLabel}
          <PiArrowRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}
