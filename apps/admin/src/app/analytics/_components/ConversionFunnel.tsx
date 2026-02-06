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
import { cn } from '@/lib/shadcn/utils';

interface FunnelStep {
  name: string;
  value: number;
  percentage: number;
}

interface ConversionRates {
  cadastroToEmail: number;
  emailToOnboarding: number;
  onboardingToSubscription: number;
  overallConversion: number;
}

interface FunnelResponse {
  funnel: FunnelStep[];
  conversionRates: ConversionRates;
  period: {
    startDate: string;
    endDate: string;
  };
  userType: string;
}

interface ConversionFunnelProps {
  dateRange: DateRange | undefined;
}

export function ConversionFunnel({ dateRange }: ConversionFunnelProps) {
  const [data, setData] = useState<FunnelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'all' | 'FAMILY' | 'NANNY'>('all');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.set('startDate', dateRange.from.toISOString());
        if (dateRange?.to) params.set('endDate', dateRange.to.toISOString());
        params.set('userType', userType);

        const response = await fetch(`/api/admin/analytics/conversion-funnel?${params}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching conversion funnel data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateRange, userType]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Jornada do usuário do cadastro até a assinatura</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Jornada do usuário do cadastro até a assinatura</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Erro ao carregar dados do funil
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.funnel.map((s) => s.value), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Jornada do usuário do cadastro até a assinatura</CardDescription>
        </div>
        <Select value={userType} onValueChange={(v) => setUserType(v as 'all' | 'FAMILY' | 'NANNY')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="FAMILY">Famílias</SelectItem>
            <SelectItem value="NANNY">Babás</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.funnel.map((step, index) => {
            const width = Math.max((step.value / maxValue) * 100, 5);
            const isLast = index === data.funnel.length - 1;

            return (
              <div key={step.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{step.name}</span>
                  <span className="text-muted-foreground">
                    {step.value.toLocaleString()} ({step.percentage}%)
                  </span>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2',
                      isLast ? 'bg-green-500' : 'bg-blue-500'
                    )}
                    style={{ width: `${width}%` }}
                  >
                    {width > 20 && (
                      <span className="text-white text-xs font-medium">
                        {step.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {index < data.funnel.length - 1 && (
                  <div className="flex justify-center text-xs text-muted-foreground">
                    <span>
                      {index === 0 && `${data.conversionRates.cadastroToEmail}% verificaram e-mail`}
                      {index === 1 && `${data.conversionRates.emailToOnboarding}% completaram onboarding`}
                      {index === 2 && `${data.conversionRates.onboardingToSubscription}% assinaram`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {data.conversionRates.overallConversion}%
              </p>
              <p className="text-sm text-muted-foreground">Conversão Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data.funnel[data.funnel.length - 1]?.value || 0}
              </p>
              <p className="text-sm text-muted-foreground">Assinantes no Período</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
