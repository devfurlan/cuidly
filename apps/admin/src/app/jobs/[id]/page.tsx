import PageContent from '@/components/layout/PageContent';
import { requirePermission } from '@/lib/auth/checkPermission';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import {
  JOB_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
  PAYMENT_TYPE_LABELS,
  REQUIRES_OVERNIGHT_LABELS,
} from '../schema';
import { JobApplicationStatus } from '@prisma/client';

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

async function getJobWithDetails(id: number) {
  const job = await prisma.job.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      family: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          emailAddress: true,
          address: {
            select: {
              city: true,
              state: true,
              neighborhood: true,
            },
          },
        },
      },
      applications: {
        include: {
          nanny: {
            select: {
              id: true,
              name: true,
              slug: true,
              photoUrl: true,
              phoneNumber: true,
              emailAddress: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!job) return null;

  const applicationStats = {
    total: job.applications.length,
    pending: job.applications.filter((a) => a.status === 'PENDING').length,
    accepted: job.applications.filter((a) => a.status === 'ACCEPTED').length,
    rejected: job.applications.filter((a) => a.status === 'REJECTED').length,
    withdrawn: job.applications.filter((a) => a.status === 'WITHDRAWN').length,
  };

  return {
    job,
    applicationStats,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; variant: 'teal' | 'yellow' | 'muted' }> = {
    ACTIVE: { label: 'Ativa', variant: 'teal' },
    PAUSED: { label: 'Pausada', variant: 'yellow' },
    CLOSED: { label: 'Encerrada', variant: 'muted' },
  };

  const config = statusConfig[status] || { label: status, variant: 'muted' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function getApplicationStatusBadge(status: JobApplicationStatus) {
  const statusConfig: Record<JobApplicationStatus, { label: string; variant: 'yellow' | 'teal' | 'red' | 'muted' }> = {
    PENDING: { label: 'Pendente', variant: 'yellow' },
    ACCEPTED: { label: 'Aceita', variant: 'teal' },
    REJECTED: { label: 'Rejeitada', variant: 'red' },
    WITHDRAWN: { label: 'Desistiu', variant: 'muted' },
  };

  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export const metadata = {
  title: 'Detalhes da Vaga',
  description: 'Veja os detalhes da vaga e suas candidaturas.',
};

export default async function JobDetailsPage({
  params,
}: JobDetailsPageProps) {
  await requirePermission('JOBS');

  const { id } = await params;
  const data = await getJobWithDetails(parseInt(id));

  if (!data) {
    notFound();
  }

  const { job, applicationStats } = data;

  return (
    <PageContent
      title={job.title}
      actions={
        <Button asChild variant="outline">
          <Link href={`/jobs/${job.id}/edit`}>Editar</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Status e Resumo */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Status</CardDescription>
            </CardHeader>
            <CardContent>{getStatusBadge(job.status)}</CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Candidaturas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{applicationStats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pendentes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {applicationStats.pending}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Aceitas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {applicationStats.accepted}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rejeitadas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {applicationStats.rejected}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes da Vaga */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Vaga</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Título
                </dt>
                <dd className="text-lg font-semibold">{job.title}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Tipo de Vaga
                </dt>
                <dd>{JOB_TYPE_LABELS[job.jobType]}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Tipo de Contrato
                </dt>
                <dd>{CONTRACT_TYPE_LABELS[job.contractType]}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Tipo de Pagamento
                </dt>
                <dd>{PAYMENT_TYPE_LABELS[job.paymentType]}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Orcamento
                </dt>
                <dd>
                  {formatCurrency(Number(job.budgetMin))} - {formatCurrency(Number(job.budgetMax))}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Data de Inicio
                </dt>
                <dd>{formatDate(job.startDate)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Pernoite
                </dt>
                <dd>{REQUIRES_OVERNIGHT_LABELS[job.requiresOvernight]}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Aceita Multiplos Empregos
                </dt>
                <dd>{job.allowsMultipleJobs ? 'Sim' : 'Nao'}</dd>
              </div>

              {job.benefits.length > 0 && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Beneficios
                  </dt>
                  <dd className="flex flex-wrap gap-1 mt-1">
                    {job.benefits.map((benefit) => (
                      <Badge key={benefit} variant="blue">
                        {benefit}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}

              {job.mandatoryRequirements.length > 0 && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Requisitos Obrigatórios
                  </dt>
                  <dd className="flex flex-wrap gap-1 mt-1">
                    {job.mandatoryRequirements.map((req) => (
                      <Badge key={req} variant="muted">
                        {req}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}

              {job.description && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Descrição
                  </dt>
                  <dd className="whitespace-pre-wrap">{job.description}</dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Criada em
                </dt>
                <dd>{formatDateTime(job.createdAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Dados da Família */}
        <Card>
          <CardHeader>
            <CardTitle>Família</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Nome
                </dt>
                <dd className="font-semibold">
                  <Link
                    href={`/families/${job.family.id}`}
                    className="text-primary hover:underline"
                  >
                    {job.family.name}
                  </Link>
                </dd>
              </div>


              {job.family.phoneNumber && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Telefone
                  </dt>
                  <dd>{job.family.phoneNumber}</dd>
                </div>
              )}

              {job.family.emailAddress && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Email
                  </dt>
                  <dd>{job.family.emailAddress}</dd>
                </div>
              )}

              {job.family.address && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Localizacao
                  </dt>
                  <dd>
                    {[
                      job.family.address.neighborhood,
                      job.family.address.city,
                      job.family.address.state,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Lista de Candidaturas */}
        <Card>
          <CardHeader>
            <CardTitle>Candidaturas</CardTitle>
            <CardDescription>
              {job.applications.length} candidaturas para esta vaga
            </CardDescription>
          </CardHeader>
          <CardContent>
            {job.applications.length === 0 ? (
              <p className="text-muted-foreground">
                Esta vaga ainda não recebeu candidaturas.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Babá</th>
                      <th className="py-2 text-left font-medium">Contato</th>
                      <th className="py-2 text-left font-medium">Match Score</th>
                      <th className="py-2 text-left font-medium">Status</th>
                      <th className="py-2 text-left font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.applications.map((application) => (
                      <tr key={application.id} className="border-b">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            {application.nanny.photoUrl && (
                              <img
                                src={application.nanny.photoUrl}
                                alt={application.nanny.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <Link
                                href={`/nannies/${application.nanny.slug}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {application.nanny.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="text-xs">
                            {application.nanny.phoneNumber && (
                              <div>{application.nanny.phoneNumber}</div>
                            )}
                            {application.nanny.emailAddress && (
                              <div className="text-muted-foreground">
                                {application.nanny.emailAddress}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          {application.matchScore
                            ? `${Number(application.matchScore).toFixed(0)}%`
                            : '-'}
                        </td>
                        <td className="py-3">
                          {getApplicationStatusBadge(application.status)}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {formatDateTime(application.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
