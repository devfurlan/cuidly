import { Button } from '@/components/ui/shadcn/button';
import { PLAN_PRICES } from '@cuidly/core/subscriptions';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  PiBriefcaseDuotone,
  PiChatCircleDotsDuotone,
  PiCheck,
  PiClipboardTextDuotone,
  PiHandshakeDuotone,
  PiMagnifyingGlassDuotone,
  PiShieldCheckDuotone,
  PiSparkleDuotone,
  PiStarDuotone,
  PiStarFill,
} from 'react-icons/pi';
import FAQ from '../../_components/FAQ';

const familyFaqs = [
  {
    question: 'O que é a Cuidly?',
    answer:
      'A Cuidly é uma plataforma online onde babás se cadastram e famílias buscam por elas. Você pode ver perfis, avaliações e selos de verificação, além de conversar diretamente pelo chat.',
  },
  {
    question: 'Preciso pagar para usar?',
    answer:
      'O cadastro é gratuito. Com o plano Cuidly Free, você pode buscar babás, criar 1 vaga e iniciar 1 conversa. Para recursos extras como matching inteligente, chat ilimitado e mais vagas, existe o Cuidly Plus.',
  },
  {
    question: 'Como funciona a busca de babás?',
    answer:
      'Você pode buscar babás usando filtros como localização, experiência, disponibilidade, especialidades e faixa de valor. O sistema de matching inteligente (disponível no plano Plus) mostra as babás mais adequadas ao seu perfil.',
  },
  {
    question: 'As babás são verificadas?',
    answer:
      'Sim. Todas as babás passam por validação de documento (RG/CNH) e e-mail (Selo Identificada). Babás com plano Pro têm validação completa, incluindo validação facial e verificação de antecedentes (Selo Verificada). Perfis com Selo Confiável são Verificadas com 3+ avaliações positivas.',
  },
  {
    question: 'Como funciona o chat com as babás?',
    answer:
      'O contato é feito pelo chat dentro da Cuidly. Não há intermediários. Você pode tirar dúvidas, agendar entrevistas e negociar valores diretamente com a profissional.',
  },
  {
    question: 'Posso publicar vagas?',
    answer:
      'Sim. No plano grátis, você pode criar 1 vaga ativa (expira em 7 dias). Com o plano Plus, você pode criar até 3 vagas simultâneas (30 dias cada). As babás interessadas se candidatam e você recebe as candidaturas no seu dashboard.',
  },
  {
    question: 'Como funciona o pagamento da babá?',
    answer:
      'O pagamento é combinado diretamente entre você e a babá. A Cuidly não processa pagamentos nem intermedia valores. Você combina forma de pagamento, valor e frequência diretamente com a profissional.',
  },
  {
    question: 'A Cuidly faz contratos ou agendamentos?',
    answer:
      'Não. Contratos, agendamentos e acordos são feitos diretamente entre você e a babá. A Cuidly é a plataforma onde você encontra a profissional ideal.',
  },
];

export const metadata: Metadata = {
  title: 'Contratar Babá Verificada para sua Família | Cuidly',
  description:
    'Encontre babás verificadas na Cuidly. Crie vagas, receba candidaturas e use o matching inteligente para encontrar a profissional ideal para suas crianças.',
};

