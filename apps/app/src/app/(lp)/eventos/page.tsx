'use client';

import {
  PiCalendarDuotone,
  PiCheckCircle,
  PiClockDuotone,
  PiHeartDuotone,
  PiLightningDuotone,
  PiMapPin,
  PiShieldCheckDuotone,
  PiStar,
  PiTrendUpDuotone,
  PiTrophyDuotone,
  PiUsersDuotone,
  PiArrowRight,
} from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/shadcn/accordion';
import Link from 'next/link';

const faqs = [
  {
    question: 'Como funciona a contratação urgente?',
    answer:
      'Basta informar data, horário e local do evento. Nosso sistema mostra imediatamente as babás disponíveis naquele período. Você escolhe, confirma e pronto. Todo o processo leva minutos.',
  },
  {
    question: 'As babás são verificadas?',
    answer:
      'Sim. Todas passam por checagem de documentos, antecedentes e referências. Só aprovamos profissionais com experiência comprovada em cuidado infantil.',
  },
  {
    question: 'Posso contratar só por algumas horas?',
    answer:
      'Sim! Você contrata pelo tempo exato que precisar. Pode ser 2 horas, 4 horas ou o período completo do evento. Total flexibilidade.',
  },
  {
    question: 'Como funciona o pagamento?',
    answer:
      'O pagamento é processado de forma segura pela plataforma. Você paga apenas pelas horas contratadas, sem taxas escondidas. Aceita cartão de crédito e débito.',
  },
  {
    question: 'E se a babá cancelar?',
    answer:
      'Trabalhamos com confirmação antecipada. Caso ocorra algum imprevisto, nosso sistema encontra automaticamente outra profissional disponível no mesmo horário.',
  },
];

const howItWorks = [
  {
    step: '1',
    icon: PiCalendarDuotone,
    title: 'Informe data e horário',
    description:
      'Digite quando e onde você precisa da babá. Nosso sistema busca automaticamente quem está disponível.',
  },
  {
    step: '2',
    icon: PiUsersDuotone,
    title: 'Veja babás disponíveis',
    description:
      'Compare perfis, experiências, avaliações e escolha a profissional ideal para cuidar das crianças.',
  },
  {
    step: '3',
    icon: PiLightningDuotone,
    title: 'Contrate rápido',
    description:
      'Confirme, pague online e pronto. A babá recebe a confirmação instantaneamente. Tudo em minutos.',
  },
];

const benefits = [
  {
    icon: PiClockDuotone,
    title: 'Disponibilidade imediata',
    description:
      'Babás disponíveis hoje ou no mesmo dia. Perfeito para imprevistos e urgências.',
  },
  {
    icon: PiShieldCheckDuotone,
    title: 'Babás verificadas',
    description:
      'Todas passam por checagem rigorosa de documentos, antecedentes e referências.',
  },
  {
    icon: PiLightningDuotone,
    title: 'Sem burocracia',
    description:
      'Processo 100% digital. Escolha, contrate e pague tudo pela plataforma em minutos.',
  },
  {
    icon: PiCheckCircle,
    title: 'Pagamento seguro',
    description:
      'Transações protegidas. Você paga apenas pelas horas contratadas, sem surpresas.',
  },
  {
    icon: PiTrophyDuotone,
    title: 'Ideal para eventos',
    description:
      'Casamentos, festas, formaturas, shows e eventos empresariais. Experiência comprovada.',
  },
  {
    icon: PiStar,
    title: 'Avaliações reais',
    description:
      'Todas as babás têm avaliações de famílias reais. Você escolhe com confiança.',
  },
];

const reasons = [
  {
    icon: PiTrendUpDuotone,
    title: 'Redução de estresse',
    description:
      'Você aproveita o evento com tranquilidade enquanto uma profissional cuida das crianças. Sem preocupações, apenas momentos especiais.',
  },
  {
    icon: PiShieldCheckDuotone,
    title: 'Mais segurança',
    description:
      'Todas as babás são verificadas e avaliadas por outras famílias. Você contrata sabendo que escolheu alguém confiável e experiente.',
  },
  {
    icon: PiHeartDuotone,
    title: 'Pais aproveitam o evento',
    description:
      'Com as crianças bem cuidadas, você se diverte, conversa, dança e curte cada momento sem interrupções ou preocupações.',
  },
  {
    icon: PiUsersDuotone,
    title: 'Necessidades específicas',
    description:
      'Filtre babás com experiência em crianças com necessidades especiais, alergias ou rotinas específicas. Cuidado personalizado.',
  },
  {
    icon: PiLightningDuotone,
    title: 'Cobertura no mesmo dia',
    description:
      'Imprevistos acontecem. Quando possível, oferecemos babás disponíveis para contratação no mesmo dia do evento.',
  },
];

const testimonials = [
  {
    text: 'Precisava de última hora para um casamento. Encontrei uma babá incrível em menos de 10 minutos. As crianças adoraram!',
    author: 'Ana Paula',
    role: 'mãe de 2',
  },
  {
    text: 'Finalmente consegui aproveitar uma confraternização sem me preocupar. A babá foi super atenciosa e pontual.',
    author: 'Roberto',
    role: 'pai de 1',
  },
  {
    text: 'Usei para uma formatura e foi perfeito. Processo rápido, babá verificada e tudo resolvido pelo celular.',
    author: 'Juliana',
    role: 'mãe de 3',
  },
];

