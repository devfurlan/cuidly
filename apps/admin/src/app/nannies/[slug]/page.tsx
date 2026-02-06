import NannyIdentificationCard from '@/app/nannies/_components/NannyIdentificationCard';
import BadgeStatus from '@/components/BadgeStatus';
import { CardDetail } from '@/components/CardDetail';
import PageContent from '@/components/layout/PageContent';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import {
  ACCEPTED_ACTIVITIES_OPTIONS,
  ACCEPTS_HOLIDAY_WORK_OPTIONS,
  ACTIVITIES_NOT_ACCEPTED_OPTIONS,
  AGE_RANGES_EXPERIENCE_OPTIONS,
  ATTENDANCE_MODES,
  AVAILABILITY_SCHEDULES,
  CERTIFICATIONS_OPTIONS,
  COMFORT_WITH_PETS_OPTIONS,
  HOURLY_RATE_RANGE_OPTIONS,
  LANGUAGES_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  MAX_TRAVEL_DISTANCE_OPTIONS,
  PARENT_PRESENCE_PREFERENCE_OPTIONS,
  SERVICE_TYPES,
  SKILLS,
  STRENGTHS_OPTIONS,
} from '@/constants/nannyOptions';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { calculateAge } from '@/utils/calculateAge';
import { formatCpf } from '@/utils/formatCpf';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber';
import { getExperienceYearsLabel } from '@/utils/getExperienceYearsLabel';
import getOnlyNumbers from '@/utils/getOnlyNumbers';
import { maskAlphanumeric } from '@/utils/maskAlphanumeric';
import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr';
import { formatDate } from 'date-fns';
import Link from 'next/link';
import { getNannyWithInfosBySlug } from '../../../services/nannyService';

