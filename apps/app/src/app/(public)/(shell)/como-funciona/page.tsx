import { Button } from '@/components/ui/shadcn/button';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  PiChatCircleDuotone,
  PiFileTextDuotone,
  PiMagnifyingGlassDuotone,
  PiShieldCheckDuotone,
  PiStarDuotone,
  PiUserPlusDuotone,
} from 'react-icons/pi';

export const metadata: Metadata = {
  title: 'Como Encontrar a Babá Ideal - Passo a Passo | Cuidly',
  description:
    'Saiba como funciona a Cuidly: cadastre-se, crie vagas ou perfil, use filtros e matching inteligente para encontrar a babá ideal. Passo a passo para famílias e babás.',
};

const familySteps = [
  {
    icon: PiUserPlusDuotone,
    title: '1. Crie sua Conta',
    description: 'Comece grátis e acesse as babás disponíveis na sua região.',
  },
  {
    icon: PiMagnifyingGlassDuotone,
    title: '2. Encontre a Babá Ideal',
    description: 'Busque por perfil, disponibilidade e preferências.',
  },
  {
    icon: PiFileTextDuotone,
    title: '3. Avalie com Transparência',
    description: 'Veja experiência, avaliações e histórico antes de decidir.',
  },
  {
    icon: PiShieldCheckDuotone,
    title: '4. Confie nos Selos',
    description: 'Priorize perfis verificados e com validação de segurança.',
  },
  {
    icon: PiChatCircleDuotone,
    title: '5. Converse Diretamente',
    description:
      'Fale pelo chat, alinhe detalhes e esclareça tudo antes de avançar.',
  },
  {
    icon: PiStarDuotone,
    title: '6. Escolha com Segurança',
    description:
      'Defina sua babá e comece com mais tranquilidade para sua família.',
  },
];

const nannySteps = [
  {
    icon: PiUserPlusDuotone,
    title: '1. Crie seu Perfil',
    description:
      'Cadastre-se gratuitamente e apresente sua experiência e disponibilidade.',
  },
  {
    icon: PiShieldCheckDuotone,
    title: '2. Seja Verificada',
    description:
      'Conquiste o selo de validação e aumente sua credibilidade na plataforma.',
  },
  {
    icon: PiMagnifyingGlassDuotone,
    title: '3. Encontre Boas Oportunidades',
    description:
      'Acesse vagas publicadas por famílias e candidate-se às que combinam com você.',
  },
  {
    icon: PiChatCircleDuotone,
    title: '4. Converse com as Famílias',
    description: 'Receba contatos e alinhe detalhes diretamente pelo chat.',
  },
  {
    icon: PiStarDuotone,
    title: '5. Ganhe Mais Visibilidade',
    description: 'Destaque seu perfil para aparecer primeiro nas buscas.',
  },
  {
    icon: PiFileTextDuotone,
    title: '6. Comece a Trabalhar',
    description:
      'Escolha as melhores propostas e atue com famílias alinhadas ao seu perfil.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
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
              A forma <span className="text-fuchsia-500">mais simples</span> de
              encontrar babás
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
              Perfis verificados, avaliações reais e contato direto. Simples,
              seguro e transparente.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild>
                <a href="#para-familias">Começar como Família</a>
              </Button>
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600"
              >
                <a href="#para-babas">Começar como Babá</a>
              </Button>
            </div>
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

      {/* Para Famílias */}
      <section id="para-familias" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="font-mono text-4xl font-bold tracking-tight text-pretty text-fuchsia-600 sm:text-5xl">
              Para Famílias
            </h2>
            <p className="mt-6 text-lg/8 text-gray-600">
              Encontre a babá ideal para sua família em poucos passos.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {familySteps.map((step) => (
                <div key={step.title} className="flex flex-col">
                  <dt className="text-base/7 font-semibold text-gray-900">
                    <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-fuchsia-400 to-fuchsia-500">
                      <step.icon
                        aria-hidden="true"
                        className="size-6 text-white"
                      />
                    </div>
                    {step.title}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-600">
                    <p className="flex-auto">{step.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Para Babás */}
      <section
        id="para-babas"
        className="scroll-mt-20 bg-blue-50 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="font-mono text-4xl font-bold tracking-tight text-pretty text-blue-600 sm:text-5xl">
              Para Babás
            </h2>
            <p className="mt-6 text-lg/8 text-gray-600">
              Crie seu perfil, ganhe visibilidade e encontre boas oportunidades.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {nannySteps.map((step) => (
                <div key={step.title} className="flex flex-col">
                  <dt className="text-base/7 font-semibold text-gray-900">
                    <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-400 to-blue-500">
                      <step.icon
                        aria-hidden="true"
                        className="size-6 text-white"
                      />
                    </div>
                    {step.title}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-600">
                    <p className="flex-auto">{step.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-linear-to-br from-fuchsia-500 via-fuchsia-600 to-blue-500 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="font-mono text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl">
              O cuidado certo começa agora.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-white/80">
              Perfis verificados, avaliações reais e contato direto
              para decisões mais tranquilas.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="xl" variant="secondary" asChild>
                <Link href="/cadastro">Sou Família</Link>
              </Button>
              <Button size="xl" variant="outline-light" asChild>
                <Link href="/cadastro">Sou Babá</Link>
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
                fill="url(#como-funciona-gradient)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="como-funciona-gradient">
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
