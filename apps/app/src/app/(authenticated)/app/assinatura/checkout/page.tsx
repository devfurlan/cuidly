'use client';

import { PageTitle } from '@/components/PageTitle';
import {
  CheckoutForm,
  CheckoutBillingInterval,
  CheckoutPlan,
  PLAN_NAMES,
} from '@/components/subscription/checkout-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PiSpinner } from 'react-icons/pi';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parâmetros da URL:
  // ?plan=FAMILY_PLUS ou ?plan=NANNY_PRO
  // ?interval=MONTH ou ?interval=QUARTER ou ?interval=YEAR
  // ?coupon=CODIGO
  const planParam = searchParams.get('plan') as CheckoutPlan | null;
  const intervalParam = searchParams.get('interval') as CheckoutBillingInterval | null;
  const couponParam = searchParams.get('coupon');

  // Validar e definir valores padrão
  const plan: CheckoutPlan = planParam && ['FAMILY_PLUS', 'NANNY_PRO'].includes(planParam)
    ? planParam
    : 'FAMILY_PLUS';

  const defaultInterval: CheckoutBillingInterval =
    intervalParam && ['MONTH', 'QUARTER', 'YEAR'].includes(intervalParam)
      ? intervalParam
      : plan === 'FAMILY_PLUS'
        ? 'QUARTER'
        : 'YEAR';

  const handleSuccess = () => {
    router.push('/app/assinatura');
    router.refresh();
  };

  return (
    <>
      <PageTitle title={`Assinar ${PLAN_NAMES[plan]} - Cuidly`} />

      <CheckoutForm
        plan={plan}
        defaultBillingInterval={defaultInterval}
        defaultCouponCode={couponParam || undefined}
        onSuccess={handleSuccess}
      />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <PiSpinner className="size-8 animate-spin text-fuchsia-500" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