const babysitters = [
  {
    name: 'Juliana C.',
    experience: '6 anos',
    rating: 5.0,
    reviews: 45,
    distance: '2.3 km',
    available: 'Hoje',
    hourlyRate: 50,
    tags: ['Eventos', 'Experiente'],
  },
  {
    name: 'Maria S.',
    experience: '5 anos',
    rating: 5.0,
    reviews: 32,
    distance: '3.1 km',
    available: 'Hoje',
    hourlyRate: 45,
    tags: ['Festas', 'Confiável'],
  },
  {
    name: 'Carla M.',
    experience: '7 anos',
    rating: 5.0,
    reviews: 52,
    distance: '1.8 km',
    available: 'Amanhã',
    hourlyRate: 55,
    tags: ['Casamentos', 'Premium'],
  },
];

export default function EventosLP() {
  return (
    <>
      {/* Hero */}
      <section className="bg-linear-to-br from-fuchsia-50 to-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-fuchsia-100 px-4 py-2 text-sm font-semibold text-fuchsia-700">
              <PiLightningDuotone className="size-4" />
              Disponível hoje · Contratação em minutos
            </div>
            <h1 className="font-mono text-4xl font-bold text-gray-900 sm:text-5xl">
              Babá para seu evento.
              <span className="block text-fuchsia-600">Rápido, urgente e confiável.</span>
            </h1>
            <p className="mt-6 text-lg/8 text-gray-600">
              Casamento, festa, reunião ou evento? Encontre babás verificadas
              disponíveis agora. Contrate em minutos, sem burocracia.
            </p>
            <div className="mt-10">
              <Button size="lg" asChild>
                <Link href="/cadastro">Encontrar babá disponível agora</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <PiCheckCircle className="size-5 text-green-600" />
                <span>Todas verificadas</span>
              </div>
              <div className="flex items-center gap-2">
                <PiCheckCircle className="size-5 text-green-600" />
                <span>Contratação em minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <PiCheckCircle className="size-5 text-green-600" />
                <span>Pagamento seguro</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              Como funciona
            </h2>
            <p className="mt-4 text-lg/8 text-gray-600">
              3 passos simples para contratar uma babá para seu evento
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-blue-500">
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <item.icon className="mx-auto mb-3 size-10 text-fuchsia-600" />
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="bg-fuchsia-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-fuchsia-600 sm:text-4xl">
              Por que contratar pelo Cuidly?
            </h2>
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
                <p className="mt-2 text-base/7 text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              O que famílias estão dizendo
            </h2>
            <p className="mt-4 text-lg/8 text-gray-600">
              Veja por que pais confiam no Cuidly para seus eventos
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl gap-8 lg:max-w-none lg:grid-cols-3">
            {testimonials.map((item) => (
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
                  &ldquo;{item.text}&rdquo;
                </p>
                <p className="mt-4 text-sm font-semibold text-gray-900">
                  {item.author}, <span className="font-normal text-gray-500">{item.role}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Babás Disponíveis */}
      <section className="bg-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              Babás disponíveis para eventos
            </h2>
            <p className="mt-4 text-lg/8 text-gray-600">
              Profissionais verificadas prontas para cuidar das crianças
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
            {babysitters.map((babysitter) => (
              <div
                key={babysitter.name}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-32 bg-linear-to-br from-fuchsia-400 to-blue-400" />
                <div className="p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {babysitter.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {babysitter.experience} de experiência
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-fuchsia-600">
                        R$ {babysitter.hourlyRate}
                      </div>
                      <div className="text-xs text-gray-500">por hora</div>
                    </div>
                  </div>
                  <div className="mb-3 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <PiStar
                        key={i}
                        className="size-4 text-fuchsia-500"
                        weight="fill"
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {babysitter.rating} ({babysitter.reviews})
                    </span>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <PiMapPin className="size-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {babysitter.distance} de você
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      Disponível {babysitter.available}
                    </span>
                  </div>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {babysitter.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-medium text-fuchsia-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button className="w-full" asChild>
                    <Link href="/cadastro">Ver perfil e contratar</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/cadastro">
                Ver todas as babás disponíveis
                <PiArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Por que contratar */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold text-fuchsia-600 sm:text-4xl">
              Por que contratar uma babá para eventos?
            </h2>
          </div>
          <div className="mx-auto mt-16 max-w-4xl space-y-4">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="rounded-2xl border border-gray-200 bg-white p-8"
              >
                <h3 className="flex items-center text-lg font-bold text-gray-900">
                  <reason.icon className="mr-3 size-6 text-fuchsia-600" />
                  {reason.title}
                </h3>
                <p className="mt-2 text-base/7 text-gray-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-fuchsia-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-mono text-3xl font-bold text-blue-600 sm:text-4xl">
              Perguntas frequentes
            </h2>
            <p className="mt-4 text-center text-lg/8 text-gray-600">
              Tudo o que você precisa saber sobre contratar babá para eventos
            </p>
            <Accordion type="single" collapsible defaultValue="item-0" className="mt-12">
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
              Encontre uma babá para seu evento agora
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-200">
              Rápido · Seguro · Sem burocracia · Contratação em minutos
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="xl" variant="secondary" asChild>
                <Link href="/cadastro">
                  Cadastrar e buscar babá agora
                  <PiArrowRight />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-200/75">
              Cadastro gratuito · Pagamento seguro · Disponível hoje
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
                fill="url(#eventos-gradient)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="eventos-gradient">
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
