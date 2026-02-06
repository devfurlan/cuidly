import { DataTable } from '@/components/DataTable/DataTable';
import PageContent from '@/components/layout/PageContent';
import { columns } from './columns';
import { Job } from './schema';
import { requirePermission } from '@/lib/auth/checkPermission';
import prisma from '@/lib/prisma';

async function fetchJobs(): Promise<Job[]> {
  const jobs = await prisma.job.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      family: {
        select: { id: true, name: true },
      },
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return jobs.map((job) => ({
    ...job,
    budgetMin: Number(job.budgetMin),
    budgetMax: Number(job.budgetMax),
    startDate: new Date(job.startDate),
    createdAt: new Date(job.createdAt),
    updatedAt: job.updatedAt ? new Date(job.updatedAt) : null,
  }));
}

export const metadata = {
  title: 'Gerenciamento de Vagas',
  description: 'Gerencie as vagas da plataforma.',
};

export default async function JobsPage() {
  await requirePermission('JOBS');

  const jobsData = await fetchJobs();

  return (
    <PageContent title="Gerenciamento de Vagas">
      <DataTable data={jobsData} columns={columns} />
    </PageContent>
  );
}
