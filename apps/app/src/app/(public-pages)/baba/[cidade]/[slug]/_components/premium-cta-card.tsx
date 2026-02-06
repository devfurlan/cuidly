'use client';

import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PiCheckCircle, PiCrown } from 'react-icons/pi';

/**
 * Premium CTA card shown only to non-authenticated users
 */
export function PremiumCtaCard() {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();
  }, [supabase]);

  // Don't render while checking auth or if authenticated
  if (isAuthenticated === null || isAuthenticated) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 text-center">
        <PiCrown className="mx-auto size-8 text-white" />
        <h3 className="mt-2 font-bold text-white">Cuidly Plus</h3>
      </div>
      <div className="p-6">
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <PiCheckCircle className="size-5 text-green-500" />
            Ver todas avaliações
          </li>
          <li className="flex items-center gap-2">
            <PiCheckCircle className="size-5 text-green-500" />
            Match personalizado
          </li>
          <li className="flex items-center gap-2">
            <PiCheckCircle className="size-5 text-green-500" />
            Contato ilimitado
          </li>
          <li className="flex items-center gap-2">
            <PiCheckCircle className="size-5 text-green-500" />
            Criar vagas
          </li>
        </ul>
        <Button
          className="mt-6 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
          onClick={() => router.push('/cadastro')}
        >
          Cadastrar Grátis
        </Button>
      </div>
    </Card>
  );
}
