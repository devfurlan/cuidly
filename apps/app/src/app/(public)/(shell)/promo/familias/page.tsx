import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/shadcn/accordion';
import { Button } from '@/components/ui/shadcn/button';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PiArrowRight,
  PiCalendarCheckDuotone,
  PiChatCircleDuotone,
  PiCheckCircle,
  PiGiftDuotone,
  PiHeartDuotone,
  PiMagnifyingGlassDuotone,
  PiShieldCheckDuotone,
  PiStarDuotone,
} from 'react-icons/pi';

const COUPON_CODE = 'VIP30';
const CHECKOUT_URL = `/app/assinatura/checkout?plan=FAMILY_PLUS&interval=QUARTER&coupon=${COUPON_CODE}`;

export const metadata: Metadata = {
  title: 'Encontre a Babá Ideal - 1 Mês Grátis | Cuidly',
  description:
    'Aproveite 1 mês grátis do Cuidly Plus. Chat ilimitado, matching inteligente e até 3 vagas ativas para encontrar a babá perfeita para sua família.',
};

const benefits = [
  {
    icon: PiChatCircleDuotone,
    title: 'Chat ilimitado',
    description:
      'Converse com quantas babás precisar. Sem limites de mensagens ou conversas.',
  },
  {
    icon: PiMagnifyingGlassDuotone,
    title: 'Matching inteligente',
    description:
      'Nosso algoritmo sugere babás compatíveis com o perfil da sua família automaticamente.',
  },
  {
    icon: PiCalendarCheckDuotone,
    title: 'Até 3 vagas ativas',
    description:
      'Crie mais vagas para diferentes necessidades. Cada vaga fica ativa por 30 dias.',
  },
  {
    icon: PiStarDuotone,
    title: 'Avaliações completas',
    description:
      'Veja todas as avaliações de cada babá para tomar a melhor decisão.',
  },
  {
    icon: PiShieldCheckDuotone,
    title: 'Babás verificadas',
    description:
      'Veja os selos de verificação de identidade e antecedentes criminais.',
  },
  {
    icon: PiHeartDuotone,
    title: 'Favoritar babás',
    description: 'Salve perfis que você gostou e volte a eles quando precisar.',
  },
];

const faqs = [
  {
    question: 'Preciso colocar meu cartão de crédito?',
    answer:
      'Sim, para ativar o período grátis. Você pode cancelar a qualquer momento durante os 30 dias e não será cobrado.',
  },
  {
    question: 'O que acontece depois dos 30 dias?',
    answer:
      'Após o período grátis, seu plano será renovado automaticamente. Se preferir não continuar, basta cancelar antes do fim do período.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim! Não tem fidelidade nem multa. Cancele quando quiser pelo painel da sua conta.',
  },
];

