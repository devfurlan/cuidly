import {
  PiCheckCircle,
  PiFileTextDuotone,
  PiLockDuotone,
  PiShieldCheckDuotone,
  PiUsersDuotone,
  PiArrowRight,
} from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';

const validationSteps = [
  {
    icon: PiFileTextDuotone,
    title: '1. Documentação',
    description:
      'Verificação de identidade (RG/CPF), comprovante de residência e certificados profissionais.',
  },
  {
    icon: PiShieldCheckDuotone,
    title: '2. Antecedentes Criminais',
    description:
      'Consulta em bases de dados federais, estaduais e municipais para verificar histórico criminal.',
  },
  {
    icon: PiUsersDuotone,
    title: '3. Referências',
    description:
      'Contato com pelo menos 2 referências profissionais anteriores para validar experiência.',
  },
  {
    icon: PiCheckCircle,
    title: '4. Aprovação',
    description:
      'Após aprovação em todas as etapas, a babá recebe o Selo de Verificação.',
  },
];

const dataProtection = [
  {
    icon: PiLockDuotone,
    title: 'Criptografia SSL',
    description:
      'Todos os dados são transmitidos com criptografia de ponta a ponta',
  },
  {
    icon: PiShieldCheckDuotone,
    title: 'LGPD Compliance',
    description:
      'Seguimos rigorosamente a Lei Geral de Proteção de Dados',
  },
  {
    icon: PiFileTextDuotone,
    title: 'Dados Seguros',
    description:
      'Armazenamento em servidores seguros com backup diário',
  },
];

const guarantees = [
  {
    title: '100% das babás são verificadas',
    description:
      'Nenhuma babá é aprovada sem passar pelo processo completo de validação',
  },
  {
    title: 'Suporte dedicado',
    description:
      'Nossa equipe está disponível para ajudar em caso de qualquer problema',
  },
  {
    title: 'Transparência total',
    description:
      'Você tem acesso completo ao status de validação de cada babá',
  },
];

export default function SegurancaPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-linear-to-br from-fuchsia-50 to-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center">
              <PiShieldCheckDuotone className="size-20 text-fuchsia-600" />
            </div>
            <h1 className="mt-6 font-mono text-4xl font-bold text-gray-900 sm:text-5xl">
              Segurança em <span className="text-fuchsia-600">primeiro lugar</span>
            </h1>
            <p className="mt-6 text-lg/8 text-gray-600">
              Todas as babás passam por um rigoroso processo de validação
              antes de serem aprovadas na plataforma.
            </p>
          </div>
        </div>
      </section>

      {/* Processo de Validação */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              Processo de Validação
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl gap-x-8 gap-y-16 sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-4">
            {validationSteps.map((step) => (
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

      {/* Níveis de Validação */}
      <section className="bg-fuchsia-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-fuchsia-600 sm:text-4xl">
              Níveis de Validação
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Selo Identificada */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <div className="flex items-center gap-3">
                <PiShieldCheckDuotone className="size-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">Selo Identificada</h3>
              </div>
              <p className="mt-2 text-sm text-gray-500">Cuidly Básico (Grátis)</p>
              <ul className="mt-6 space-y-3">
                {[
                  'Perfil completo',
                  'Documento validado (RG/CNH)',
                  'E-mail verificado',
                  'Candidatar-se a vagas',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <PiCheckCircle className="mt-0.5 size-5 shrink-0 text-blue-500" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Selo Verificada */}
            <div className="rounded-2xl border-2 border-fuchsia-500 bg-white p-8">
              <div className="flex items-center gap-3">
                <PiShieldCheckDuotone className="size-8 text-fuchsia-600" />
                <h3 className="text-2xl font-bold text-gray-900">Selo Verificada</h3>
              </div>
              <p className="mt-2 text-sm font-semibold text-fuchsia-600">Cuidly Pro</p>
              <ul className="mt-6 space-y-3">
                {[
                  'Tudo do Selo Identificada',
                  'Validação facial (selfie vs documento)',
                  'Antecedentes criminais (background check)',
                  'Mensagens ilimitadas após candidatura',
                  'Perfil em destaque',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <PiCheckCircle className="mt-0.5 size-5 shrink-0 text-fuchsia-600" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Proteção de Dados */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              Proteção de Dados
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl gap-x-8 gap-y-16 sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-3">
            {dataProtection.map((item) => (
              <div key={item.title}>
                <div className="flex size-12 items-center justify-center rounded-lg bg-linear-to-br from-blue-400 to-blue-500">
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

      {/* Garantias */}
      <section className="bg-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              Nossas Garantias
            </h2>
          </div>
          <div className="mx-auto mt-16 max-w-3xl space-y-4">
            {guarantees.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="flex items-start gap-4">
                  <PiCheckCircle className="mt-1 size-6 shrink-0 text-green-500" />
                  <div>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
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
              Pronta para contratar com segurança?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-200">
              Cadastre-se grátis e tenha acesso a babás 100% verificadas
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="xl" variant="secondary" asChild>
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
                fill="url(#seguranca-gradient)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="seguranca-gradient">
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
