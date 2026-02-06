/**
 * Family Jobs Section
 * Displays active jobs (server component with async data fetching)
 */

import { getFamilyRecentJobs } from '@/lib/data/dashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { PiArrowRight, PiBriefcase, PiUsers } from 'react-icons/pi';
import Link from 'next/link';
import { CreateJobButton } from './QuickActions.client';

interface FamilyJobsSectionProps {
  familyId: number;
}

const jobTypeLabels: Record<string, string> = {
  FIXED: 'Fixa',
  SUBSTITUTE: 'Substituta',
  OCCASIONAL: 'Eventual',
};

export async function FamilyJobsSection({ familyId }: FamilyJobsSectionProps) {
  const jobs = await getFamilyRecentJobs(familyId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Vagas Ativas</CardTitle>
            <CardDescription>Suas vagas publicadas recentemente</CardDescription>
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
                <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100">
                  <PiBriefcase className="size-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {jobTypeLabels[job.jobType] || job.jobType}
                    </span>
                    <span className="flex items-center gap-1">
                      <PiUsers className="size-4" />
                      {job.applicationsCount} candidatura
                      {job.applicationsCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <PiArrowRight className="size-5 text-gray-400" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <PiBriefcase className="mx-auto size-12 text-gray-300" />
            <p className="mt-2 text-gray-500">
              Você ainda não tem vagas ativas
            </p>
            <div className="mt-4">
              <CreateJobButton className="bg-blue-600 hover:bg-blue-700" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
