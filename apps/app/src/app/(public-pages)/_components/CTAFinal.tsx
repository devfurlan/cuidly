import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';
import { PiArrowRight } from 'react-icons/pi';

export default function CTAFinal() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-linear-to-br from-fuchsia-500 via-fuchsia-600 to-blue-500 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            Pronto para escolher com mais confiança?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-200">
            Economize tempo na busca pela babá ideal com perfis verificados,
            avaliações reais e sugestões inteligentes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size={'xl'} variant={'secondary'} asChild>
              <Link href="/cadastro">
                Começar Agora
                <PiArrowRight />
              </Link>
            </Button>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 size-256 -translate-x-1/2 mask-[radial-gradient(closest-side,white,transparent)]"
          >
            <circle
              r={512}
              cx={512}
              cy={512}
              fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
              fillOpacity="0.7"
            />
            <defs>
              <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                <stop stopColor="#E935C1" />
                <stop offset={1} stopColor="#7775D6" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}
