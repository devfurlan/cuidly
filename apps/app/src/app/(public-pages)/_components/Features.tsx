import {
  PiChatCircleDotsDuotone,
  PiMagnifyingGlassDuotone,
  PiMegaphoneDuotone,
  PiShieldCheckDuotone,
  PiStarDuotone,
  PiTargetDuotone,
} from 'react-icons/pi';

export default function Features() {
  const features = [
    {
      icon: PiTargetDuotone,
      title: 'Matching Inteligente',
      description:
        'Receba sugestões automáticas de babás compatíveis com o perfil da sua família, considerando localização, horários e necessidades específicas.',
    },
    {
      icon: PiShieldCheckDuotone,
      title: 'Babás Verificadas',
      description:
        'Visualize claramente babás com CPF validado e validação completa, trazendo mais segurança e confiança no processo de escolha.',
    },
    {
      icon: PiStarDuotone,
      title: 'Avaliações Confiáveis',
      description:
        'Acesse avaliações feitas por outras famílias para tomar decisões mais seguras, com base em experiências reais e histórico de atendimento.',
    },
    {
      icon: PiChatCircleDotsDuotone,
      title: 'Chat Integrado',
      description:
        'Converse diretamente com a babá pelo chat do app, sem intermediários. Comunicação segura, rápida e organizada em um só lugar.',
    },
    {
      icon: PiMagnifyingGlassDuotone,
      title: 'Busca Inteligente',
      description:
        'Busque babás por localização, experiência e disponibilidade, usando filtros que ajudam a encontrar o perfil mais adequado para sua família.',
    },
    {
      icon: PiMegaphoneDuotone,
      title: 'Vagas em Destaque',
      description:
        'Crie vagas e aumente sua visibilidade para as babás, recebendo mais candidaturas qualificadas com recursos de destaque e boost.',
    },
  ];

  return (
    <section className="bg-fuchsia-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <p className="mt-2 font-mono text-4xl font-bold tracking-tight text-pretty text-fuchsia-600 sm:text-5xl lg:text-balance">
            Sua rotina já é corrida demais para escolhas difíceis
          </p>
          <p className="mt-6 text-lg/8 text-gray-700">
            A Cuidly ajuda você a decidir com mais confiança e menos tempo
            perdido.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col">
                <dt className="text-base/7 font-semibold text-gray-900">
                  <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-linear-to-br from-fuchsia-400 to-fuchsia-500">
                    <feature.icon
                      aria-hidden="true"
                      className="size-7 text-blue-50"
                    />
                  </div>
                  {feature.title}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