export default function PromoFamiliesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32">
        <svg
          aria-hidden="true"
          className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-gray-200/60"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="promo-familias-grid"
              width={150}
              height={150}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 150V.5H150" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-blue-50">
            <path
              d="M-150 0h151v151h-151Z M450 0h151v151h-151Z M-300 450h151v151h-151Z M150 600h151v151h-151Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            fill="url(#promo-familias-grid)"
            width="100%"
            height="100%"
            strokeWidth={0}
          />
        </svg>
        <div
          aria-hidden="true"
          className="absolute top-10 left-[calc(50%-4rem)] -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:top-[calc(50%-30rem)] lg:left-48 xl:left-[calc(50%-24rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
            className="aspect-1108/632 w-277 bg-linear-to-r from-fuchsia-400 to-blue-400 opacity-25"
          />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-fuchsia-100/80 px-4 py-2 text-sm font-semibold text-fuchsia-700">
            <PiGiftDuotone className="size-5" />
            Oferta de lançamento
          </div>
          <h1 className="font-mono text-5xl font-bold tracking-tight text-balance text-gray-900 sm:text-7xl">
            Encontre a babá <span className="text-fuchsia-500">ideal</span>
          </h1>
          <p className="mt-4 font-mono text-2xl font-bold text-fuchsia-600 sm:text-3xl">
            1 mês grátis de Plus
          </p>
          <p className="mt-6 text-lg text-pretty text-gray-500 sm:text-xl/8">
            Chat ilimitado, matching inteligente e até 3 vagas ativas.
            Experimente todos os recursos do Cuidly Plus sem compromisso.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href={CHECKOUT_URL}>Começar 1 mês grátis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/cadastro">Criar conta grátis</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Cancele quando quiser. Sem compromisso.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-fuchsia-600 sm:text-4xl">
              Tudo que você precisa para encontrar a babá perfeita
            </h2>
            <p className="mt-4 text-lg/8 text-gray-600">
              O Cuidly Plus desbloqueia todos os recursos para facilitar sua
              busca
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl gap-x-8 gap-y-16 sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title}>
                <div className="flex size-12 items-center justify-center rounded-lg bg-linear-to-br from-fuchsia-400 to-fuchsia-500">
                  <benefit.icon className="size-6 text-white" />
                </div>
                <h3 className="mt-4 text-base/7 font-semibold text-gray-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-base/7 text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-fuchsia-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              Compare os planos
            </h2>
            <p className="mt-4 text-lg/8 text-gray-600">
              Veja o que muda com o Cuidly Plus
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-bold text-gray-500">Cuidly Free</h3>
              <ul className="mt-6 space-y-3">
                <ComparisonItem included>Ver perfis de babás</ComparisonItem>
                <ComparisonItem included>1 vaga ativa (7 dias)</ComparisonItem>
                <ComparisonItem included>1 conversa</ComparisonItem>
                <ComparisonItem included>1 avaliação por babá</ComparisonItem>
                <ComparisonItem>Matching inteligente</ComparisonItem>
                <ComparisonItem>Chat ilimitado</ComparisonItem>
                <ComparisonItem>Até 3 vagas (30 dias)</ComparisonItem>
                <ComparisonItem>Avaliações completas</ComparisonItem>
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-fuchsia-500 bg-white p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-fuchsia-600">
                  Cuidly Plus
                </h3>
                <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-fuchsia-700">
                  1 mês grátis
                </span>
              </div>
              <ul className="mt-6 space-y-3">
                <ComparisonItem included>Ver perfis de babás</ComparisonItem>
                <ComparisonItem included highlight>
                  Até 3 vagas ativas (30 dias)
                </ComparisonItem>
                <ComparisonItem included highlight>
                  Chat ilimitado
                </ComparisonItem>
                <ComparisonItem included highlight>
                  Avaliações completas
                </ComparisonItem>
                <ComparisonItem included highlight>
                  Matching inteligente
                </ComparisonItem>
                <ComparisonItem included>
                  Notificações de candidaturas
                </ComparisonItem>
                <ComparisonItem included>Favoritar babás</ComparisonItem>
                <ComparisonItem included>Selos de verificação</ComparisonItem>
              </ul>
              <Button className="mt-8 w-full" asChild>
                <Link href={CHECKOUT_URL}>Começar 1 mês grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              Como funciona
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Crie sua conta',
                description:
                  'Cadastro rápido e gratuito. Leva menos de 2 minutos.',
              },
              {
                step: '2',
                title: 'Ative seu mês grátis',
                description:
                  'Use o cupom de lançamento no checkout para ativar 30 dias grátis de Plus.',
              },
              {
                step: '3',
                title: 'Encontre sua babá',
                description:
                  'Use o matching inteligente, crie vagas e converse sem limites.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-blue-500">
                  <span className="text-xl font-bold text-white">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              Perguntas frequentes
            </h2>
            <Accordion
              type="single"
              collapsible
              defaultValue="item-0"
              className="mt-12"
            >
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-base text-gray-600">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-linear-to-br from-fuchsia-500 via-fuchsia-600 to-blue-500 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
              Oferta por tempo limitado
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-200">
              1 mês grátis de Cuidly Plus. Aproveite antes que acabe.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="xl" variant="secondary" asChild>
                <Link href={CHECKOUT_URL}>
                  Começar 1 mês grátis
                  <PiArrowRight />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-200/75">
              Cancele quando quiser. Sem compromisso.
            </p>
            <svg
              viewBox="0 0 1024 1024"
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -z-10 size-256 -translate-x-1/2 mask-[radial-gradient(closest-side,white,transparent)]"
            >
              <circle
                r={512}
                cx={512}
                cy={512}
                fill="url(#promo-familias-gradient)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="promo-familias-gradient">
                  <stop stopColor="#E935C1" />
                  <stop offset={1} stopColor="#7775D6" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>
    </>
  );
}

function ComparisonItem({
  children,
  included = false,
  highlight = false,
}: {
  children: React.ReactNode;
  included?: boolean;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {included ? (
        <PiCheckCircle
          className={`size-5 shrink-0 ${highlight ? 'text-fuchsia-600' : 'text-green-500'}`}
        />
      ) : (
        <span className="flex size-5 shrink-0 items-center justify-center text-gray-300">
          -
        </span>
      )}
      <span
        className={highlight ? 'font-medium text-gray-900' : 'text-gray-600'}
      >
        {children}
      </span>
    </li>
  );
}
