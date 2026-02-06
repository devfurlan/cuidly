'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PiArrowRight } from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import { createClient } from '@/utils/supabase/client';

/**
 * Final CTA section at the bottom of the profile page
 * Shows different content based on authentication status
 */
export function FinalCtaSection() {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();
  }, [supabase]);

  return (
    <section className="bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center text-white">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Encontre a babá perfeita para cuidar de quem você tanto ama
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-fuchsia-100">
          Cadastre-se gratuitamente e tenha acesso a centenas de babás
          verificadas, avaliações de outras famílias e muito mais.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          {isAuthenticated ? (
            <Button
              size="lg"
              variant="secondary"
              className="text-base"
              onClick={() => router.push('/app/babas')}
            >
              Ver Mais Babás
              <PiArrowRight className="ml-2 size-5" />
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                variant="secondary"
                className="text-base"
                onClick={() => router.push('/cadastro')}
              >
                Criar Conta Grátis
                <PiArrowRight className="ml-2 size-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => router.push('/login')}
              >
                Já tenho conta
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
