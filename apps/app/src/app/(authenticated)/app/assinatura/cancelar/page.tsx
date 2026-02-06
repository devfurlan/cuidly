'use client';

import { PiXCircle } from 'react-icons/pi';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/shadcn/button';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="py-20 text-center">
      <PiXCircle className="mx-auto mb-6 size-20 text-red-500" />
      <h1 className="mb-4 text-3xl font-bold">Checkout Cancelado</h1>
      <p className="mb-8 text-gray-600">
        Você cancelou o processo de assinatura. Nenhuma cobrança foi realizada.
      </p>
      <div className="space-x-4">
        <Button
          variant="outline"
          onClick={() => router.push('/app/assinatura')}
        >
          Ver Planos
        </Button>
        <Button onClick={() => router.push('/app')}>
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
}
