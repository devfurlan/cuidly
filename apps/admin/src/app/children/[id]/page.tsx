import { CardDetail } from '@/components/CardDetail';
import PageContent from '@/components/layout/PageContent';
import BadgeStatus from '@/components/BadgeStatus';
import { calculateAge } from '@/utils/calculateAge';
import { BabyIcon, UsersIcon } from '@phosphor-icons/react/dist/ssr';
import { formatDate } from 'date-fns';
import Link from 'next/link';
import { getChildById } from '../../../services/childService';

export default async function ChildViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const child = await getChildById(Number(id));

  if (!child) {
    return null;
  }

  let gender = 'Não informado';
  if (child.gender !== null) {
    switch (child.gender) {
      case 'MALE':
        gender = 'Masculino';
        break;
      case 'FEMALE':
        gender = 'Feminino';
        break;
      default:
        gender = 'Outro';
    }
  }

  return (
    <PageContent>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="shadow-base rounded-lg border bg-card p-6 text-card-foreground">
            <BadgeStatus status={child.status} className="mb-4" />
            <div className="flex flex-col items-center space-y-4">
              <div className="flex size-20 items-center justify-center rounded-full bg-blue-100">
                <BabyIcon className="size-10 text-blue-600" />
              </div>
              <div className="text-center">
                <h5 className="text-xl font-semibold">{child.name}</h5>
                {child.birthDate && (
                  <div className="text-sm text-muted-foreground">
                    {calculateAge(new Date(child.birthDate))} anos
                  </div>
                )}
              </div>
            </div>
          </div>

          {child.families && child.families.length > 0 && (
            <CardDetail title="Família">
              {child.families.map((family: any) => (
                <div key={family.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="size-4 text-gray-500" />
                    <span>{family.name}</span>
                  </div>
                  <Link
                    href={`/families/${family.id}`}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Ver familia
                  </Link>
                </div>
              ))}
            </CardDetail>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <CardDetail
            title="Dados pessoais"
            action={
              <Link
                href={`/children/${id}/edit`}
                className="text-sm hover:underline"
              >
                Editar
              </Link>
            }
          >
            <CardDetail.List title="Nome">
              {child.name}
            </CardDetail.List>
            {child.birthDate && (
              <CardDetail.List title="Data de nascimento">
                {formatDate(new Date(child.birthDate), 'dd/MM/yyyy')}{' '}
                <small className="ml-1 text-gray-500">
                  ({calculateAge(new Date(child.birthDate))} anos)
                </small>
              </CardDetail.List>
            )}
            <CardDetail.List title="Sexo">{gender}</CardDetail.List>
            <CardDetail.List title="Status">
              <BadgeStatus status={child.status} />
            </CardDetail.List>
          </CardDetail>

          <CardDetail
            title="Saude e observacoes"
            action={
              <Link
                href={`/children/${id}/edit?tab=health-data`}
                className="text-sm hover:underline"
              >
                Editar
              </Link>
            }
          >
            <CardDetail.List title="Alergias">
              {child.allergies || 'Nenhuma alergia informada'}
            </CardDetail.List>
            <CardDetail.List title="Necessidades especiais">
              {child.specialNeeds || 'Nenhuma necessidade especial informada'}
            </CardDetail.List>
            <CardDetail.List title="Observacoes">
              {child.notes || 'Nenhuma observacao'}
            </CardDetail.List>
          </CardDetail>
        </div>
      </div>
    </PageContent>
  );
}
