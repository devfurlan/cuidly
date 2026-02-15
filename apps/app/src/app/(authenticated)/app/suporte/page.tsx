'use client';

import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { PiChatCircle, PiListBullets } from 'react-icons/pi';
import Link from 'next/link';
import { SupportFAQ } from './_components/SupportFAQ';

export default function SuportePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suporte</h1>
        <p className="mt-1 text-gray-500">
          Encontre respostas para suas dúvidas ou abra um chamado.
        </p>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
            Perguntas Frequentes
          </h2>
          <SupportFAQ />
        </CardContent>
      </Card>

      {/* Support Actions */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Não encontrou o que procurava?
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Abra um chamado e nossa equipe responderá o mais breve possível.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/app/suporte/novo">
                <PiChatCircle className="mr-2 size-4" />
                Abrir chamado
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/app/suporte/chamados">
                <PiListBullets className="mr-2 size-4" />
                Meus chamados
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
