import { Button } from '@/components/ui/shadcn/button';
import { PLAN_PRICES } from '@cuidly/core/subscriptions';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  PiBriefcaseDuotone,
  PiCheck,
  PiClipboardTextDuotone,
  PiHandshakeDuotone,
  PiShieldCheckDuotone,
  PiStarDuotone,
  PiStarFill,
  PiUserCircleDuotone,
} from 'react-icons/pi';
import FAQ from '../../_components/FAQ';

const nannyFaqs = [
  {
    question: 'O que é a Cuidly?',
    answer:
      'A Cuidly é uma plataforma online onde babás se cadastram e famílias buscam por elas. Você cria seu perfil profissional, se candidata a vagas e conversa diretamente com as famílias pelo chat.',
  },
  {
    question: 'Preciso pagar para me cadastrar?',
    answer:
      'Não. O cadastro é gratuito. Com o plano Básico, você pode criar seu perfil, ver vagas e se candidatar.',
  },
  {
    question: 'O que são os selos de verificação?',
    answer: (
      <>
        São indicadores de confiança no seu perfil. O Selo Identificada exige
        perfil completo, documento e e-mail verificado. O Selo Verificada inclui
        validação facial e verificação de antecedentes. O Selo Confiável é para
        Verificadas com 3+ avaliações positivas.{' '}
        <Link
          href="/seguranca"
          className="text-fuchsia-600 underline hover:text-fuchsia-800"
        >
          Saiba mais sobre nossos selos
        </Link>
        .
      </>
    ),
  },
  {
    question: 'Como me candidato a vagas?',
    answer:
      'Após criar seu perfil, você pode ver as vagas disponíveis e se candidatar diretamente. Junto com a candidatura, você pode enviar uma mensagem de apresentação para a família.',
  },
  {
    question: 'Como funciona o chat?',
    answer:
      'Quando uma família aceita sua candidatura, vocês podem conversar pelo chat da plataforma.',
  },
  {
    question: 'Quem define o valor do meu trabalho?',
    answer:
      'Você define sua faixa de valor por hora no perfil. O pagamento é combinado diretamente entre você e a família. A Cuidly não processa pagamentos nem intermedia valores.',
  },
  {
    question: 'A Cuidly faz contratos ou intermediações?',
    answer:
      'Não. Contratos, agendamentos e acordos são feitos diretamente entre você e a família. A Cuidly é a plataforma onde você encontra oportunidades de trabalho.',
  },
];

export const metadata: Metadata = {
  title: 'Trabalhe como Babá - Cadastre-se e Encontre Vagas | Cuidly',
  description:
    'Cadastre-se grátis na Cuidly e encontre vagas de babá. Crie seu perfil profissional, destaque-se com selos de verificação e aumente suas chances de contratação.',
};