export default async function NannyViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const nanny = await getNannyWithInfosBySlug(slug);

  if (!nanny) {
    return null;
  }

  let gender = 'Não informado';
  if (nanny.gender !== null) {
    switch (nanny.gender) {
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

  let pixType = 'Não informado';
  if (nanny.pixType !== null) {
    switch (nanny.pixType) {
      case 'CNPJ':
        pixType = 'CNPJ';
        break;
      case 'CPF':
        pixType = 'CPF';
        break;
      case 'EMAIL':
        pixType = 'E-mail';
        break;
      case 'PHONE':
        pixType = 'Celular';
        break;
      case 'EVP':
        pixType = 'Aleatória';
        break;
    }
  }

  // Generate city slug for public profile URL
  const citySlug = nanny.address?.city
    ? nanny.address.city
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
    : 'cidade';

  return (
    <PageContent>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <NannyIdentificationCard nanny={nanny as any} />

          <CardDetail title="Analytics do Perfil Publico">
            <CardDetail.List title="Visualizacoes">
              {nanny.viewsCount}
            </CardDetail.List>
            <CardDetail.List title="Compartilhamentos">
              {nanny.sharesCount}
            </CardDetail.List>
            <CardDetail.List title="Favoritos">
              {nanny.favoritesCount}
            </CardDetail.List>
            <Button className="w-full" asChild>
              <a
                href={`https://www.cuidly.com/baba/${citySlug}/${nanny.slug}`}
                target="_blank"
                className="mb-6"
              >
                Ver perfil publico <ArrowSquareOutIcon />
              </a>
            </Button>
          </CardDetail>

          <CardDetail
            title="Dados bancários"
            action={
              <Link
                href={`/nannies/${nanny.slug}/edit?tab=bank-data`}
                className="text-sm hover:underline"
              >
                Editar
              </Link>
            }
          >
            <CardDetail.List title="Chave PIX">
              {nanny.pixKey ? nanny.pixKey : 'Não informado'}
            </CardDetail.List>
            <CardDetail.List title="Tipo da chave">{pixType}</CardDetail.List>

            {nanny.hourlyRate && (
              <CardDetail.List title="Valor Hora">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(nanny.hourlyRate))}
              </CardDetail.List>
            )}

            {nanny.hourlyRateReference && (
              <CardDetail.List title="Valor Hora (Referência)">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(nanny.hourlyRateReference))}
              </CardDetail.List>
            )}
          </CardDetail>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <CardDetail
            title="Dados pessoais"
            action={
              <Link
                href={`/nannies/${nanny.slug}/edit`}
                className="text-sm hover:underline"
              >
                Editar
              </Link>
            }
          >
            <CardDetail.List title="Nome completo">
              {nanny.name}
            </CardDetail.List>
            <CardDetail.List title="Telefone">
              <a
                href={`https://wa.me/55${getOnlyNumbers(nanny.phoneNumber)}`}
                target="_blank"
                className="hover:underline"
              >
                {formatPhoneNumber(nanny.phoneNumber)}
              </a>
            </CardDetail.List>
            <CardDetail.List title="Status">
              <BadgeStatus status={nanny.status} />
            </CardDetail.List>
            {nanny.birthDate && (
              <CardDetail.List title="Data de nascimento">
                {formatDate(new Date(nanny.birthDate), 'dd/MM/yyyy')}{' '}
                <small className="ml-1 text-gray-500">
                  {calculateAge(new Date(nanny.birthDate))} anos
                </small>
              </CardDetail.List>
            )}
            <CardDetail.List title="Sexo">{gender}</CardDetail.List>
            {nanny.cpf && (
              <CardDetail.List title="CPF">
                {formatCpf(nanny.cpf as string)}
              </CardDetail.List>
            )}
            <CardDetail.List title="E-mail">
              {nanny.emailAddress ? nanny.emailAddress : 'Não informado'}
            </CardDetail.List>
            <CardDetail.List title="É fumante?">
              {nanny.isSmoker ? 'Sim' : 'Não'}
            </CardDetail.List>
            {nanny.maritalStatus && (
              <CardDetail.List title="Estado Civil">
                {MARITAL_STATUS_OPTIONS.find(
                  (opt) => opt.value === nanny.maritalStatus,
                )?.label || nanny.maritalStatus}
              </CardDetail.List>
            )}
            <CardDetail.List title="Tem filhos?">
              {nanny.hasChildren ? 'Sim' : 'Nao'}
            </CardDetail.List>
            <CardDetail.List title="Tem CNH?">
              {nanny.hasCnh ? 'Sim' : 'Nao'}
            </CardDetail.List>
            <CardDetail.List title="Tem veículo?">
              {nanny.hasVehicle ? 'Sim' : 'Nao'}
            </CardDetail.List>
            {nanny.address && (
              <CardDetail.List title="Endereço">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    {nanny.address.streetName}
                    {nanny.address.number && `, ${nanny.address.number}`} -{' '}
                    {nanny.address.neighborhood}, {nanny.address.city}/
                    {nanny.address.state} | CEP:{' '}
                    {maskAlphanumeric(
                      nanny.address.zipCode as string,
                      '#####-###',
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/nannies/${nanny.slug}/edit?tab=address`}
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
            title="Informações Profissionais"
            action={
              <Link
                href={`/nannies/${nanny.slug}/edit?tab=professional-data`}
                className="text-sm hover:underline"
              >
                Editar
              </Link>
            }
          >
            {nanny.experienceYears !== null && (
              <CardDetail.List title="Anos de Experiencia">
                {getExperienceYearsLabel(nanny.experienceYears)}
              </CardDetail.List>
            )}

            {(nanny.minChildAge !== null || nanny.maxChildAge !== null) && (
              <CardDetail.List title="Faixa Etaria de Criancas">
                {nanny.minChildAge !== null ? nanny.minChildAge : '0'} a{' '}
                {nanny.maxChildAge !== null ? nanny.maxChildAge : '18'} anos
              </CardDetail.List>
            )}

            {nanny.specialtiesJson &&
              (nanny.specialtiesJson as string[]).length > 0 && (
                <CardDetail.List title="Especialidades">
                  <div className="flex flex-wrap gap-2">
                    {(nanny.specialtiesJson as string[]).map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardDetail.List>
              )}

            {nanny.availabilityJson &&
              (nanny.availabilityJson as string[]).length > 0 && (
                <CardDetail.List title="Disponibilidade de Horarios">
                  <div className="flex flex-wrap gap-2">
                    {(nanny.availabilityJson as string[]).map((schedule) => {
                      const scheduleOption = AVAILABILITY_SCHEDULES.find(
                        (s) => s.value === schedule,
                      );
                      return (
                        <Badge key={schedule} variant="secondary">
                          {scheduleOption?.label || schedule}
                        </Badge>
                      );
                    })}
                  </div>
                </CardDetail.List>
              )}

            {nanny.serviceTypesJson &&
              (nanny.serviceTypesJson as string[]).length > 0 && (
                <CardDetail.List title="Tipos de Servico">
                  <div className="flex flex-wrap gap-2">
                    {(nanny.serviceTypesJson as string[]).map((serviceType) => {
                      const serviceOption = SERVICE_TYPES.find(
                        (s) => s.value === serviceType,
                      );
                      return (
                        <Badge key={serviceType} variant="secondary">
                          {serviceOption?.label || serviceType}
                        </Badge>
                      );
                    })}
                  </div>
                </CardDetail.List>
              )}

            {nanny.attendanceModesJson &&
              (nanny.attendanceModesJson as string[]).length > 0 && (
                <CardDetail.List title="Modalidades de Atendimento">
                  <div className="flex flex-wrap gap-2">
                    {(nanny.attendanceModesJson as string[]).map((mode) => {
                      const modeOption = ATTENDANCE_MODES.find(
                        (m) => m.value === mode,
                      );
                      return (
                        <Badge key={mode} variant="secondary">
                          {modeOption?.label || mode}
                        </Badge>
                      );
                    })}
                  </div>
                </CardDetail.List>
              )}

            {nanny.skillsJson && (nanny.skillsJson as string[]).length > 0 && (
              <CardDetail.List title="Habilidades">
                <div className="flex flex-wrap gap-2">
                  {(nanny.skillsJson as string[]).map((skill) => {
                    const skillOption = SKILLS.find((s) => s.value === skill);
                    return (
                      <Badge key={skill} variant="secondary">
                        {skillOption?.label || skill}
                      </Badge>
                    );
                  })}
                </div>
              </CardDetail.List>
            )}

            {nanny.acceptsHolidayWork && (
              <CardDetail.List title="Aceita trabalhar em feriados?">
                {ACCEPTS_HOLIDAY_WORK_OPTIONS.find(
                  (opt) => opt.value === nanny.acceptsHolidayWork,
                )?.label || nanny.acceptsHolidayWork}
              </CardDetail.List>
            )}

            {nanny.nannyTypes && (nanny.nannyTypes as string[]).length > 0 && (
              <CardDetail.List title="Tipo de Babá">
                <div className="flex flex-wrap gap-2">
                  {(nanny.nannyTypes as string[]).map((type) => (
                    <Badge key={type} variant="secondary">
                      {type === 'FOLGUISTA'
                        ? 'Folguista'
                        : type === 'DIARISTA'
                          ? 'Diarista'
                          : type === 'MENSALISTA'
                            ? 'Mensalista'
                            : type}
                    </Badge>
                  ))}
                </div>
              </CardDetail.List>
            )}

            {nanny.contractRegimes &&
              (nanny.contractRegimes as string[]).length > 0 && (
                <CardDetail.List title="Regime de Contratação">
                  <div className="flex flex-wrap gap-2">
                    {(nanny.contractRegimes as string[]).map((regime) => (
                      <Badge key={regime} variant="secondary">
                        {regime === 'AUTONOMA'
                          ? 'Autônoma'
                          : regime === 'PJ'
                            ? 'PJ'
                            : regime === 'CLT'
                              ? 'CLT'
                              : regime}
                      </Badge>
                    ))}
                  </div>
                </CardDetail.List>
              )}

            {nanny.maxTravelDistance && (
              <CardDetail.List title="Raio de Deslocamento">
                {MAX_TRAVEL_DISTANCE_OPTIONS.find(
                  (opt) => opt.value === nanny.maxTravelDistance,
                )?.label || nanny.maxTravelDistance}
              </CardDetail.List>
            )}

            {nanny.ageRangesExperience &&
              (nanny.ageRangesExperience as string[]).length > 0 && (
                <CardDetail.List title="Faixa Etária de Experiência">
                  <div className="flex flex-wrap gap-2">
                    {(nanny.ageRangesExperience as string[]).map((age) => {
                      const ageOption = AGE_RANGES_EXPERIENCE_OPTIONS.find(
                        (a) => a.value === age,
                      );
                      return (
                        <Badge key={age} variant="secondary">
                          {ageOption?.label || age}
                        </Badge>
                      );
                    })}
                  </div>
                </CardDetail.List>
              )}

            {nanny.maxChildrenCare && (
              <CardDetail.List title="Máximo de Crianças">
                {nanny.maxChildrenCare}
              </CardDetail.List>
            )}

            <CardDetail.List title="Experiência com Necessidades Especiais?">
              {nanny.hasSpecialNeedsExperience ? 'Sim' : 'Não'}
            </CardDetail.List>

            {nanny.specialNeedsExperienceDescription && (
              <CardDetail.List title="Descrição da Experiência com Necessidades Especiais">
                {nanny.specialNeedsExperienceDescription}
              </CardDetail.List>
            )}

            {nanny.certifications &&
              (nanny.certifications as string[]).length > 0 && (
                <CardDetail.List title="Certificações">
                  <div className="flex flex-wrap gap-2">
                    {(nanny.certifications as string[]).map((cert) => {
                      const certOption = CERTIFICATIONS_OPTIONS.find(
                        (c) => c.value === cert,
                      );
                      return (
                        <Badge key={cert} variant="secondary">
                          {certOption?.label || cert}
                        </Badge>
                      );
                    })}
                  </div>
                </CardDetail.List>
              )}

            {nanny.languages && (nanny.languages as string[]).length > 0 && (
              <CardDetail.List title="Idiomas">
                <div className="flex flex-wrap gap-2">
                  {(nanny.languages as string[]).map((lang) => {
                    const langOption = LANGUAGES_OPTIONS.find(
                      (l) => l.value === lang,
                    );
                    return (
                      <Badge key={lang} variant="secondary">
                        {langOption?.label || lang}
                      </Badge>
                    );
                  })}
                </div>
              </CardDetail.List>
            )}

            {nanny.strengths && (nanny.strengths as string[]).length > 0 && (
              <CardDetail.List title="Pontos Fortes">
                <div className="flex flex-wrap gap-2">
                  {(nanny.strengths as string[]).map((strength) => {
                    const strengthOption = STRENGTHS_OPTIONS.find(
                      (s) => s.value === strength,
                    );
                    return (
                      <Badge key={strength} variant="secondary">
                        {strengthOption?.label || strength}
                      </Badge>
                    );
                  })}
                </div>
              </CardDetail.List>
            )}

            {nanny.comfortableWithPets && (
              <CardDetail.List title="Confortável com Animais?">
                {COMFORT_WITH_PETS_OPTIONS.find(
                  (opt) => opt.value === nanny.comfortableWithPets,
                )?.label || nanny.comfortableWithPets}
              </CardDetail.List>
            )}

            {nanny.petsDescription && (
              <CardDetail.List title="Descrição sobre Animais">
                {nanny.petsDescription}
              </CardDetail.List>
            )}

            {nanny.acceptedActivities &&
              (nanny.acceptedActivities as string[]).length > 0 && (
                <CardDetail.List title="Atividades Aceitas">
                  <div className="flex flex-wrap gap-2">
                    {(nanny.acceptedActivities as string[]).map((activity) => {
                      const activityOption = ACCEPTED_ACTIVITIES_OPTIONS.find(
                        (a) => a.value === activity,
                      );
                      return (
                        <Badge key={activity} variant="secondary">
                          {activityOption?.label || activity}
                        </Badge>
                      );
                    })}
                  </div>
                </CardDetail.List>
              )}

            {nanny.activitiesNotAccepted &&
              (nanny.activitiesNotAccepted as string[]).length > 0 && (
                <CardDetail.List title="Atividades NÃO Aceitas">
                  <div className="flex flex-wrap gap-2">
                    {(nanny.activitiesNotAccepted as string[]).map(
                      (activity) => {
                        const activityOption =
                          ACTIVITIES_NOT_ACCEPTED_OPTIONS.find(
                            (a) => a.value === activity,
                          );
                        return (
                          <Badge key={activity} variant="secondary">
                            {activityOption?.label || activity}
                          </Badge>
                        );
                      },
                    )}
                  </div>
                </CardDetail.List>
              )}

            {nanny.parentPresencePreference && (
              <CardDetail.List title="Preferência de Presença dos Pais">
                {PARENT_PRESENCE_PREFERENCE_OPTIONS.find(
                  (opt) => opt.value === nanny.parentPresencePreference,
                )?.label || nanny.parentPresencePreference}
              </CardDetail.List>
            )}

            {nanny.hourlyRateRange && (
              <CardDetail.List title="Faixa de Valor por Hora">
                {HOURLY_RATE_RANGE_OPTIONS.find(
                  (opt) => opt.value === nanny.hourlyRateRange,
                )?.label || nanny.hourlyRateRange}
              </CardDetail.List>
            )}
          </CardDetail>

          {nanny.aboutMe && (
            <CardDetail
              title="Sobre Mim"
              action={
                <Link
                  href={`/nannies/${nanny.slug}/edit?tab=professional-data`}
                  className="text-sm hover:underline"
                >
                  Editar
                </Link>
              }
            >
              <CardDetail.List title="Sobre Mim">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(nanny.aboutMe),
                  }}
                />
              </CardDetail.List>
            </CardDetail>
          )}

          {(nanny.motherName || nanny.birthCity || nanny.birthState) && (
            <CardDetail
              title="Informações Adicionais"
              action={
                <Link
                  href={`/nannies/${nanny.slug}/edit?tab=personal-data`}
                  className="text-sm hover:underline"
                >
                  Editar
                </Link>
              }
            >
              {nanny.motherName && (
                <CardDetail.List title="Nome da mãe">
                  {nanny.motherName}
                </CardDetail.List>
              )}

              {(nanny.birthCity || nanny.birthState) && (
                <CardDetail.List title="Cidade de Nascimento">
                  {[nanny.birthCity, nanny.birthState]
                    .filter(Boolean)
                    .join(' / ')}
                </CardDetail.List>
              )}
            </CardDetail>
          )}
        </div>
      </div>
    </PageContent>
  );
}
