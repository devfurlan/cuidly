/**
 * Nanny Applications Section
 * Displays recent job applications (server component with async data fetching)
 */

import { getNannyRecentApplications } from '@/lib/data/dashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { PiBriefcase, PiClock, PiMapPin } from 'react-icons/pi';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExploreJobsButton } from './QuickActions.client';

interface NannyApplicationsSectionProps {
  nannyId: number;
}

const jobTypeLabels: Record<string, string> = {
  FIXED: 'Fixa',
  SUBSTITUTE: 'Substituta',
  OCCASIONAL: 'Eventual',
};

const applicationStatusLabels: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: 'Pendente',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  ACCEPTED: {
    label: 'Aceita',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  REJECTED: {
    label: 'Rejeitada',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  WITHDRAWN: {
    label: 'Retirada',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
};

export async function NannyApplicationsSection({
  nannyId,
}: NannyApplicationsSectionProps) {
  const applications = await getNannyRecentApplications(nannyId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Minhas Candidaturas</CardTitle>
            <CardDescription>
              Status das suas candidaturas recentes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => {
              const status = applicationStatusLabels[app.status] || {
                label: app.status,
                color: 'text-gray-700',
                bgColor: 'bg-gray-100',
              };
              return (
                <Link
                  key={app.id}
                  href={`/app/vagas/${app.job.id}`}
                  className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100">
                    <PiBriefcase className="size-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {app.job.title}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {jobTypeLabels[app.job.jobType] || app.job.jobType}
                      </span>
                      {app.job.city && app.job.state && (
                        <span className="flex items-center gap-1">
                          <PiMapPin className="size-3" />
                          {app.job.city}, {app.job.state}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${status.bgColor} ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <p className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-400">
                      <PiClock className="size-3" />
                      {formatDistanceToNow(new Date(app.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <PiBriefcase className="mx-auto size-12 text-gray-300" />
            <p className="mt-2 text-gray-500">
              Você ainda não enviou candidaturas
            </p>
            <ExploreJobsButton />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
