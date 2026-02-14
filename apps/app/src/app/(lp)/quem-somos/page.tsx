import {
  PiHeartDuotone,
  PiShieldCheckDuotone,
  PiTargetDuotone,
  PiCheckCircle,
  PiArrowRight,
} from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';

const values = [
  {
    icon: PiTargetDuotone,
    title: 'Missão',
    description:
      'Facilitar a conexão entre famílias e babás qualificadas, oferecendo segurança, tecnologia e preços acessíveis.',
  },
  {
    icon: PiHeartDuotone,
    title: 'Visão',
    description:
      'Ser a plataforma de referência no Brasil para contratação de babás, reconhecida pela segurança e qualidade.',
  },
  {
    icon: PiShieldCheckDuotone,
    title: 'Valores',
    description:
      'Segurança, transparência, respeito, inovação e compromisso com famílias e profissionais.',
  },
];

const differentials = [
  { title: 'Validação Completa', description: 'Antecedentes criminais, referências e certificados verificados' },
  { title: 'Matching Inteligente', description: 'Algoritmo que conecta famílias e babás compatíveis' },
  { title: 'Preços Justos', description: 'Até 70% mais barato que agências tradicionais' },
  { title: 'Suporte Dedicado', description: 'Equipe pronta para ajudar famílias e babás' },
  { title: 'Transparência Total', description: 'Sem taxas escondidas ou cobranças surpresa' },
  { title: 'Foco no Brasil', description: 'Plataforma 100% brasileira, feita para o mercado local' },
];

export default function QuemSomosPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-linear-to-br from-fuchsia-50 to-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-mono text-4xl font-bold text-blue-600 sm:text-5xl">
              Quem Somos
            </h1>
            <p className="mt-6 text-lg/8 text-gray-600">
              Somos uma plataforma brasileira que conecta famílias a babás qualificadas
              com segurança, tecnologia e preços justos.
            </p>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-mono text-3xl font-bold text-fuchsia-600 sm:text-4xl">
              Nossa História
            </h2>
            <div className="mt-8 space-y-4 text-base/7 text-gray-600">
              <p>
                A Cuidly nasceu da experiência real de pais que enfrentaram a dificuldade
                de encontrar babás confiáveis sem pagar os altos preços das agências tradicionais.
              </p>
              <p>
                Percebemos que o mercado estava dividido entre plataformas baratas mas inseguras
                e agências caras mas confiáveis. Decidimos criar uma terceira via:
                <strong className="text-gray-900"> segurança de agência com preço de marketplace</strong>.
              </p>
              <p>
                Hoje, conectamos centenas de famílias a babás verificadas, usando tecnologia
                de matching inteligente e processos rigorosos de validação para garantir a melhor
                experiência para todos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="bg-fuchsia-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {values.map((item) => (
              <div key={item.title}>
                <div className="flex size-12 items-center justify-center rounded-lg bg-linear-to-br from-fuchsia-400 to-fuchsia-500">
                  <item.icon className="size-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-base/7 text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="bg-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              Nossos Diferenciais
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
            {differentials.map((item) => (
              <div key={item.title} className="flex gap-4">
                <PiCheckCircle className="mt-1 size-6 shrink-0 text-fuchsia-600" />
                <div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
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
              Faça parte da nossa comunidade
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-200">
              Junte-se a centenas de famílias e babás que já confiam na Cuidly
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Button size="xl" variant="secondary" asChild>
                <Link href="/cadastro">
                  Cadastrar como Família
                  <PiArrowRight />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline-light"
                asChild
              >
                <Link href="/cadastro">
                  Cadastrar como Babá
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
                fill="url(#quem-somos-gradient)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="quem-somos-gradient">
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
