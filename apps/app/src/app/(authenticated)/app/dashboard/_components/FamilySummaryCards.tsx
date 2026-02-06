/**
 * Family Summary Cards
 * Displays job and application statistics (server component with async data fetching)
 */

import { getFamilySummary } from '@/lib/data/dashboard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { PiArrowRight, PiBriefcase, PiHeart, PiUsers } from 'react-icons/pi';
import Link from 'next/link';

interface FamilySummaryCardsProps {
  familyId: number;
}

export async function FamilySummaryCards({ familyId }: FamilySummaryCardsProps) {
  const summary = await getFamilySummary(familyId);

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Vagas Ativas
          </CardTitle>
          <div className="rounded-lg bg-blue-100 p-2">
            <PiBriefcase className="size-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {summary.activeJobs}
          </div>
          <Link
            href="/app/vagas"
            className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            Ver todas
            <PiArrowRight className="ml-1 size-4" />
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Candidaturas Pendentes
          </CardTitle>
          <div className="rounded-lg bg-amber-100 p-2">
            <PiUsers className="size-5 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {summary.pendingApplications}
          </div>
          <p className="mt-2 text-sm text-gray-500">Aguardando sua análise</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Babás Favoritas
          </CardTitle>
          <div className="rounded-lg bg-fuchsia-100 p-2">
            <PiHeart className="size-5 text-fuchsia-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {summary.favorites}
          </div>
          <Link
            href="/app/favoritas"
            className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            Ver favoritas
            <PiArrowRight className="ml-1 size-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
