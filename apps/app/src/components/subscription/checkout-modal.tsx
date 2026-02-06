'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { useRouter } from 'next/navigation';
import {
  CheckoutForm,
  CheckoutPlan,
  CheckoutBillingInterval,
  PLAN_NAMES,
} from './checkout-form';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  plan?: CheckoutPlan;
  defaultBillingInterval?: CheckoutBillingInterval;
  defaultCouponCode?: string;
}

export function CheckoutModal({
  isOpen,
  onClose,
  onSuccess,
  plan = 'FAMILY_PLUS',
  defaultBillingInterval,
  defaultCouponCode,
}: CheckoutModalProps) {
  const router = useRouter();

  // Default billing interval baseado no plano
  const effectiveBillingInterval = defaultBillingInterval ?? (plan === 'NANNY_PRO' ? 'YEAR' : 'QUARTER');

  const handleSuccess = () => {
    onClose();
    onSuccess?.();
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-[85vh] max-h-[700px] w-[calc(100%-2rem)] max-w-3xl flex-col overflow-hidden rounded-xl border-0 p-0">
        <DialogTitle className="sr-only">
          Checkout - Assinar {PLAN_NAMES[plan]}
        </DialogTitle>
        <CheckoutForm
          plan={plan}
          defaultBillingInterval={effectiveBillingInterval}
          defaultCouponCode={defaultCouponCode}
          onSuccess={handleSuccess}
          className="min-h-0 flex-1"
        />
      </DialogContent>
    </Dialog>
  );
}

// Re-export types for convenience
export type { CheckoutPlan, CheckoutBillingInterval };
export { PLAN_NAMES };
