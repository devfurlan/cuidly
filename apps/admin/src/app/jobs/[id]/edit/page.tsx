import PageContent from '@/components/layout/PageContent';
import { requirePermission } from '@/lib/auth/checkPermission';
import { JobForm } from '../../_components/JobForm';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

async function getJob(id: number) {
  const job = await prisma.job.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  return job;
}

export const metadata = {
  title: 'Editar Vaga',
  description: 'Edite uma vaga existente.',
};

export default async function EditJobPage({ params }: EditJobPageProps) {
  await requirePermission('JOBS');

  const { id } = await params;
  const job = await getJob(parseInt(id));

  if (!job) {
    notFound();
  }

  return (
    <PageContent title={`Editar Vaga: ${job.title}`}>
      <JobForm
        mode="edit"
        jobId={job.id}
        defaultValues={{
          title: job.title,
          description: job.description,
          status: job.status,
        }}
      />
    </PageContent>
  );
}
