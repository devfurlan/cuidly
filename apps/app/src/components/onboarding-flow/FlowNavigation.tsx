'use client';

import { Button } from '@/components/ui/shadcn/button';
import { PiArrowRight } from 'react-icons/pi';

interface FlowNavigationProps {
  onBack?: () => void;
  onNext: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  showBackButton?: boolean;
}

export function FlowNavigation({
  onNext,
  isLoading = false,
  disabled = false,
}: FlowNavigationProps) {
  return (
    <div>
      <Button
        type="button"
        onClick={onNext}
        disabled={isLoading || disabled}
        size="lg"
        className="w-full"
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
