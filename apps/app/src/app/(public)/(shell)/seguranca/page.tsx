import { Metadata } from 'next';
import {
  PiCheckCircle,
  PiFileTextDuotone,
  PiShieldCheckDuotone,
  PiScanDuotone,
  PiMedalDuotone,
  PiArrowRight,
} from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Verificação de Babás - Identidade e Antecedentes | Cuidly',
  description:
    'Saiba como a Cuidly verifica identidade e antecedentes criminais das babás. Selos Identificada, Verificada e Confiável para mais segurança na sua escolha.',
};

const validationSteps = [
  {
    icon: PiFileTextDuotone,
    title: '1. Documentação',
    description:
      'Verificação de identidade (RG/CNH) com tecnologia de reconhecimento de documentos.',
  },
  {
    icon: PiScanDuotone,
    title: '2. Validação Facial',
    description:
      'Comparação da selfie com a foto do documento para confirmar a identidade.',
  },
  {
    icon: PiShieldCheckDuotone,
    title: '3. Antecedentes Criminais',
    description:
      'Consulta em bases de dados da Polícia Federal e Polícia Civil para verificar histórico criminal.',
  },
  {
    icon: PiMedalDuotone,
    title: '4. Selos de Confiança',
    description:
      'Cada validação concluída contribui para um nível maior de selo no perfil da babá.',
  },
];

export default function SafetyPage() {
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
              A Cuidly oferece um processo de validação com múltiplos
              níveis para garantir mais segurança na sua busca por babás.
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
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
            {/* Selo Identificada */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <div className="flex items-center gap-3">
                <PiShieldCheckDuotone className="size-8 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Selo Identificada</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {[
                  'Perfil completo',
                  'Documento validado (RG/CNH)',
                  'E-mail verificado',
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
                <h3 className="text-xl font-bold text-gray-900">Selo Verificada</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {[
                  'Tudo do Selo Identificada',
                  'Validação facial (selfie vs documento)',
                  'Antecedentes criminais',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <PiCheckCircle className="mt-0.5 size-5 shrink-0 text-fuchsia-600" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Selo Confiável */}
            <div className="rounded-2xl bg-linear-to-br from-violet-500 to-blue-500 p-0.5">
              <div className="rounded-[calc(1rem-2px)] bg-white p-8">
                <div className="flex items-center gap-3">
                  <PiMedalDuotone className="size-8 text-violet-600" />
                  <h3 className="text-xl font-bold text-gray-900">Selo Confiável</h3>
                </div>
                <ul className="mt-6 space-y-3">
                  {[
                    'Tudo do Selo Verificada',
                    '3 ou mais avaliações de famílias',
                    'Maior nível de confiança',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <PiCheckCircle className="mt-0.5 size-5 shrink-0 text-violet-500" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-linear-to-br from-fuchsia-500 via-fuchsia-600 to-blue-500 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
              Quer contratar com segurança?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-200">
              Cadastre-se grátis e encontre babás com identidade validada
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
