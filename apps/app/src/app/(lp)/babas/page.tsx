import {
  PiBriefcaseDuotone,
  PiCheckCircle,
  PiMedalDuotone,
  PiShieldCheckDuotone,
  PiTrendUpDuotone,
  PiChatCircleDuotone,
  PiStar,
  PiArrowRight,
} from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';
import { PLAN_PRICES } from '@cuidly/core/subscriptions';

export default function BabasPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-fuchsia-50 to-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-mono text-4xl font-bold text-gray-900 sm:text-5xl">
              Impulsione sua carreira
              <span className="block text-fuchsia-600">como babá</span>
            </h1>
            <p className="mt-6 text-lg/8 text-gray-600">
              Conecte-se com famílias de qualidade, receba o Selo de Verificação
              e tenha acesso a vagas exclusivas. Tudo isso gratuitamente!
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/cadastro">Cadastrar Grátis</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              100% Grátis · Selo de Verificação Incluído · Acesso a Vagas
            </p>
          </div>
        </div>
      </section>

      {/* Benefícios Gratuitos */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-fuchsia-600 sm:text-4xl">
              O que você ganha grátis
            </h2>
            <p className="mt-4 text-lg/8 text-gray-600">
              Diferente de outras plataformas, aqui você tem benefícios reais sem pagar nada
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl gap-x-8 gap-y-16 sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-3">
            {[
              {
                icon: PiShieldCheckDuotone,
                title: 'Selo de Verificação',
                description:
                  'Validação de antecedentes criminais grátis. Aumente sua credibilidade e seja escolhida por mais famílias.',
              },
              {
                icon: PiBriefcaseDuotone,
                title: 'Acesso a Vagas',
                description:
                  'Veja vagas publicadas por famílias e receba contatos diretamente. Receba notificações de novas oportunidades.',
              },
              {
                icon: PiTrendUpDuotone,
                title: 'Avaliar Famílias',
                description:
                  'Avalie famílias após trabalhar com elas. Ajude outras babás a fazer escolhas melhores.',
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

      {/* Plano Pro */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-linear-to-br from-fuchsia-500 via-fuchsia-600 to-blue-500 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-16">
            <div className="mx-auto max-w-2xl text-center">
              <PiMedalDuotone className="mx-auto size-16 text-white" />
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
                Babá Pro: R$ {PLAN_PRICES.NANNY_PRO.MONTH.price}/mês
              </h2>
              <p className="mt-2 text-xl text-gray-200">
                Ou R$ {PLAN_PRICES.NANNY_PRO.YEAR.price}/ano
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
              {[
                { title: 'Candidatar-se a Vagas', description: 'Envie candidaturas diretamente para famílias' },
                { title: 'Selo Verificada', description: 'Destaque-se da concorrência' },
                { title: 'Validação Completa', description: 'Documentos + antecedentes criminais' },
                { title: 'Perfil em Destaque', description: 'Apareça primeiro nas buscas' },
                { title: 'Matching Prioritário', description: 'Receba vagas compatíveis primeiro' },
                { title: 'Mensagens Ilimitadas', description: 'Converse livremente com as famílias' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <PiCheckCircle className="mt-1 size-6 shrink-0 text-white" />
                  <div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-gray-200">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button size="xl" variant="secondary" asChild>
                <Link href="/cadastro">
                  Cadastrar e Conhecer o Plano Pro
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
                fill="url(#babas-pro-gradient)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="babas-pro-gradient">
                  <stop stopColor="#E935C1" />
                  <stop offset={1} stopColor="#7775D6" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="bg-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              Como começar
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-4">
            {[
              { step: '1', title: 'Cadastre-se', description: 'Crie seu perfil completo em 5 minutos' },
              { step: '2', title: 'Seja Verificada', description: 'Receba o Selo de Verificação gratuitamente' },
              { step: '3', title: 'Candidate-se a Vagas', description: 'Veja vagas e envie propostas para famílias' },
              { step: '4', title: 'Seja Contratada', description: 'Receba contatos de famílias interessadas' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-blue-500">
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="bg-fuchsia-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-fuchsia-600 sm:text-4xl">
              Histórias de sucesso
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl gap-8 lg:max-w-none lg:grid-cols-3">
            {[
              {
                quote: 'Consegui 3 entrevistas na primeira semana! O Selo de Verificação fez toda a diferença.',
                author: 'Carla M.',
                role: 'Babá Pro',
              },
              {
                quote: 'O plano Pro valeu cada centavo. Minha agenda está sempre cheia desde que assinei.',
                author: 'Juliana O.',
                role: 'Babá Pro',
              },
              {
                quote: 'Finalmente uma plataforma que valoriza as babás! Recomendo para todas as colegas.',
                author: 'Fernanda L.',
                role: 'Babá Verificada',
              },
            ].map((item) => (
              <div
                key={item.author}
                className="rounded-2xl border border-gray-200 bg-white p-8"
              >
                <div className="flex gap-1 text-fuchsia-500">
                  {[...Array(5)].map((_, i) => (
                    <PiStar key={i} className="size-5" weight="fill" />
                  ))}
                </div>
                <p className="mt-4 text-base/7 text-gray-600">
                  &quot;{item.quote}&quot;
                </p>
                <p className="mt-4 font-semibold text-gray-900">
                  - {item.author}, <span className="font-normal text-gray-500">{item.role}</span>
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
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
              Pronta para dar o próximo passo?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-200">
              Cadastre-se grátis e comece a receber oportunidades hoje
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="xl" variant="secondary" asChild>
                <Link href="/cadastro">
                  Cadastrar Agora
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
