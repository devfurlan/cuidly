'use client';

import { PiCheckCircle } from 'react-icons/pi';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/shadcn/button';
import { Suspense } from 'react';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get('plan');

  const planNames: Record<string, string> = {
    FAMILY_MONTHLY: 'Família Mensal',
    FAMILY_QUARTERLY: 'Família Trimestral',
    NANNY_BASIC: 'Babá Básico',
    NANNY_PREMIUM_MONTHLY: 'Babá Pro Mensal',
    NANNY_PREMIUM_YEARLY: 'Babá Pro Anual',
  };

  const planDisplayName = plan ? planNames[plan] || plan : 'selecionado';

  return (
    <div className="py-20 text-center">
      <PiCheckCircle
        className="mx-auto mb-6 size-20 text-green-500"
      />
      <h1 className="mb-4 text-3xl font-bold">Assinatura Confirmada!</h1>
      <p className="mb-8 text-gray-600">
        Sua assinatura do plano <strong>{planDisplayName}</strong> foi
        confirmada com sucesso.
      </p>
      <Button onClick={() => router.push('/app/dashboard')}>
        Ir para o Dashboard
      </Button>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="mx-auto mb-6 size-20 animate-pulse rounded-full bg-gray-200" />
          <div className="mx-auto mb-4 h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto mb-8 h-4 w-96 animate-pulse rounded bg-gray-200" />
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