export default function ForNanniesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative isolate bg-white px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#E935C1] to-[#7775D6] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>
        <div className="mx-auto max-w-2xl py-20">
          <div className="text-center">
            <h1 className="font-mono text-5xl font-bold tracking-tight text-balance text-blue-700 sm:text-7xl">
              Impulsione sua carreira como{' '}
              <span className="text-fuchsia-500">babá</span>
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
              Crie seu perfil, receba o Selo de Verificação e acesse vagas
              publicadas por famílias. Comece grátis!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size={'xl'} asChild>
                <Link href="/cadastro">Cadastrar Grátis</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Comece Grátis · Selo de Verificação Incluído · Acesso a Vagas
            </p>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#E935C1] to-[#7775D6] opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
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
              Crie seu perfil e comece a receber oportunidades.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl gap-x-8 gap-y-16 sm:mt-20 md:grid-cols-2 lg:mt-24 lg:max-w-none lg:grid-cols-4">
            {[
              {
                icon: PiUserCircleDuotone,
                title: 'Perfil Profissional',
                description:
                  'Apresente sua experiência, disponibilidade e diferenciais.',
              },
              {
                icon: PiShieldCheckDuotone,
                title: 'Selo de Verificação',
                description:
                  'Validação de identidade para aumentar sua credibilidade.',
              },
              {
                icon: PiBriefcaseDuotone,
                title: 'Acesso a Vagas',
                description:
                  'Veja oportunidades publicadas por famílias e candidate-se.',
              },
              {
                icon: PiStarDuotone,
                title: 'Avaliações Reais',
                description:
                  'Construa sua reputação com feedback das famílias.',
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

      {/* Comparativo Free vs Pro */}
      <section className="bg-blue-50 px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-mono text-4xl font-bold tracking-tight text-balance text-blue-600 sm:text-5xl">
            Escolha seu nível de visibilidade
          </h2>
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg/8 text-pretty text-gray-600">
          Comece gratuitamente ou aumente suas oportunidades com o Cuidly Pro.
        </p>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
          {/* Card Básico */}
          <div className="rounded-3xl rounded-b-none bg-white p-8 ring-1 ring-gray-900/10 sm:mx-8 sm:rounded-b-none sm:p-10 lg:mx-0 lg:rounded-tr-none lg:rounded-bl-3xl">
            <h3 className="text-base/7 font-semibold text-fuchsia-600">
              Cuidly Básico
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span className="text-5xl font-semibold tracking-tight text-gray-900">
                R$ 0
              </span>
              <span className="text-base text-gray-500">/mês</span>
            </p>
            <p className="mt-6 text-base/7 text-gray-600">
              Crie seu perfil e comece a se candidatar a vagas.
            </p>
            <ul
              role="list"
              className="mt-8 space-y-3 text-sm/6 text-gray-600 sm:mt-10"
            >
              {[
                'Perfil profissional completo',
                'Selo Identificada',
                'Acesso a vagas',
                'Candidatura a vagas',
                'Avaliações de famílias',
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

          {/* Card Pro */}
          <div className="relative rounded-3xl bg-linear-to-br from-blue-950 via-blue-950 to-fuchsia-900 p-8 shadow-2xl sm:p-10">
            <h3 className="text-base/7 font-semibold text-white/80">
              Cuidly Pro
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span className="text-5xl font-semibold tracking-tight text-white">
                R${' '}
                {(PLAN_PRICES.NANNY_PRO.YEAR.price / 12)
                  .toFixed(2)
                  .replace('.', ',')}
              </span>
              <span className="text-base text-white/70">/mês</span>
            </p>
            <p className="mt-1 text-sm text-white/60">
              Total: R$ {PLAN_PRICES.NANNY_PRO.YEAR.price}/ano
            </p>
            <p className="mt-6 text-base/7 text-white/80">
              Mais destaque, mais mensagens e mais oportunidades.
            </p>
            <ul role="list" className="mt-8 space-y-3 text-sm/6 text-white">
              {[
                'Tudo do Cuidly Básico',
                'Destaque nas buscas',
                'Perfil em evidência',
                'Mensagens ilimitadas',
                'Prioridade nas candidaturas',
                'Validação completa',
                'Matching prioritário',
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
                description: 'Crie seu perfil gratuitamente em poucos minutos.',
              },
              {
                icon: PiShieldCheckDuotone,
                title: 'Seja verificada',
                description:
                  'Complete seu perfil e conquiste seu selo de verificação.',
              },
              {
                icon: PiBriefcaseDuotone,
                title: 'Candidate-se',
                description:
                  'Veja vagas e envie propostas para famílias compatíveis.',
              },
              {
                icon: PiHandshakeDuotone,
                title: 'Seja contratada',
                description: 'Converse pelo chat e comece a trabalhar.',
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
      <FAQ items={nannyFaqs} subtitle="Tire suas dúvidas sobre a Cuidly" />

      {/* Depoimentos */}
      <section className="hidden bg-fuchsia-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-4xl font-bold tracking-tight text-pretty text-fuchsia-600 sm:text-5xl">
              Histórias de sucesso
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl gap-8 lg:max-w-none lg:grid-cols-3">
            {[
              {
                quote:
                  'Consegui 3 entrevistas na primeira semana! O Selo de Verificação fez toda a diferença.',
                author: 'Carla M.',
                role: 'Babá Pro',
              },
              {
                quote:
                  'O plano Pro valeu cada centavo. Minha agenda está sempre cheia desde que assinei.',
                author: 'Juliana O.',
                role: 'Babá Pro',
              },
              {
                quote:
                  'Finalmente uma plataforma que valoriza as babás! Recomendo para todas as colegas.',
                author: 'Fernanda L.',
                role: 'Babá Verificada',
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
              Cadastre-se grátis e comece a receber oportunidades hoje.
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
                fill="url(#babas-cta-gradient)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="babas-cta-gradient">
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
