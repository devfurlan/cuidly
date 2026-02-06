'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/shadcn/utils';

interface CohortData {
  cohort: string;
  cohortSize: number;
  retention: number[];
}

interface RetentionResponse {
  cohorts: CohortData[];
  periodLabels: string[];
  period: string;
}

export function RetentionChart() {
  const [data, setData] = useState<RetentionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/analytics/retention?period=${period}&cohorts=8`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching retention data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [period]);

  // Funcao para determinar a cor do heatmap baseado na porcentagem
  const getHeatmapColor = (value: number) => {
    if (value >= 80) return 'bg-green-600 text-white';
    if (value >= 60) return 'bg-green-500 text-white';
    if (value >= 40) return 'bg-green-400 text-white';
    if (value >= 20) return 'bg-green-300 text-gray-800';
    if (value > 0) return 'bg-green-200 text-gray-800';
    return 'bg-gray-100 text-gray-400';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analise de Coorte</CardTitle>
          <CardDescription>Retencao de usuarios ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.cohorts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analise de Coorte</CardTitle>
          <CardDescription>Retencao de usuarios ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum dado disponível para o período selecionado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Analise de Coorte</CardTitle>
          <CardDescription>Retencao de usuarios ao longo do tempo</CardDescription>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as 'weekly' | 'monthly')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2 font-medium">Coorte</th>
                <th className="text-center p-2 font-medium">Usuarios</th>
                {data.periodLabels.map((label) => (
                  <th key={label} className="text-center p-2 font-medium min-w-[60px]">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.cohorts.map((cohort) => (
                <tr key={cohort.cohort} className="border-t">
                  <td className="p-2 font-medium">{cohort.cohort}</td>
                  <td className="p-2 text-center text-muted-foreground">{cohort.cohortSize}</td>
                  {data.periodLabels.map((_, index) => {
                    const value = cohort.retention[index];
                    const hasValue = value !== undefined;
                    return (
                      <td key={index} className="p-1">
                        <div
                          className={cn(
                            'rounded p-2 text-center text-xs font-medium',
                            hasValue ? getHeatmapColor(value) : 'bg-gray-50'
                          )}
                        >
                          {hasValue ? `${value}%` : '-'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>Baixa</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-gray-100" />
            <div className="w-4 h-4 rounded bg-green-200" />
            <div className="w-4 h-4 rounded bg-green-300" />
            <div className="w-4 h-4 rounded bg-green-400" />
            <div className="w-4 h-4 rounded bg-green-500" />
            <div className="w-4 h-4 rounded bg-green-600" />
          </div>
          <span>Alta</span>
        </div>
      </CardContent>
    </Card>
  );
}
