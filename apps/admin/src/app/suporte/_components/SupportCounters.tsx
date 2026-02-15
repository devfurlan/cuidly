'use client';

import CardNumberSoft from '@/components/CardNumberSoft';

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  positive: number;
  negative: number;
}

export default function SupportCounters({ stats }: { stats: Stats }) {
  const totalRated = stats.positive + stats.negative;
  const satisfactionRate =
    totalRated > 0 ? Math.round((stats.positive / totalRated) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
      <CardNumberSoft
        title="Total"
        value={stats.total}
        color="blue"
        iconName="megaphone"
        supportValue={`${stats.open + stats.inProgress} pendentes`}
      />
      <CardNumberSoft
        title="Abertos"
        value={stats.open}
        color="amber"
        iconName="clock"
        supportValue="Aguardando resposta"
      />
      <CardNumberSoft
        title="Em Andamento"
        value={stats.inProgress}
        color="blue"
        iconName="trend-up"
        supportValue="Em atendimento"
      />
      <CardNumberSoft
        title="Resolvidos"
        value={stats.resolved}
        color="green"
        iconName="check-circle"
        supportValue={`${stats.closed} encerrados`}
      />
      <CardNumberSoft
        title="Satisfação"
        value={totalRated > 0 ? `${satisfactionRate}%` : '—'}
        color="emerald"
        iconName="star"
        supportValue={
          totalRated > 0
            ? `${stats.positive} 👍 · ${stats.negative} 👎`
            : 'Sem avaliações'
        }
      />
    </div>
  );
}
