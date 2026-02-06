'use client';

import { Button } from '@/components/ui/shadcn/button';
import { PiArrowLeft, PiArrowRight } from 'react-icons/pi';

interface FlowNavigationProps {
  onBack: () => void;
  onNext: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  showBackButton?: boolean;
}

export function FlowNavigation({
  onBack,
  onNext,
  isLoading = false,
  disabled = false,
  showBackButton = true,
}: FlowNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {showBackButton ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isLoading}
          size="lg"
        >
          <PiArrowLeft className="mr-2 size-4" />
        </Button>
      ) : (
        <div />
      )}
      <Button
        type="button"
        onClick={onNext}
        disabled={isLoading || disabled}
        size="lg"
        className="min-w-[140px] flex-1"
      >
        {isLoading ? (
          'Salvando...'
        ) : (
          <>
            Continuar
            <PiArrowRight className="ml-2 size-4" />
          </>
        )}
      </Button>
    </div>
  );
}
