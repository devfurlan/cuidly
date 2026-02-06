/**
 * Nanny Analytics Section
 * Displays profile analytics (server component with async data fetching)
 */

import { getNannyAnalytics } from '@/lib/data/dashboard';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { PiChartBar, PiCursorClick, PiEye } from 'react-icons/pi';

interface NannyAnalyticsSectionProps {
  nannyId: number;
}

export async function NannyAnalyticsSection({
  nannyId,
}: NannyAnalyticsSectionProps) {
  const analytics = await getNannyAnalytics(nannyId);

  if (!analytics) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Seu Perfil nos Últimos 30 dias
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-indigo-100 p-3">
              <PiEye className="size-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Visualizações</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalViews.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-green-100 p-3">
              <PiCursorClick className="size-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cliques em Contratar</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalHireClicks.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-fuchsia-100 p-3">
              <PiChartBar className="size-6 text-fuchsia-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.conversionRate}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
