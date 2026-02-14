'use client';

import { PiArrowLeft, PiCheck } from 'react-icons/pi';

import BlogSection from '@/components/home/BlogSection';
import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-fuchsia-50 px-6 text-center">
        <div className="mb-6">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full border-4 border-green-600">
            <PiCheck className="size-12 text-green-600" />
          </div>
        </div>
        <h1 className="font-mono text-3xl font-bold text-gray-900">
          Recebemos seu pedido de orçamento
        </h1>
        <p className="mt-4 max-w-xl text-lg/8 text-gray-600">
          Em instantes, um especialista da Cuidly entrará em contato pelo
          WhatsApp para entender melhor sua necessidade e, então, enviar um
          orçamento personalizado.
        </p>

        <div className="mt-10">
          <Button asChild>
            <Link href="/">
              <PiArrowLeft className="me-1 size-4!" />
              Voltar para a página inicial
            </Link>
          </Button>
        </div>
      </section>

      <BlogSection />
    </>
  );
}
