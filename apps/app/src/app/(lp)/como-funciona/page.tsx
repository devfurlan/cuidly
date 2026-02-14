import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';
import {
  PiArrowRight,
  PiChatCircleDuotone,
  PiFileTextDuotone,
  PiMagnifyingGlassDuotone,
  PiShieldCheckDuotone,
  PiStarDuotone,
  PiUserPlusDuotone,
} from 'react-icons/pi';

const familySteps = [
  {
    icon: PiUserPlusDuotone,
    title: '1. Cadastre-se Grátis',
    description:
      'Crie sua conta e cadastre o perfil dos seus filhos (idade, necessidades, temperamento)',
  },
  {
    icon: PiMagnifyingGlassDuotone,
    title: '2. Explore ou Crie Vagas',
    description:
      'Busque babás compatíveis ou publique uma vaga para receber candidaturas',
  },
  {
    icon: PiChatCircleDuotone,
    title: '3. Entre em Contato',
    description:
      'Encontrou uma babá ideal? Inicie uma conversa pelo chat e conheça melhor antes de decidir',
  },
  {
    icon: PiShieldCheckDuotone,
    title: '4. Confira os Selos',
    description:
      'Cada babá pode ter selos como Identificada, Verificada ou Confiável - confira o nível de validação de cada uma',
  },
  {
    icon: PiFileTextDuotone,
    title: '5. Priorize Babás Validadas',
    description:
      'Babás com Selo Verificada passaram por validação facial e verificação de segurança completa',
  },
  {
    icon: PiStarDuotone,
    title: '6. Contrate com Confiança',
    description:
      'Converse pelo chat, tire suas dúvidas e contrate a babá ideal para sua família',
  },
];

const nannySteps = [
  {
    icon: PiUserPlusDuotone,
    title: '1. Cadastre-se Grátis',
    description:
      'Crie seu perfil completo com experiência, certificados e disponibilidade',
  },
  {
    icon: PiShieldCheckDuotone,
    title: '2. Seja Verificada (Grátis)',
    description: 'Receba o Selo de Verificação após validação de antecedentes',
  },
  {
    icon: PiMagnifyingGlassDuotone,
    title: '3. Veja Vagas',
    description:
      'Acesse vagas publicadas por famílias e candidate-se às que mais combinam com você',
  },
  {
    icon: PiChatCircleDuotone,
    title: '4. Receba Contatos',
    description:
      'Famílias interessadas entrarão em contato diretamente com você',
  },
  {
    icon: PiStarDuotone,
    title: '5. Destaque-se (Opcional)',
    description:
      'Quer mais visibilidade? Apareça primeiro nas buscas e se destaque da concorrência',
  },
  {
    icon: PiFileTextDuotone,
    title: '6. Seja Contratada',
    description:
      'Converse pelo chat, alinhe expectativas e comece a trabalhar com famílias de qualidade',
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-linear-to-br from-fuchsia-50 to-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-mono text-4xl font-bold text-blue-600 sm:text-5xl">
              Como Funciona
            </h1>
            <p className="mt-6 text-lg/8 text-gray-600">
              Conectar famílias a babás qualificadas nunca foi tão fácil e
              seguro
            </p>
          </div>
        </div>
      </section>

      {/* Para Famílias */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-fuchsia-600 sm:text-4xl">
              Para Famílias
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl gap-x-8 gap-y-16 sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-3">
            {familySteps.map((step) => (
              <div key={step.title}>
                <div className="flex size-12 items-center justify-center rounded-lg bg-linear-to-br from-fuchsia-400 to-fuchsia-500">
                  <step.icon className="size-6 text-white" />
                </div>
                <h3 className="mt-4 text-base/7 font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-base/7 text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para Babás */}
      <section className="bg-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              Para Babás
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl gap-x-8 gap-y-16 sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-3">
            {nannySteps.map((step) => (
              <div key={step.title}>
                <div className="flex size-12 items-center justify-center rounded-lg bg-linear-to-br from-blue-400 to-blue-500">
                  <step.icon className="size-6 text-white" />
                </div>
                <h3 className="mt-4 text-base/7 font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-base/7 text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-linear-to-br from-fuchsia-500 via-fuchsia-600 to-blue-500 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
              Pronto para começar?
            </h2>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Button size="xl" variant="secondary" asChild>
                <Link href="/cadastro">
                  Sou Família
                  <PiArrowRight />
                </Link>
              </Button>
              <Button size="xl" variant="outline-light" asChild>
                <Link href="/cadastro">
                  Sou Babá
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
