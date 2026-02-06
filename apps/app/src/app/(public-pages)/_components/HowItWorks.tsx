import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';
import {
  PiChatCircleDotsDuotone,
  PiClipboardTextDuotone,
  PiHandshakeDuotone,
  PiSparkleDuotone,
} from 'react-icons/pi';

export default function HowItWorks() {
  const steps = [
    {
      icon: PiClipboardTextDuotone,
      title: 'Cadastre-se',
      description:
        'Crie sua conta gratuitamente e informe o que sua família precisa',
    },
    {
      icon: PiSparkleDuotone,
      title: 'Crie vaga',
      description:
        'Conte o que você precisa e deixe o matching inteligente fazer o trabalho',
    },
    {
      icon: PiChatCircleDotsDuotone,
      title: 'Converse',
      description:
        'Entre em contato direto com as babás para alinhar expectativas',
    },
    {
      icon: PiHandshakeDuotone,
      title: 'Contrate',
      description:
        'Escolha com tranquilidade a babá que melhor se encaixa na sua rotina',
    },
  ];

  return (
    <section id="como-funciona" className="bg-blue-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="mt-2 font-mono text-4xl font-bold tracking-tight text-pretty text-blue-600 sm:text-5xl lg:text-balance">
            Como Funciona?
          </h2>
          <p className="mt-6 text-lg/8 text-gray-700">
            Um processo simples para escolher com mais confiança e menos esforço
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="relative mb-4 inline-flex items-center justify-center">
                    <div className="absolute h-20 w-20 animate-pulse rounded-full bg-blue-100"></div>
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-blue-500">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-500 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-9 left-[62%] z-0 hidden h-0.5 w-full bg-gray-200 lg:block"></div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-16 text-center">
          <Button size={'xl'} asChild>
            <Link href="/cadastro">Começar Grátis</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
