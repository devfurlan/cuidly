import PageContent from '@/components/layout/PageContent';
import { requirePermission } from '@/lib/auth/checkPermission';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { VALIDATION_LEVEL_LABELS } from '../schema';
import ValidationActions from '../_components/ValidationActions';
import { CheckCircleIcon, XCircleIcon, WarningIcon } from '@phosphor-icons/react/dist/ssr';

interface ValidationDetailsPageProps {
  params: Promise<{ id: string }>;
}

async function getValidationWithDetails(id: string) {
  const validation = await prisma.validationRequest.findUnique({
    where: { id },
    include: {
      nanny: {
        select: {
          id: true,
          name: true,
          slug: true,
          photoUrl: true,
          emailAddress: true,
          phoneNumber: true,
          birthDate: true,
          documentValidated: true,
          documentExpirationDate: true,
          documentValidationDate: true,
          documentValidationMessage: true,
          criminalBackgroundValidated: true,
          criminalBackgroundValidationDate: true,
          criminalBackgroundValidationMessage: true,
          personalDataValidated: true,
          personalDataValidatedAt: true,
          personalDataValidatedBy: true,
          documentUploads: {
            select: {
              id: true,
              type: true,
              url: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  return validation;
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; variant: 'yellow' | 'blue' | 'teal' | 'red' }> = {
    PENDING: { label: 'Pendente', variant: 'yellow' },
    PROCESSING: { label: 'Processando', variant: 'blue' },
    COMPLETED: { label: 'Concluida', variant: 'teal' },
    FAILED: { label: 'Falhou', variant: 'red' },
  };

  const config = statusConfig[status] || { label: status, variant: 'yellow' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function getScoreBadge(score: number | null, threshold: number = 80) {
  if (score === null) return <span className="text-muted-foreground">-</span>;

  const isGood = score >= threshold;
  const isWarning = score >= threshold - 20 && score < threshold;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-bold ${isGood ? 'text-green-600' : isWarning ? 'text-yellow-600' : 'text-red-600'}`}>
        {score.toFixed(1)}%
      </span>
      {isGood ? (
        <CheckCircleIcon className="h-5 w-5 text-green-600" weight="fill" />
      ) : isWarning ? (
        <WarningIcon className="h-5 w-5 text-yellow-600" weight="fill" />
      ) : (
        <XCircleIcon className="h-5 w-5 text-red-600" weight="fill" />
      )}
    </div>
  );
}

export const metadata = {
  title: 'Revisão de Validação',
  description: 'Revise e tome uma decisão sobre a validação.',
};

export default async function ValidationDetailsPage({
  params,
}: ValidationDetailsPageProps) {
  await requirePermission('VALIDATIONS');

  const { id } = await params;
  const validation = await getValidationWithDetails(id);

  if (!validation) {
    notFound();
  }

  const documentFront = validation.nanny.documentUploads.find((d) => d.type === 'DOCUMENT_FRONT');
  const documentBack = validation.nanny.documentUploads.find((d) => d.type === 'DOCUMENT_BACK');
  const selfie = validation.nanny.documentUploads.find((d) => d.type === 'SELFIE');

  return (
    <PageContent title={`Validação: ${validation.nanny.name}`}>
      <div className="space-y-6">
        {/* Status e Acoes */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Validação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusBadge(validation.status)}
                <Badge variant={validation.level === 'PREMIUM' ? 'blue' : 'muted'}>
                  {VALIDATION_LEVEL_LABELS[validation.level]}
                </Badge>
              </div>
              <ValidationActions
                validationId={validation.id}
                nannyName={validation.nanny.name}
                status={validation.status}
              />
            </div>
          </CardContent>
        </Card>

        {/* Comparacao Visual - Documento vs Selfie */}
        <Card>
          <CardHeader>
            <CardTitle>Comparacao Visual</CardTitle>
            <CardDescription>
              Compare a foto do documento com a selfie da baba
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Documento (Frente)</h4>
                {documentFront ? (
                  <img
                    src={documentFront.url}
                    alt="Documento - Frente"
                    className="w-full rounded-lg border object-contain max-h-80"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg border bg-muted">
                    <span className="text-muted-foreground">Não enviado</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Selfie</h4>
                {selfie ? (
                  <img
                    src={selfie.url}
                    alt="Selfie"
                    className="w-full rounded-lg border object-contain max-h-80"
                  />
                ) : validation.nanny.photoUrl ? (
                  <img
                    src={validation.nanny.photoUrl}
                    alt="Foto do perfil"
                    className="w-full rounded-lg border object-contain max-h-80"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg border bg-muted">
                    <span className="text-muted-foreground">Não enviado</span>
                  </div>
                )}
              </div>
            </div>

            {documentBack && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Documento (Verso)</h4>
                <img
                  src={documentBack.url}
                  alt="Documento - Verso"
                  className="w-full max-w-md rounded-lg border object-contain max-h-60"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scores da API */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Verificacao</CardTitle>
            <CardDescription>
              Scores retornados pelas APIs de validação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Facematch Score
                </dt>
                <dd className="mt-1">{getScoreBadge(validation.facematchScore, 80)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Liveness Score
                </dt>
                <dd className="mt-1">{getScoreBadge(validation.livenessScore, 70)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  BigID Valido
                </dt>
                <dd className="mt-1 flex items-center gap-2">
                  {validation.bigidValid ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-600" weight="fill" />
                      <span className="font-medium text-green-600">Sim</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-5 w-5 text-red-600" weight="fill" />
                      <span className="font-medium text-red-600">Nao</span>
                    </>
                  )}
                </dd>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Nome</dt>
                <dd>{validation.name}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Data de Nascimento
                </dt>
                <dd>{formatDate(validation.birthDate)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">CPF</dt>
                <dd className="font-mono">***.***.***-**</dd>
              </div>

              {validation.rg && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">RG</dt>
                  <dd>
                    {validation.rg}
                    {validation.rgIssuingState && ` (${validation.rgIssuingState})`}
                  </dd>
                </div>
              )}

              {validation.motherName && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Nome da Mae
                  </dt>
                  <dd>{validation.motherName}</dd>
                </div>
              )}

              {validation.fatherName && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Nome do Pai
                  </dt>
                  <dd>{validation.fatherName}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Status de Validacoes do Perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Perfil da Baba</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h4 className="font-medium">Documento Validado</h4>
                  {validation.nanny.documentValidationMessage && (
                    <p className="text-sm text-muted-foreground">
                      {validation.nanny.documentValidationMessage}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {validation.nanny.documentValidated ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-600" weight="fill" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(validation.nanny.documentValidationDate)}
                      </span>
                    </>
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600" weight="fill" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h4 className="font-medium">Antecedentes Criminais</h4>
                  {validation.nanny.criminalBackgroundValidationMessage && (
                    <p className="text-sm text-muted-foreground">
                      {validation.nanny.criminalBackgroundValidationMessage}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {validation.nanny.criminalBackgroundValidated ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-600" weight="fill" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(validation.nanny.criminalBackgroundValidationDate)}
                      </span>
                    </>
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600" weight="fill" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Dados Pessoais Validados</h4>
                </div>
                <div className="flex items-center gap-2">
                  {validation.nanny.personalDataValidated ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-600" weight="fill" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(validation.nanny.personalDataValidatedAt)}
                      </span>
                    </>
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600" weight="fill" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados das APIs (JSON) */}
        {(validation.bigidResult || validation.basicDataResult || validation.civilRecordResult || validation.federalRecordResult) && (
          <Card>
            <CardHeader>
              <CardTitle>Dados Brutos das APIs</CardTitle>
              <CardDescription>
                Dados completos retornados pelas APIs de validação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {validation.bigidResult && (
                <div>
                  <h4 className="text-sm font-medium mb-2">BigID Result</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-48">
                    {JSON.stringify(validation.bigidResult, null, 2)}
                  </pre>
                </div>
              )}

              {validation.basicDataResult && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Basic Data Result</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-48">
                    {JSON.stringify(validation.basicDataResult, null, 2)}
                  </pre>
                </div>
              )}

              {validation.civilRecordResult && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Civil Record Result</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-48">
                    {JSON.stringify(validation.civilRecordResult, null, 2)}
                  </pre>
                </div>
              )}

              {validation.federalRecordResult && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Federal Record Result</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-48">
                    {JSON.stringify(validation.federalRecordResult, null, 2)}
                  </pre>
                </div>
              )}

              {validation.reportUrl && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Relatorio</h4>
                  <a
                    href={validation.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Ver relatório completo
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Link para perfil da babá */}
        <Card>
          <CardContent className="pt-6">
            <Link
              href={`/nannies/${validation.nanny.slug}`}
              className="text-primary hover:underline"
            >
              Ver perfil completo da babá
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
