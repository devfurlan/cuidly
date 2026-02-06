import BadgeStatus from '@/components/BadgeStatus';
import { CardDetail } from '@/components/CardDetail';
import PageContent from '@/components/layout/PageContent';
import { Button } from '@/components/ui/button';
import { calculateAge } from '@/utils/calculateAge';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber';
import getOnlyNumbers from '@/utils/getOnlyNumbers';
import { maskAlphanumeric } from '@/utils/maskAlphanumeric';
import { BabyIcon, UsersIcon } from '@phosphor-icons/react/dist/ssr';
import { formatDate } from 'date-fns';
import Link from 'next/link';
import { getFamilyById } from '../../../services/familyService';

export default async function FamilyViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const family = await getFamilyById(Number(id));

  if (!family) {
    return null;
  }

  return (
    <PageContent>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="shadow-base bg-card text-card-foreground rounded-lg border p-6">
            <BadgeStatus status={family.status} className="mb-4" />
            <div className="flex flex-col items-center space-y-4">
              <div className="flex size-20 items-center justify-center rounded-full bg-fuchsia-200">
                <UsersIcon className="size-10 text-fuchsia-600" />
              </div>
              <div className="text-center">
                <h5 className="text-xl font-semibold">{family.name}</h5>
                <div className="text-muted-foreground text-sm">
                  {family.children?.length || 0}{' '}
                  {family.children?.length === 1 ? 'criança' : 'crianças'}
                </div>
              </div>
            </div>
          </div>

          {family.subscription && (
            <CardDetail title="Assinatura">
              <CardDetail.List title="Plano">
                {family.subscription.plan || 'Não informado'}
              </CardDetail.List>
              <CardDetail.List title="Status">
                <BadgeStatus status={family.subscription.status} />
              </CardDetail.List>
            </CardDetail>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <CardDetail
            title="Dados da familia"
            action={
              <Link
                href={`/families/${id}/edit`}
                className="text-sm hover:underline"
              >
                Editar
              </Link>
            }
          >
            <CardDetail.List title="Nome">{family.name}</CardDetail.List>
            <CardDetail.List title="Telefone">
              {family.phoneNumber ? (
                <a
                  href={`https://wa.me/55${getOnlyNumbers(family.phoneNumber)}`}
                  target="_blank"
                  className="hover:underline"
                >
                  {formatPhoneNumber(family.phoneNumber)}
                </a>
              ) : (
                'Não informado'
              )}
            </CardDetail.List>
            <CardDetail.List title="E-mail">
              {family.emailAddress || 'Não informado'}
            </CardDetail.List>
            <CardDetail.List title="Status">
              <BadgeStatus status={family.status} />
            </CardDetail.List>
            {family.address && (
              <CardDetail.List title="Endereço">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    {family.address.streetName}
                    {family.address.number &&
                      `, ${family.address.number}`} -{' '}
                    {family.address.neighborhood}, {family.address.city}/
                    {family.address.state}
                    {family.address.zipCode && (
                      <>
                        {' '}
                        | CEP:{' '}
                        {maskAlphanumeric(family.address.zipCode, '#####-###')}
                      </>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/families/${id}/edit?tab=address`}
                      className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                    >
                      Editar endereço
                    </Link>
                  </div>
                </div>
              </CardDetail.List>
            )}
          </CardDetail>

          <CardDetail
            title="Criancas"
            action={
              <Link
                href={`/families/${id}/edit?tab=children`}
                className="text-sm hover:underline"
              >
                Gerenciar
              </Link>
            }
          >
            {family.children && family.children.length > 0 ? (
              <div className="space-y-4">
                {family.children.map((child: any) => (
                  <div
                    key={child.id}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
                      <BabyIcon className="size-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{child.name}</h4>
                        <Link
                          href={`/children/${child.id}/edit`}
                          className="text-sm text-gray-500 hover:underline"
                        >
                          Editar
                        </Link>
                      </div>
                      {child.birthDate && (
                        <p className="text-sm text-gray-500">
                          {calculateAge(new Date(child.birthDate))} anos
                          <span className="ml-2 text-gray-400">
                            (
                            {formatDate(
                              new Date(child.birthDate),
                              'dd/MM/yyyy',
                            )}
                            )
                          </span>
                        </p>
                      )}
                      {child.gender && (
                        <p className="text-sm text-gray-500">
                          {child.gender === 'MALE'
                            ? 'Masculino'
                            : child.gender === 'FEMALE'
                              ? 'Feminino'
                              : 'Outro'}
                        </p>
                      )}
                      {child.allergies && (
                        <p className="mt-2 text-sm">
                          <strong>Alergias:</strong> {child.allergies}
                        </p>
                      )}
                      {child.specialNeeds && (
                        <p className="text-sm">
                          <strong>Necessidades especiais:</strong>{' '}
                          {child.specialNeeds}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <BabyIcon className="size-10 text-gray-300" />
                <p className="text-center text-gray-500">
                  Nenhuma criança cadastrada para esta família.
                </p>
                <Button variant="secondary" asChild>
                  <Link href={`/families/${id}/edit?tab=children`}>
                    Adicionar criança
                  </Link>
                </Button>
              </div>
            )}
          </CardDetail>

          {family.favorites && family.favorites.length > 0 && (
            <CardDetail title="Babás Favoritas">
              <div className="space-y-2">
                {family.favorites.map((nanny: any) => (
                  <div
                    key={nanny.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span>{nanny.name}</span>
                    <Link
                      href={`/nannies/${nanny.slug}`}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      Ver perfil
                    </Link>
                  </div>
                ))}
              </div>
            </CardDetail>
          )}
        </div>
      </div>
    </PageContent>
  );
}
