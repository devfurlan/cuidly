'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import PageContent from '@/components/layout/PageContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from './_components/DateRangePicker';
import { ConversionFunnel } from './_components/ConversionFunnel';
import { RetentionChart } from './_components/RetentionChart';
import { FeatureUsageChart } from './_components/FeatureUsageChart';
import { MonetizationChart } from './_components/MonetizationChart';

export default function AnalyticsPage() {
  // Período padrão: últimos 30 dias
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  return (
    <PageContent
      title="Analytics"
      actions={
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      }
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="retention">Retenção</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="monetization">Monetização</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <ConversionFunnel dateRange={dateRange} />
            <RetentionChart />
          </div>
          <FeatureUsageChart dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="retention">
          <RetentionChart />
        </TabsContent>

        <TabsContent value="engagement">
          <FeatureUsageChart dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="monetization">
          <MonetizationChart />
        </TabsContent>
      </Tabs>
    </PageContent>
  );
}
