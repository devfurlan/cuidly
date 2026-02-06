/**
 * Nanny Summary Cards
 * Displays application statistics (server component with async data fetching)
 */

import { getNannySummary } from '@/lib/data/dashboard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { PiArrowRight, PiCheckCircle, PiClock, PiStar } from 'react-icons/pi';
import Link from 'next/link';

interface NannySummaryCardsProps {
  nannyId: number;
}

export async function NannySummaryCards({ nannyId }: NannySummaryCardsProps) {
  const summary = await getNannySummary(nannyId);

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Candidaturas Enviadas
          </CardTitle>
          <div className="rounded-lg bg-blue-100 p-2">
            <PiArrowRight className="size-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {summary.totalApplications}
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-amber-600">
              <PiClock className="size-3" />
              {summary.pendingApplications} pendentes
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Candidaturas Aceitas
          </CardTitle>
          <div className="rounded-lg bg-green-100 p-2">
            <PiCheckCircle className="size-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {summary.acceptedApplications}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Famílias interessadas em você
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Vagas Compatíveis
          </CardTitle>
          <div className="rounded-lg bg-fuchsia-100 p-2">
            <PiStar className="size-5 text-fuchsia-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {summary.compatibleJobs}
          </div>
          <Link
            href="/app/vagas"
            className="mt-2 inline-flex items-center text-sm text-fuchsia-600 hover:text-fuchsia-700"
          >
            Ver vagas
            <PiArrowRight className="ml-1 size-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
