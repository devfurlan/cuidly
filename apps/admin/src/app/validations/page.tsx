import { DataTable } from '@/components/DataTable/DataTable';
import PageContent from '@/components/layout/PageContent';
import { columns } from './columns';
import { ValidationRequest } from './schema';
import { requirePermission } from '@/lib/auth/checkPermission';
import prisma from '@/lib/prisma';

async function fetchValidationRequests(): Promise<ValidationRequest[]> {
  const validationRequests = await prisma.validationRequest.findMany({
    include: {
      nanny: {
        select: {
          id: true,
          name: true,
          slug: true,
          photoUrl: true,
          emailAddress: true,
          phoneNumber: true,
          documentValidated: true,
          documentExpirationDate: true,
          criminalBackgroundValidated: true,
          personalDataValidated: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return validationRequests.map((vr) => ({
    ...vr,
    createdAt: new Date(vr.createdAt),
    updatedAt: vr.updatedAt ? new Date(vr.updatedAt) : null,
    completedAt: vr.completedAt ? new Date(vr.completedAt) : null,
    birthDate: vr.birthDate ? new Date(vr.birthDate) : null,
  }));
}

export const metadata = {
  title: 'Gerenciamento de Validações',
  description: 'Gerencie as solicitações de validação de perfil.',
};

export default async function ValidationsPage() {
  await requirePermission('VALIDATIONS');

  const validationsData = await fetchValidationRequests();

  return (
    <PageContent title="Gerenciamento de Validações">
      <DataTable data={validationsData} columns={columns} />
    </PageContent>
  );
}
