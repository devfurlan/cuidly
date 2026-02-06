import { PiBriefcase, PiShieldCheck, PiStar, PiUsers } from 'react-icons/pi';

export default function Stats() {
  const stats = [
    {
      icon: PiUsers,
      value: '123',
      label: 'Babás Verificadas',
    },
    {
      icon: PiBriefcase,
      value: '345',
      label: 'Vagas Criadas',
    },
    {
      icon: PiStar,
      value: '534',
      label: 'Avaliações Reais',
    },
    {
      icon: PiShieldCheck,
      value: '123',
      label: 'Verificação Completa',
    },
  ];

  return (
    <section className="border-y border-gray-100 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-100">
                  <Icon className="h-6 w-6 text-fuchsia-600" />
                </div>
                <p className="text-xl font-bold text-gray-900">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
