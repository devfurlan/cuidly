'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PiBaby,
  PiBriefcase,
  PiCheck,
  PiClock,
  PiDog,
  PiHeart,
  PiHouse,
  PiImages,
  PiListChecks,
  PiMagnifyingGlass,
  PiShieldCheck,
  PiUser,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import {
  getCarePriorityLabel,
  getSpecialNeedsLabel,
  formatAge,
} from '@/helpers/label-getters';

import { JobHeader } from './JobHeader';
import { MatchScoreCard } from './MatchScoreCard';
import { ApplySection } from './ApplySection';
import { ApplicationsList } from './ApplicationsList';
import { RecommendedNannies } from './RecommendedNannies';
import {
  type Job,
  type Application,
  type MatchResult,
  type ApplicationStats,
  JOB_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
  PAYMENT_TYPE_LABELS,
  SHIFT_LABELS,
  DAY_LABELS,
  HOUSING_TYPE_LABELS,
  PARENT_PRESENCE_LABELS,
  PET_TYPE_LABELS,
  DOMESTIC_HELP_LABELS,
  CHILD_GENDER_LABELS,
  HOUSE_RULES_LABELS,
  REQUIREMENT_LABELS,
  BENEFIT_LABELS,
  DAYS_ORDER,
  SHIFTS_ORDER,
  formatCurrency,
  formatDate,
  calculateAge,
} from './types';

interface JobDetailContentProps {
  job: Job;
  jobId: string;
  isOwner: boolean;
  hasActiveSubscription: boolean;
  applications: Application[];
  stats: ApplicationStats | null;
  myApplication: Application | null;
  matchResult: MatchResult | null;
}

