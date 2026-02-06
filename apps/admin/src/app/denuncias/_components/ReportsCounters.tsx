'use client';

import CardNumberSoft from '@/components/CardNumberSoft';

interface ReportStats {
  total: number;
  pending: number;
  reviewed: number;
  dismissed: number;
  byType: { nanny: number; job: number };
}

interface ReportsCountersProps {
  stats: ReportStats;
}

export default function ReportsCounters({ stats }: ReportsCountersProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      <CardNumberSoft
        title="Total"
        value={stats.total}
        color="blue"
        iconName="flag"
        supportValue={`${stats.byType.nanny} perfis, ${stats.byType.job} vagas`}
      />
      <CardNumberSoft
        title="Pendentes"
        value={stats.pending}
        color="amber"
        iconName="clock"
        supportValue="Aguardando análise"
      />
      <CardNumberSoft
        title="Revisadas"
        value={stats.reviewed}
        color="green"
        iconName="check-circle"
        supportValue="Ação tomada"
      />
      <CardNumberSoft
        title="Dispensadas"
        value={stats.dismissed}
        color="gray"
        iconName="x-circle"
        supportValue="Sem ação necessária"
      />
    </div>
  );
}
