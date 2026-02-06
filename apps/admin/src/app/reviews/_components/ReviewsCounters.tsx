'use client';

import CardNumberSoft from '@/components/CardNumberSoft';

interface ReviewStats {
  total: number;
  pending: number;
  published: number;
  hidden: number;
  averages: {
    overall: number;
  };
  recentCount: number;
}

interface ReviewsCountersProps {
  stats: ReviewStats;
}

export default function ReviewsCounters({ stats }: ReviewsCountersProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      <CardNumberSoft
        title="Total de Avaliações"
        value={stats.total}
        color="blue"
        iconName="star"
        supportValue={
          stats.averages.overall > 0
            ? `Média geral: ${stats.averages.overall.toFixed(1)} estrelas`
            : undefined
        }
      />
      <CardNumberSoft
        title="Aguardando Publicação"
        value={stats.pending}
        color="amber"
        iconName="clock"
        supportValue={
          stats.recentCount > 0 ? `${stats.recentCount} nos últimos 7 dias` : undefined
        }
      />
      <CardNumberSoft
        title="Publicadas"
        value={stats.published}
        color="green"
        iconName="check-circle"
      />
      <CardNumberSoft
        title="Ocultas"
        value={stats.hidden}
        color="red"
        iconName="eye-slash"
      />
    </div>
  );
}