export function JobDetailContent({
  job,
  jobId,
  isOwner,
  hasActiveSubscription,
  applications: initialApplications,
  stats: initialStats,
  myApplication: initialMyApplication,
  matchResult: initialMatchResult,
}: JobDetailContentProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [myApplication, setMyApplication] = useState(initialMyApplication);
  const [matchResult, setMatchResult] = useState(initialMatchResult);

  function handleApplicationSuccess(
    application: Application,
    newMatchResult: MatchResult | null
  ) {
    setMyApplication(application);
    if (newMatchResult) {
      setMatchResult(newMatchResult);
    }
  }

  return (
    <>
      <JobHeader job={job} isOwner={isOwner} jobId={jobId} />

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <PiWarningCircle className="size-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Sobre a Familia - apenas para babas */}
          {!isOwner && job.family.familyPresentation && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <PiHeart className="size-5 text-fuchsia-500" />
                <h2 className="text-lg font-semibold">Sobre a Família</h2>
              </div>
              <p className="whitespace-pre-wrap text-gray-700">
                {job.family.familyPresentation}
              </p>
            </Card>
          )}

          {/* Galeria de Fotos da Vaga */}
          {job.photos && job.photos.length > 0 && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <PiImages className="size-5 text-fuchsia-500" />
                <h2 className="text-lg font-semibold">Fotos</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {job.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Foto ${idx + 1}`}
                    className="aspect-square rounded-lg object-cover"
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Job Details */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <PiBriefcase className="size-5 text-fuchsia-500" />
              <h2 className="text-lg font-semibold">Detalhes da Vaga</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-sm text-gray-500">Tipo de trabalho</span>
                <p className="font-medium">{JOB_TYPE_LABELS[job.jobType] || job.jobType}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Tipo de contratação</span>
                <p className="font-medium">
                  {CONTRACT_TYPE_LABELS[job.contractType] || job.contractType}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Remuneração</span>
                <p className="font-medium">
                  {formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}
                  <span className="text-gray-500">
                    {PAYMENT_TYPE_LABELS[job.paymentType] || ''}
                  </span>
                </p>
              </div>
            </div>

            {job.description && (
              <div className="mt-4 border-t pt-4">
                <span className="text-sm text-gray-500">Descrição</span>
                <div className="relative mt-1">
                  <p
                    className={`whitespace-pre-wrap text-gray-700 ${
                      !isDescriptionExpanded ? 'line-clamp-3' : ''
                    }`}
                  >
                    {job.description}
                  </p>
                  {job.description.length > 150 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-1 text-sm font-medium text-fuchsia-600 hover:text-fuchsia-700"
                    >
                      {isDescriptionExpanded ? 'Ver menos' : 'Ver mais'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Turnos */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <PiClock className="size-5 text-fuchsia-500" />
              <h2 className="text-lg font-semibold">Turnos</h2>
            </div>

            {job.family.neededDays &&
            job.family.neededDays.length > 0 &&
            job.family.neededShifts &&
            job.family.neededShifts.length > 0 ? (
              <div className="w-full">
                {/* Header row - Days */}
                <div className="mb-2 grid grid-cols-[40px_repeat(7,1fr)] gap-0.5 sm:grid-cols-[60px_repeat(7,1fr)] sm:gap-1">
                  <div />
                  {DAYS_ORDER.map((day) => (
                    <div
                      key={day}
                      className="rounded-md bg-gray-100 py-1 text-center text-[9px] font-medium text-gray-600 sm:py-1.5 sm:text-xs"
                    >
                      {DAY_LABELS[day]}
                    </div>
                  ))}
                </div>

                {/* Shift rows */}
                <div className="space-y-0.5 sm:space-y-1">
                  {SHIFTS_ORDER.map((shift) => (
                    <div
                      key={shift}
                      className="grid grid-cols-[40px_repeat(7,1fr)] gap-0.5 sm:grid-cols-[60px_repeat(7,1fr)] sm:gap-1"
                    >
                      <div className="flex items-center justify-center rounded-md bg-gray-100 py-1.5 text-[9px] font-medium text-gray-600 sm:py-2 sm:text-xs">
                        {SHIFT_LABELS[shift]}
                      </div>

                      {DAYS_ORDER.map((day) => {
                        const isSelected =
                          job.family.neededDays.includes(day) &&
                          job.family.neededShifts.includes(shift);
                        return (
                          <div
                            key={`${day}_${shift}`}
                            className={`flex h-7 items-center justify-center rounded-md border sm:h-9 ${
                              isSelected
                                ? 'border-fuchsia-500 bg-fuchsia-500 text-white'
                                : 'border-gray-200 bg-gray-50 text-gray-300'
                            }`}
                          >
                            {isSelected ? (
                              <PiCheck className="size-3 sm:size-4" />
                            ) : (
                              <PiX className="size-3 sm:size-4" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Turnos não definidos</p>
            )}
          </Card>

          {/* Children */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <PiBaby className="size-5 text-fuchsia-500" />
              <h2 className="text-lg font-semibold">Crianças</h2>
            </div>

            <div className="space-y-4">
              {job.children.map((child) => (
                <div key={child.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {child.name || `Criança ${child.id}`}
                      </span>
                      {child.gender && (
                        <Badge variant="outline">
                          {CHILD_GENDER_LABELS[child.gender] || child.gender}
                        </Badge>
                      )}
                    </div>
                    {child.unborn ? (
                      <Badge variant="purple-outline">
                        Nascimento: {child.expectedBirthDate ? formatDate(child.expectedBirthDate) : 'A definir'}
                      </Badge>
                    ) : (
                      child.birthDate &&
                      calculateAge(child.birthDate) !== null && (
                        <span className="text-gray-600">
                          {formatAge(child.birthDate)}
                        </span>
                      )
                    )}
                  </div>

                  {child.carePriorities && child.carePriorities.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">
                        Prioridades de cuidado:
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {child.carePriorities.map((priority) => (
                          <Badge key={priority} variant="secondary">
                            {getCarePriorityLabel(priority)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {child.hasSpecialNeeds && (
                    <div className="mt-3 rounded-lg bg-purple-50 p-3">
                      <span className="text-sm font-medium text-purple-800">
                        Necessidades especiais:
                      </span>
                      {child.specialNeedsTypes &&
                        child.specialNeedsTypes.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {child.specialNeedsTypes.map((type) => (
                              <Badge key={type} variant="purple-outline">
                                {getSpecialNeedsLabel(type)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      {child.specialNeedsDescription && (
                        <p className="mt-2 text-sm text-purple-700">
                          {child.specialNeedsDescription}
                        </p>
                      )}
                    </div>
                  )}

                  {child.routine && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">Rotina:</span>
                      <p className="mt-1 text-sm text-gray-700">{child.routine}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Sobre o Ambiente */}
          {(job.family.housingType ||
            job.family.hasPets ||
            job.family.parentPresence ||
            (job.family.houseRules && job.family.houseRules.length > 0)) && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <PiHouse className="size-5 text-fuchsia-500" />
                <h2 className="text-lg font-semibold">Sobre o Ambiente</h2>
              </div>

              <div className="space-y-3">
                {job.family.housingType && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-gray-600">Tipo de moradia</span>
                    <span className="font-medium">
                      {HOUSING_TYPE_LABELS[job.family.housingType] ||
                        job.family.housingType}
                    </span>
                  </div>
                )}

                {job.family.hasPets && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Possui pets</span>
                      <div className="flex items-center gap-2">
                        <PiDog className="size-4 text-gray-500" />
                        <span className="font-medium">
                          {job.family.petTypes && job.family.petTypes.length > 0
                            ? job.family.petTypes
                                .map((pet) => PET_TYPE_LABELS[pet] || pet)
                                .join(', ')
                            : 'Sim'}
                        </span>
                      </div>
                    </div>
                    {job.family.petsDescription && (
                      <p className="mt-2 text-sm text-gray-700">
                        {job.family.petsDescription}
                      </p>
                    )}
                  </div>
                )}

                {job.family.parentPresence && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-gray-600">Presença dos pais</span>
                    <span className="font-medium">
                      {PARENT_PRESENCE_LABELS[job.family.parentPresence] ||
                        job.family.parentPresence}
                    </span>
                  </div>
                )}

                {job.family.houseRules && job.family.houseRules.length > 0 && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <span className="text-sm text-gray-500">Regras da casa</span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {job.family.houseRules.map((rule) => (
                        <Badge key={rule} variant="outline">
                          {HOUSE_RULES_LABELS[rule] || rule}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Atividades Esperadas */}
          {job.family.domesticHelpExpected &&
            job.family.domesticHelpExpected.length > 0 && (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <PiListChecks className="size-5 text-fuchsia-500" />
                  <h2 className="text-lg font-semibold">Atividades Esperadas</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.family.domesticHelpExpected.map((activity) => (
                    <Badge key={activity} variant="secondary">
                      {DOMESTIC_HELP_LABELS[activity] || activity}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

          {/* Requirements & Benefits */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <PiShieldCheck className="size-5 text-fuchsia-500" />
              <h2 className="text-lg font-semibold">
                {job.benefits.length > 0 ? 'Requisitos e Benefícios' : 'Requisitos'}
              </h2>
            </div>

            {job.mandatoryRequirements.length > 0 && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">
                  Requisitos obrigatórios
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.mandatoryRequirements.map((req) => (
                    <Badge key={req} variant="secondary">
                      {REQUIREMENT_LABELS[req] || req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {job.benefits.length > 0 && (
              <div>
                <span className="text-sm text-gray-500">
                  Benefícios oferecidos
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.benefits.map((benefit) => (
                    <Badge key={benefit} className="bg-green-100 text-green-700">
                      {BENEFIT_LABELS[benefit] || benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {job.mandatoryRequirements.length === 0 &&
              job.benefits.length === 0 && (
                <p className="text-gray-500">
                  Sem requisitos ou benefícios especificados
                </p>
              )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* For Family: Applications Summary */}
          {isOwner && initialStats && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <PiUser className="size-5 text-fuchsia-500" />
                <h2 className="text-lg font-semibold">Candidaturas</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {initialStats.total}
                  </p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {initialStats.pending}
                  </p>
                  <p className="text-sm text-gray-500">Pendentes</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {initialStats.accepted}
                  </p>
                  <p className="text-sm text-gray-500">Aceitas</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {initialStats.rejected}
                  </p>
                  <p className="text-sm text-gray-500">Recusadas</p>
                </div>
              </div>
            </Card>
          )}

          {/* CTA para Buscar Babas - usuarios Free */}
          {isOwner && !hasActiveSubscription && (
            <Card className="bg-gradient-to-br from-fuchsia-50 to-purple-50 p-6">
              <PiMagnifyingGlass className="mb-3 size-8 text-fuchsia-500" />
              <h3 className="font-semibold text-gray-900">Encontre sua Babá</h3>
              <p className="mb-4 mt-1 text-sm text-gray-600">
                Explore nosso catálogo de babás verificadas
              </p>
              <Button className="w-full" onClick={() => router.push('/app/babas')}>
                Buscar Babás
              </Button>
            </Card>
          )}

          {/* For Nanny: Match Result */}
          {!isOwner && matchResult && <MatchScoreCard matchResult={matchResult} />}

          {/* For Nanny: Apply or Application Status */}
          {!isOwner && (
            <ApplySection
              jobId={job.id}
              familyName={job.family.name}
              matchResult={matchResult}
              myApplication={myApplication}
              onApplicationSuccess={handleApplicationSuccess}
            />
          )}
        </div>
      </div>

      {/* Recommended Nannies Section (for Family) */}
      {isOwner && (
        <RecommendedNannies
          jobId={job.id}
          hasActiveSubscription={hasActiveSubscription}
        />
      )}

      {/* Applications List (for Family) */}
      {isOwner && (
        <ApplicationsList
          applications={initialApplications}
          jobId={job.id}
          hasActiveSubscription={hasActiveSubscription}
        />
      )}
    </>
  );
}
