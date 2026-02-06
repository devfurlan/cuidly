/**
 * Nanny Recommended Jobs Section
 * Displays recommended jobs based on match score (server component with async data fetching)
 */

import { getRecommendedJobs } from '@/lib/data/dashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import {
  PiArrowRight,
  PiBriefcase,
  PiMapPin,
  PiStar,
  PiStarFill,
} from 'react-icons/pi';
import Link from 'next/link';

interface NannyRecommendedJobsProps {
  nannyId: number;
}

const jobTypeLabels: Record<string, string> = {
  FIXED: 'Fixa',
  SUBSTITUTE: 'Substituta',
  OCCASIONAL: 'Eventual',
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-700';
  if (score >= 60) return 'text-yellow-700';
  if (score >= 40) return 'text-orange-700';
  return 'text-red-700';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  if (score >= 40) return 'bg-orange-100';
  return 'bg-red-100';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export async function NannyRecommendedJobs({
  nannyId,
}: NannyRecommendedJobsProps) {
  const jobs = await getRecommendedJobs(nannyId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Vagas Recomendadas</CardTitle>
            <CardDescription>Melhores oportunidades para você</CardDescription>
          </div>
          <Link href="/app/vagas">
            <Button variant="ghost" size="sm">
              Ver todas
              <PiArrowRight className="ml-1 size-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/app/vagas/${job.id}`}
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex size-12 items-center justify-center rounded-lg bg-fuchsia-100">
                  <PiBriefcase className="size-6 text-fuchsia-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {jobTypeLabels[job.jobType] || job.jobType}
                    </span>
                    <span>
                      {formatCurrency(job.budgetMin)} -{' '}
                      {formatCurrency(job.budgetMax)}
                    </span>
                    {job.city && job.state && (
                      <span className="flex items-center gap-1">
                        <PiMapPin className="size-3" />
                        {job.city}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getScoreBgColor(job.matchScore)} ${getScoreColor(job.matchScore)}`}>
                    <PiStarFill className="size-3" />
                    {job.matchScore.toFixed(0)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <PiStar className="mx-auto size-12 text-gray-300" />
            <p className="mt-2 text-gray-500">
              Nenhuma vaga compatível encontrada
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Complete seu perfil para ver recomendações
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
