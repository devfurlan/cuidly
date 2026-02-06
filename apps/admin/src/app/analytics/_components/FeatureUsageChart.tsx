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
import { DateRange } from 'react-day-picker';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ArrowUp, ArrowDown, Minus } from '@phosphor-icons/react';
import { cn } from '@/lib/shadcn/utils';

interface FeatureTotal {
  name: string;
  total: number;
  change: number;
}

interface FeatureUsageData {
  date: string;
  jobsPublished: number;
  applicationsSubmitted: number;
  conversationsStarted: number;
  profilesFavorited: number;
  contactsInitiated: number;
}

interface FeatureUsageResponse {
  totals: FeatureTotal[];
  timeline: FeatureUsageData[];
  period: {
    startDate: string;
    endDate: string;
  };
  granularity: string;
}

interface FeatureUsageChartProps {
  dateRange: DateRange | undefined;
}

const chartConfig: ChartConfig = {
  jobsPublished: {
    label: 'Vagas',
    color: '#3b82f6',
  },
  applicationsSubmitted: {
    label: 'Candidaturas',
    color: '#10b981',
  },
  conversationsStarted: {
    label: 'Conversas',
    color: '#f59e0b',
  },
  profilesFavorited: {
    label: 'Favoritos',
    color: '#ec4899',
  },
  contactsInitiated: {
    label: 'Contatos',
    color: '#8b5cf6',
  },
};

export function FeatureUsageChart({ dateRange }: FeatureUsageChartProps) {
  const [data, setData] = useState<FeatureUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.set('startDate', dateRange.from.toISOString());
        if (dateRange?.to) params.set('endDate', dateRange.to.toISOString());
        params.set('granularity', granularity);

        const response = await fetch(`/api/admin/analytics/feature-usage?${params}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching feature usage data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateRange, granularity]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uso de Funcionalidades</CardTitle>
          <CardDescription>Engajamento com as principais features da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uso de Funcionalidades</CardTitle>
          <CardDescription>Engajamento com as principais features da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Erro ao carregar dados de uso
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Uso de Funcionalidades</CardTitle>
          <CardDescription>Engajamento com as principais features da plataforma</CardDescription>
        </div>
        <Select value={granularity} onValueChange={(v) => setGranularity(v as 'daily' | 'weekly' | 'monthly')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Diario</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {/* Cards de totais */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {data.totals.map((item) => (
            <div key={item.name} className="p-3 rounded-lg bg-gray-50">
              <p className="text-xs text-muted-foreground truncate">{item.name}</p>
              <p className="text-xl font-bold">{item.total.toLocaleString()}</p>
              <div className={cn(
                'flex items-center text-xs',
                item.change > 0 ? 'text-green-600' : item.change < 0 ? 'text-red-600' : 'text-gray-500'
              )}>
                {item.change > 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : item.change < 0 ? (
                  <ArrowDown className="h-3 w-3 mr-1" />
                ) : (
                  <Minus className="h-3 w-3 mr-1" />
                )}
                {Math.abs(item.change)}%
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico de linhas */}
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={data.timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="jobsPublished"
              stroke="#3b82f6"
              name="Vagas"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="applicationsSubmitted"
              stroke="#10b981"
              name="Candidaturas"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="conversationsStarted"
              stroke="#f59e0b"
              name="Conversas"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="profilesFavorited"
              stroke="#ec4899"
              name="Favoritos"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="contactsInitiated"
              stroke="#8b5cf6"
              name="Contatos"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