export default function ForFamiliesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-white px-6 pt-14 lg:px-8">
        <svg
          aria-hidden="true"
          className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-gray-200/60"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="familias-hero-pattern"
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
            fill="url(#familias-hero-pattern)"
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
            className="aspect-1108/632 w-277 bg-linear-to-r from-primary to-secondary opacity-25"
          />
        </div>
        <div className="mx-auto max-w-2xl py-20">
          <div className="text-center">
            <h1 className="font-mono text-5xl font-bold tracking-tight text-balance text-blue-700 sm:text-7xl">
              Encontre a babá ideal para sua{' '}
              <span className="text-fuchsia-500">família</span>
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
              Busque babás verificadas, crie vagas e receba candidaturas. Comece
              grátis!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size={'xl'} asChild>
                <Link href="/cadastro">Cadastrar Grátis</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Comece Grátis · Crie Vagas · Babás Verificadas
            </p>
          </div>
        </div>
      </section>

      {/* Benefícios Gratuitos */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-4xl font-bold tracking-tight text-pretty text-fuchsia-600 sm:text-5xl">
              Comece agora sem pagar nada
            </h2>
            <p className="mt-4 text-lg/8 text-gray-600">
              Busque babás verificadas e publique sua primeira vaga.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl gap-x-8 gap-y-16 sm:mt-20 md:grid-cols-2 lg:mt-24 lg:max-w-none lg:grid-cols-4">
            {[
              {
                icon: PiMagnifyingGlassDuotone,
                title: 'Busca de Babás',
                description:
                  'Veja perfis completos de babás com selos de verificação.',
              },
              {
                icon: PiBriefcaseDuotone,
                title: 'Publicar Vaga',
                description:
                  'Crie uma vaga e receba candidaturas de babás interessadas.',
              },
              {
                icon: PiShieldCheckDuotone,
                title: 'Babás Verificadas',
                description:
                  'Saiba quem passou por validação de identidade e antecedentes.',
              },
              {
                icon: PiStarDuotone,
                title: 'Avaliações',
                description:
                  'Avalie babás e ajude outras famílias a escolherem melhor.',
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="flex size-12 items-center justify-center rounded-lg bg-linear-to-br from-fuchsia-400 to-fuchsia-500">
                  <item.icon className="size-6 text-white" />
                </div>
                <h3 className="mt-4 text-base/7 font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-base/7 text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparativo Free vs Plus */}
      <section className="bg-blue-50 px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-mono text-4xl font-bold tracking-tight text-balance text-blue-600 sm:text-5xl">
            Escolha o plano ideal para sua família
          </h2>
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg/8 text-pretty text-gray-600">
          Comece gratuitamente ou desbloqueie o matching inteligente com o
          Cuidly Plus.
        </p>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
          {/* Card Free */}
          <div className="rounded-3xl rounded-b-none bg-white p-8 ring-1 ring-gray-900/10 sm:mx-8 sm:rounded-b-none sm:p-10 lg:mx-0 lg:rounded-tr-none lg:rounded-bl-3xl">
            <h3 className="text-base/7 font-semibold text-fuchsia-600">
              Cuidly Free
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span className="text-5xl font-semibold tracking-tight text-gray-900">
                R$ 0
              </span>
              <span className="text-base text-gray-500">/mês</span>
            </p>
            <p className="mt-6 text-base/7 text-gray-600">
              Busque babás e publique sua primeira vaga.
            </p>
            <ul
              role="list"
              className="mt-8 space-y-3 text-sm/6 text-gray-600 sm:mt-10"
            >
              {[
                'Ver perfis completos de babás',
                'Criar 1 vaga ativa',
                'Iniciar 1 conversa',
                'Ver selos de verificação',
                'Favoritar babás',
              ].map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <PiCheck
                    aria-hidden="true"
                    className="h-6 w-4 text-fuchsia-600"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-8 w-full sm:mt-10" asChild>
              <Link href="/cadastro">Cadastrar Grátis</Link>
            </Button>
          </div>

          {/* Card Plus */}
          <div className="relative rounded-3xl bg-linear-to-br from-blue-950 via-blue-950 to-fuchsia-900 p-8 shadow-2xl sm:p-10">
            <h3 className="text-base/7 font-semibold text-white/80">
              Cuidly Plus
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span className="text-5xl font-semibold tracking-tight text-white">
                R${' '}
                {(PLAN_PRICES.FAMILY_PLUS.QUARTER.price / 3)
                  .toFixed(2)
                  .replace('.', ',')}
              </span>
              <span className="text-base text-white/70">/mês</span>
            </p>
            <p className="mt-1 text-sm text-white/60">
              Total: R$ {PLAN_PRICES.FAMILY_PLUS.QUARTER.price}/trimestre
            </p>
            <p className="mt-6 text-base/7 text-white/80">
              Matching inteligente, chat ilimitado e mais vagas.
            </p>
            <ul
              role="list"
              className="mt-8 space-y-3 text-sm/6 text-white sm:mt-10"
            >
              {[
                'Tudo do Cuidly Free',
                'Até 3 vagas ativas',
                'Conversas ilimitadas',
                'Avaliações completas',
                'Matching inteligente',
                'Notificações de candidaturas',
              ].map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <PiCheck
                    aria-hidden="true"
                    className="h-6 w-4 text-fuchsia-400"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant="blue-secondary"
              size="lg"
              className="mt-8 w-full sm:mt-10"
              asChild
            >
              <Link href="/cadastro">Começar agora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Como Começar */}
      <section className="bg-white-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="mt-2 font-mono text-4xl font-bold tracking-tight text-pretty text-blue-600 sm:text-5xl lg:text-balance">
              Como começar
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: PiClipboardTextDuotone,
                title: 'Cadastre-se',
                description: 'Crie sua conta gratuitamente em poucos minutos.',
              },
              {
                icon: PiSparkleDuotone,
                title: 'Crie uma vaga',
                description: 'Descreva o que você precisa e publique sua vaga.',
              },
              {
                icon: PiChatCircleDotsDuotone,
                title: 'Receba candidaturas',
                description:
                  'Babás verificadas se candidatam e você conversa pelo chat.',
              },
              {
                icon: PiHandshakeDuotone,
                title: 'Contrate',
                description:
                  'Escolha com confiança a babá ideal para sua família.',
              },
            ].map((step, index) => {
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
                  {index < 3 && (
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

      {/* FAQ */}
      <FAQ items={familyFaqs} subtitle="Tire suas dúvidas sobre a Cuidly" />

      {/* Depoimentos */}
      <section className="hidden bg-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-4xl font-bold tracking-tight text-pretty text-fuchsia-600 sm:text-5xl">
              O que as famílias dizem
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl gap-8 lg:max-w-none lg:grid-cols-3">
            {[
              {
                quote:
                  'Em menos de uma semana encontrei a babá perfeita! O matching inteligente acertou em cheio.',
                author: 'Mariana S.',
                role: 'Família Plus',
              },
              {
                quote:
                  'Os selos de verificação me deram muita segurança. Sei que posso confiar nas babás da plataforma.',
                author: 'Renata C.',
                role: 'Família Plus',
              },
              {
                quote:
                  'Criei uma vaga e recebi 5 candidaturas no mesmo dia. Muito prático e rápido!',
                author: 'Patrícia A.',
                role: 'Família Free',
              },
            ].map((item) => (
              <div
                key={item.author}
                className="rounded-2xl border border-gray-200 bg-white p-8"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <PiStarFill key={i} className="size-5 text-yellow-400" />
                  ))}
                </div>
                <p className="mt-4 text-base/7 text-gray-600">
                  &quot;{item.quote}&quot;
                </p>
                <p className="mt-4 font-semibold text-gray-900">
                  - {item.author},{' '}
                  <span className="font-normal text-gray-500">{item.role}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-linear-to-br from-fuchsia-500 via-fuchsia-600 to-blue-500 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="font-mono text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl">
              Hora de dar o próximo passo.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-white/80">
              Cadastre-se grátis e comece a receber candidaturas hoje.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="xl" variant="secondary" asChild>
                <Link href="/cadastro">Cadastrar Agora</Link>
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
                fill="url(#familias-cta-gradient)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="familias-cta-gradient">
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>
    </>
  );
}
