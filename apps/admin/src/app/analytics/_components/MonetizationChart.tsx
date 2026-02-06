'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { TrendUp, CurrencyCircleDollar, Users, Percent } from '@phosphor-icons/react';
import { cn } from '@/lib/shadcn/utils';

interface MonthlyRevenue {
  month: string;
  revenue: number;
  subscriptions: number;
  churnRate: number;
}

interface PlanDistribution {
  plan: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface Metrics {
  mrr: number;
  lifetimeRevenue: number;
  arpu: number;
  payingCustomers: number;
  avgChurnRate: number;
}

interface MonetizationResponse {
  metrics: Metrics;
  monthlyData: MonthlyRevenue[];
  planDistribution: PlanDistribution[];
}

const chartConfig: ChartConfig = {
  revenue: {
    label: 'Receita',
    color: '#10b981',
  },
  subscriptions: {
    label: 'Assinaturas',
    color: '#3b82f6',
  },
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1'];

export function MonetizationChart() {
  const [data, setData] = useState<MonetizationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/analytics/monetization?months=6');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching monetization data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monetizacao</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Erro ao carregar dados de monetizacao
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de metricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CurrencyCircleDollar className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">MRR</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(data.metrics.mrr)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">Receita Total</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(data.metrics.lifetimeRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-muted-foreground">ARPU</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(data.metrics.arpu)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-muted-foreground">Clientes Pagantes</span>
            </div>
            <p className="text-2xl font-bold mt-2">{data.metrics.payingCustomers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-red-600" />
              <span className="text-sm text-muted-foreground">Churn Medio</span>
            </div>
            <p className="text-2xl font-bold mt-2">{data.metrics.avgChurnRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Gráfico de evolução de receita */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Receita</CardTitle>
            <CardDescription>Receita mensal dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      valueFormatter={(value) => formatCurrency(value as number)}
                    />
                  }
                />
                <Bar dataKey="revenue" fill="#10b981" name="Receita" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Distribuicao por plano */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuicao por Plano</CardTitle>
            <CardDescription>Assinaturas ativas por tipo de plano</CardDescription>
          </CardHeader>
          <CardContent>
            {data.planDistribution.length > 0 ? (
              <div className="flex items-center">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.planDistribution.map(d => ({ ...d }))}
                        dataKey="count"
                        nameKey="plan"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                      >
                        {data.planDistribution.map((entry, index) => (
                          <Cell key={entry.plan} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                  {data.planDistribution.map((item, index) => (
                    <div key={item.plan} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm flex-1 truncate">{item.plan}</span>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma assinatura ativa
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de metricas mensais */}
      <Card>
        <CardHeader>
          <CardTitle>Metricas Mensais</CardTitle>
          <CardDescription>Detalhamento por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Mes</th>
                  <th className="text-right p-2 font-medium">Receita</th>
                  <th className="text-right p-2 font-medium">Assinaturas</th>
                  <th className="text-right p-2 font-medium">Churn</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyData.map((item) => (
                  <tr key={item.month} className="border-b">
                    <td className="p-2 font-medium">{item.month}</td>
                    <td className="p-2 text-right">{formatCurrency(item.revenue)}</td>
                    <td className="p-2 text-right">{item.subscriptions}</td>
                    <td className={cn(
                      'p-2 text-right',
                      item.churnRate > 10 ? 'text-red-600' : item.churnRate > 5 ? 'text-yellow-600' : 'text-green-600'
                    )}>
                      {item.churnRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
