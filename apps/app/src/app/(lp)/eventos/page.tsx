'use client';

import { PiCalendar, PiCaretDown, PiCheckCircle, PiClock, PiHeart, PiLightning, PiMapPin, PiShieldCheck, PiStar, PiTrendUp, PiTrophy, PiUsers } from 'react-icons/pi';

import Link from 'next/link';
import { useState } from 'react';

export default function EventosLP() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const babysitters = [
    {
      name: 'Juliana Costa',
      experience: '6 anos',
      rating: 5.0,
      reviews: 45,
      distance: '2.3 km',
      available: 'Hoje',
      hourlyRate: 50,
      tags: ['Eventos', 'Experiente'],
    },
    {
      name: 'Maria Silva',
      experience: '5 anos',
      rating: 5.0,
      reviews: 32,
      distance: '3.1 km',
      available: 'Hoje',
      hourlyRate: 45,
      tags: ['Festas', 'Confiável'],
    },
    {
      name: 'Carla Mendes',
      experience: '7 anos',
      rating: 5.0,
      reviews: 52,
      distance: '1.8 km',
      available: 'Amanhã',
      hourlyRate: 55,
      tags: ['Casamentos', 'Premium'],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <PiHeart className="h-8 w-8 fill-accent text-primary" />
            <span className="text-2xl font-bold text-primary">Cuidly</span>
          </Link>
          <nav className="hidden items-center space-x-8 md:flex">
            <a
              href="#como-funciona"
              className="text-gray-600 transition hover:text-gray-900"
            >
              Como funciona
            </a>
            <a
              href="#beneficios"
              className="text-gray-600 transition hover:text-gray-900"
            >
              Benefícios
            </a>
            <a
              href="#babysitters"
              className="text-gray-600 transition hover:text-gray-900"
            >
              Babás
            </a>
            <a
              href="#faq"
              className="text-gray-600 transition hover:text-gray-900"
            >
              FAQ
            </a>
            <button className="hover:bg-titles rounded-lg bg-primary px-5 py-2 font-medium text-white transition">
              Entrar
            </button>
          </nav>
        </div>
      </header>

      <section className="from-light bg-linear-to-b to-white px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
              <PiLightning className="h-4 w-4" />
              <span>Disponível hoje • Contratação em minutos</span>
            </div>

            <h1 className="mb-6 text-5xl leading-tight font-bold text-gray-900 md:text-6xl">
              Babá para seu evento.
              <br />
              <span className="text-primary">Rápido, urgente e confiável.</span>
            </h1>

            <p className="text-titles mb-10 text-xl leading-relaxed">
              Casamento, festa, reunião ou evento? Encontre babás verificadas
              disponíveis agora. Contrate em minutos, sem burocracia.
            </p>

            <button className="hover:bg-titles transform rounded-xl bg-primary px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-primary/30 transition hover:-translate-y-1 hover:shadow-primary/50">
              Encontrar babá disponível agora
            </button>

            <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <PiCheckCircle className="h-5 w-5 text-green-600" />
                <span>Todas verificadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <PiCheckCircle className="h-5 w-5 text-green-600" />
                <span>Contratação em minutos</span>
              </div>
              <div className="flex items-center space-x-2">
                <PiCheckCircle className="h-5 w-5 text-green-600" />
                <span>Pagamento seguro</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="bg-white px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-titles mb-4 text-4xl font-bold">
              Como funciona
            </h2>
            <p className="text-titles text-xl">
              3 passos simples para contratar uma babá para seu evento
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-white shadow-lg">
                1
              </div>
              <PiCalendar className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="text-titles mb-3 text-xl font-bold">
                Informe data e horário
              </h3>
              <p className="text-gray-600">
                Digite quando e onde você precisa da babá. Nosso sistema busca
                automaticamente quem está disponível.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-white shadow-lg">
                2
              </div>
              <PiUsers className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="text-titles mb-3 text-xl font-bold">
                Veja babás disponíveis
              </h3>
              <p className="text-gray-600">
                Compare perfis, experiências, avaliações e escolha a
                profissional ideal para cuidar das crianças.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-white shadow-lg">
                3
              </div>
              <PiLightning className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="text-titles mb-3 text-xl font-bold">
                Contrate rápido
              </h3>
              <p className="text-gray-600">
                Confirme, pague online e pronto. A babá recebe a confirmação
                instantaneamente. Tudo em minutos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="beneficios"
        className="from-light bg-linear-to-b to-white px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-titles mb-4 text-4xl font-bold">
              Por que contratar pelo Cuidly?
            </h2>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                <PiClock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-titles mb-3 text-xl font-bold">
                Disponibilidade imediata
              </h3>
              <p className="text-gray-600">
                Babás disponíveis hoje ou no mesmo dia. Perfeito para
                imprevistos e urgências.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                <PiShieldCheck className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-titles mb-3 text-xl font-bold">
                Babás verificadas
              </h3>
              <p className="text-gray-600">
                Todas passam por checagem rigorosa de documentos, antecedentes e
                referências.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100">
                <PiLightning className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-titles mb-3 text-xl font-bold">
                Sem burocracia
              </h3>
              <p className="text-gray-600">
                Processo 100% digital. Escolha, contrate e pague tudo pela
                plataforma em minutos.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-fuchsia-100">
                <PiCheckCircle className="h-7 w-7 text-fuchsia-600" />
              </div>
              <h3 className="text-titles mb-3 text-xl font-bold">
                Pagamento seguro
              </h3>
              <p className="text-gray-600">
                Transações protegidas. Você paga apenas pelas horas contratadas,
                sem surpresas.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-100">
                <PiTrophy className="h-7 w-7 text-yellow-600" />
              </div>
              <h3 className="text-titles mb-3 text-xl font-bold">
                Ideal para eventos
              </h3>
              <p className="text-gray-600">
                Casamentos, festas, formaturas, shows e eventos empresariais.
                Experiência comprovada.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100">
                <PiStar className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-titles mb-3 text-xl font-bold">
                Avaliações reais
              </h3>
              <p className="text-gray-600">
                Todas as babás têm avaliações de famílias reais. Você escolhe
                com confiança.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-titles mb-4 text-4xl font-bold">
              O que famílias estão dizendo
            </h2>
            <p className="text-titles text-xl">
              Veja por que pais confiam no Cuidly para seus eventos
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-blue-50 p-8">
              <div className="mb-4 flex items-center">
                {[...Array(5)].map((_, i) => (
                  <PiStar
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-dark mb-4 leading-relaxed">
                &ldquo;Precisava de última hora para um casamento. Encontrei uma
                babá incrível em menos de 10 minutos. As crianças
                adoraram!&rdquo;
              </p>
              <div className="text-sm text-gray-600">Ana Paula, mãe de 2</div>
            </div>

            <div className="rounded-2xl bg-blue-50 p-8">
              <div className="mb-4 flex items-center">
                {[...Array(5)].map((_, i) => (
                  <PiStar
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-dark mb-4 leading-relaxed">
                &ldquo;Finalmente consegui aproveitar uma confraternização sem
                me preocupar. A babá foi super atenciosa e pontual.&rdquo;
              </p>
              <div className="text-sm text-gray-600">Roberto, pai de 1</div>
            </div>

            <div className="rounded-2xl bg-blue-50 p-8">
              <div className="mb-4 flex items-center">
                {[...Array(5)].map((_, i) => (
                  <PiStar
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-dark mb-4 leading-relaxed">
                &ldquo;Usei para uma formatura e foi perfeito. Processo rápido,
                babá verificada e tudo resolvido pelo celular.&rdquo;
              </p>
              <div className="text-sm text-gray-600">Juliana, mãe de 3</div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="babysitters"
        className="from-light bg-linear-to-b to-white px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-titles mb-4 text-4xl font-bold">
              Babás disponíveis para eventos
            </h2>
            <p className="text-titles text-xl">
              Profissionais verificadas prontas para cuidar das crianças
            </p>
          </div>

          <div className="mx-auto mb-12 grid max-w-5xl gap-8 md:grid-cols-3">
            {babysitters.map((babysitter, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-40 bg-linear-to-br from-primary to-secondary"></div>
                <div className="p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-titles mb-1 text-xl font-bold">
                        {babysitter.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {babysitter.experience} de experiência
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        R$ {babysitter.hourlyRate}
                      </div>
                      <div className="text-xs text-gray-500">por hora</div>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <PiStar
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {babysitter.rating} ({babysitter.reviews})
                    </span>
                  </div>

                  <div className="mb-3 flex items-center space-x-2">
                    <PiMapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {babysitter.distance} de você
                    </span>
                  </div>

                  <div className="mb-4 flex items-center space-x-2">
                    <div className="flex-1 rounded-full bg-green-100 px-3 py-1 text-center text-xs font-medium text-green-700">
                      Disponível {babysitter.available}
                    </div>
                  </div>

                  <div className="mb-5 flex flex-wrap gap-2">
                    {babysitter.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button className="hover:bg-titles w-full rounded-lg bg-primary py-3 font-semibold text-white transition">
                    Ver perfil e contratar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/babysitters"
              className="inline-block rounded-xl bg-gray-900 px-8 py-4 text-lg font-semibold text-white transition hover:bg-gray-800"
            >
              Ver todas as babás disponíveis
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-titles mb-4 text-4xl font-bold">
              Por que contratar uma babá para eventos pelo Cuidly?
            </h2>
          </div>

          <div className="space-y-6">
            <div className="from-light border-light rounded-2xl border bg-linear-to-r to-white p-8">
              <h3 className="text-titles mb-3 flex items-center text-xl font-bold">
                <PiTrendUp className="mr-3 h-6 w-6 text-primary" />
                Redução de estresse
              </h3>
              <p className="text-dark leading-relaxed">
                Você aproveita o evento com tranquilidade enquanto uma
                profissional cuida das crianças. Sem preocupações, apenas
                momentos especiais.
              </p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-linear-to-r from-green-50 to-white p-8">
              <h3 className="text-titles mb-3 flex items-center text-xl font-bold">
                <PiShieldCheck className="mr-3 h-6 w-6 text-green-600" />
                Mais segurança
              </h3>
              <p className="text-dark leading-relaxed">
                Todas as babás são verificadas e avaliadas por outras famílias.
                Você contrata sabendo que escolheu alguém confiável e
                experiente.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-linear-to-r from-purple-50 to-white p-8">
              <h3 className="text-titles mb-3 flex items-center text-xl font-bold">
                <PiHeart className="mr-3 h-6 w-6 text-purple-600" />
                Pais aproveitam o evento
              </h3>
              <p className="text-dark leading-relaxed">
                Com as crianças bem cuidadas, você se diverte, conversa, dança e
                curte cada momento sem interrupções ou preocupações.
              </p>
            </div>

            <div className="rounded-2xl border border-fuchsia-100 bg-linear-to-r from-fuchsia-50 to-white p-8">
              <h3 className="text-titles mb-3 flex items-center text-xl font-bold">
                <PiUsers className="mr-3 h-6 w-6 text-fuchsia-600" />
                Opção para necessidades específicas
              </h3>
              <p className="text-dark leading-relaxed">
                Filtre babás com experiência em crianças com necessidades
                especiais, alergias ou rotinas específicas. Cuidado
                personalizado.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-linear-to-r from-orange-50 to-white p-8">
              <h3 className="text-titles mb-3 flex items-center text-xl font-bold">
                <PiLightning className="mr-3 h-6 w-6 text-orange-600" />
                Cobertura no mesmo dia
              </h3>
              <p className="text-dark leading-relaxed">
                Imprevistos acontecem. Quando possível, oferecemos babás
                disponíveis para contratação no mesmo dia do evento.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="from-light bg-linear-to-b to-white px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-titles mb-4 text-4xl font-bold">
              Perguntas frequentes
            </h2>
            <p className="text-titles text-xl">
              Tudo o que você precisa saber sobre contratar babá para eventos
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="hover:bg-light flex w-full items-center justify-between px-8 py-6 text-left transition"
                >
                  <span className="text-titles pr-4 text-lg font-bold">
                    {faq.question}
                  </span>
                  <PiCaretDown
                    className={`h-6 w-6 shrink-0 text-primary transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6">
                    <p className="text-dark leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-linear-to-br from-primary to-secondary px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            Encontre uma babá disponível para seu evento agora
          </h2>
          <p className="mb-10 text-xl text-white">
            Rápido • Seguro • Sem burocracia • Contratação em minutos
          </p>
          <button className="transform rounded-xl bg-white px-10 py-5 text-lg font-bold text-primary shadow-2xl transition hover:scale-105 hover:bg-blue-50">
            Cadastrar e buscar babá agora
          </button>
          <p className="mt-6 text-sm text-white">
            Cadastro gratuito • Pagamento seguro • Disponível hoje
          </p>
        </div>
      </section>

      <footer className="bg-gray-900 px-4 py-12 text-gray-400 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-4 flex items-center justify-center space-x-2">
            <PiHeart className="h-6 w-6 fill-accent text-accent" />
            <span className="text-xl font-bold text-white">Cuidly</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Cuidly Tecnologia Ltda · CNPJ 63.813.138/0001-20
          </p>
        </div>
      </footer>
    </div>
  );
}
