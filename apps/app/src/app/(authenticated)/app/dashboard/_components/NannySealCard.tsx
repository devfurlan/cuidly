'use client';

/**
 * Nanny Seal Card
 * Displays the nanny's current seal and progress toward the next seal
 */

import { useState } from 'react';
import Link from 'next/link';
import { PiArrowRight, PiCheckCircle, PiCircle, PiTrophy } from 'react-icons/pi';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { SealBadge } from '@/components/seals/SealBadge';
import { NannyProUpsellModal } from '@/components/subscription/nanny-pro-upsell-modal';
import {
  calculateNannySeal,
  type NannySeal,
  type NannySealInput,
  type NannySealResult,
} from '@/lib/seals';
import { cn } from '@cuidly/shared';
import type { Nanny, Subscription } from '@prisma/client';

type NannyWithRelations = Nanny & {
  address: {
    city: string;
    state: string;
    neighborhood: string | null;
  } | null;
  subscription: Subscription | null;
  reviews: { id: number }[];
};

interface NannySealCardProps {
  nanny: NannyWithRelations;
}

// Requirements per seal level
const SEAL_REQUIREMENTS = {
  identificada: ['Perfil completo', 'Documento de identidade', 'E-mail verificado'],
  verificada: ['Assinatura Pro ativa', 'Validação facial', 'Verificação de segurança'],
  confiavel: ['3+ avaliações'],
} as const;

function getNextSealInfo(sealResult: NannySealResult): {
  nextSeal: string | null;
  missing: string[];
} {
  if (!sealResult.requirements.identificada.met) {
    return {
      nextSeal: 'Identificada',
      missing: sealResult.requirements.identificada.missing,
    };
  }

  if (!sealResult.requirements.verificada.met) {
    return {
      nextSeal: 'Verificada',
      missing: sealResult.requirements.verificada.missing,
    };
  }

  if (!sealResult.requirements.confiavel.met) {
    return {
      nextSeal: 'Confiável',
      missing: sealResult.requirements.confiavel.missing,
    };
  }

  return { nextSeal: null, missing: [] };
}

function getMetRequirementsForNextSeal(
  sealResult: NannySealResult,
  nextSeal: string | null,
  hasProSubscription: boolean,
  publishedReviewCount: number
): string[] {
  if (!nextSeal) return [];

  const met: string[] = [];

  if (nextSeal === 'Identificada') {
    const missing = sealResult.requirements.identificada.missing;
    // Check profile completeness
    const profileMissing = missing.filter(
      (m) => !m.includes('Documento') && !m.includes('E-mail')
    );
    if (profileMissing.length === 0) {
      met.push('Perfil completo');
    }
    // Check document
    if (!missing.some((m) => m.includes('Documento'))) {
      met.push('Documento verificado');
    }
    // Check email
    if (!missing.some((m) => m.includes('E-mail'))) {
      met.push('E-mail verificado');
    }
  } else if (nextSeal === 'Verificada') {
    // Identificada is already achieved
    met.push('Selo Identificada');
    const missing = sealResult.requirements.verificada.missing;
    // Check Pro subscription
    if (hasProSubscription) {
      met.push('Assinatura Pro ativa');
    }
    // Check facial validation
    if (!missing.some((m) => m.includes('facial'))) {
      met.push('Validação facial');
    }
    // Check security verification
    if (!missing.some((m) => m.includes('segurança'))) {
      met.push('Verificação de segurança');
    }
  } else if (nextSeal === 'Confiável') {
    // Verificada is already achieved
    met.push('Selo Verificada');
    if (publishedReviewCount >= 3) {
      met.push('3+ avaliações');
    }
  }

  return met;
}

function calculateNextSealProgress(
  sealResult: NannySealResult,
  nextSeal: string | null
): { completed: number; total: number; percent: number } {
  if (!nextSeal) {
    return { completed: 0, total: 0, percent: 100 };
  }

  let missing: string[] = [];
  if (nextSeal === 'Identificada') {
    missing = sealResult.requirements.identificada.missing;
  } else if (nextSeal === 'Verificada') {
    missing = sealResult.requirements.verificada.missing;
  } else if (nextSeal === 'Confiável') {
    missing = sealResult.requirements.confiavel.missing;
  }

  // Estimate total based on seal type
  const totals: Record<string, number> = {
    Identificada: 3, // profile + document + email
    Verificada: 4, // identificada + facial + security + pro subscription
    Confiável: 2, // verificada + 3+ reviews
  };

  const total = totals[nextSeal] || missing.length;
  const completed = Math.max(0, total - missing.length);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percent };
}

function getSealGradient(
  seal: NannySeal | null,
  nextSeal: string | null
): string {
  if (seal === 'CONFIAVEL')
    return 'from-violet-50 to-violet-100 border-violet-200';
  if (seal === 'VERIFICADA' || nextSeal === 'Confiável')
    return 'from-fuchsia-50 to-fuchsia-100 border-fuchsia-200';
  if (seal === 'IDENTIFICADA' || nextSeal === 'Verificada')
    return 'from-blue-50 to-blue-100 border-blue-200';
  return 'from-purple-50 to-fuchsia-50 border-fuchsia-200';
}

function getProgressBarColor(
  seal: NannySeal | null,
  nextSeal: string | null
): string {
  if (seal === 'CONFIAVEL') return 'bg-violet-500';
  if (seal === 'VERIFICADA' || nextSeal === 'Confiável') return 'bg-fuchsia-500';
  if (seal === 'IDENTIFICADA' || nextSeal === 'Verificada') return 'bg-blue-500';
  return 'bg-fuchsia-500';
}

export function NannySealCard({ nanny }: NannySealCardProps) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const hasProSubscription =
    (nanny.subscription?.status === 'ACTIVE' || nanny.subscription?.status === 'TRIALING') &&
    nanny.subscription?.plan === 'NANNY_PRO';

  const sealInput: NannySealInput = {
    name: nanny.name,
    cpf: nanny.cpf,
    birthDate: nanny.birthDate,
    gender: nanny.gender,
    photoUrl: nanny.photoUrl,
    address: nanny.address
      ? {
          city: nanny.address.city,
          state: nanny.address.state,
          neighborhood: nanny.address.neighborhood,
        }
      : null,
    aboutMe: nanny.aboutMe,
    experienceYears: nanny.experienceYears,
    ageRangesExperience: nanny.ageRangesExperience,
    strengths: nanny.strengths,
    acceptedActivities: nanny.acceptedActivities,
    nannyTypes: nanny.nannyTypes,
    contractRegimes: nanny.contractRegimes,
    hourlyRateRange: nanny.hourlyRateRange,
    maxChildrenCare: nanny.maxChildrenCare,
    maxTravelDistance: nanny.maxTravelDistance,
    availabilityJson: nanny.availabilityJson,
    emailVerified: nanny.emailVerified,
    documentValidated: nanny.documentValidated,
    documentExpirationDate: nanny.documentExpirationDate,
    personalDataValidated: nanny.personalDataValidated,
    criminalBackgroundValidated: nanny.criminalBackgroundValidated,
  };

  const publishedReviewCount = nanny.reviews?.length ?? 0;
  const sealResult = calculateNannySeal(
    sealInput,
    hasProSubscription,
    publishedReviewCount
  );

  const { nextSeal, missing } = getNextSealInfo(sealResult);
  const metRequirements = getMetRequirementsForNextSeal(sealResult, nextSeal, hasProSubscription, publishedReviewCount);
  const sealProgress = calculateNextSealProgress(sealResult, nextSeal);
  const gradientClass = getSealGradient(sealResult.seal, nextSeal);
  const progressBarColor = getProgressBarColor(sealResult.seal, nextSeal);

  // All seals achieved - celebration state
  if (!nextSeal && sealResult.seal === 'CONFIAVEL') {
    return (
      <Card
        className={cn(
          'mb-6 border bg-linear-to-r from-violet-50 to-blue-50 border-violet-300'
        )}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex size-16 items-center justify-center rounded-full bg-violet-100">
              <PiTrophy className="size-8 text-violet-600" />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-center gap-3 sm:justify-start">
                <SealBadge seal={sealResult.seal} variant="default" />
                <span className="text-lg font-semibold text-violet-800">
                  Parabéns!
                </span>
              </div>
              <p className="text-sm text-violet-700">
                Você conquistou o selo máximo! Seu perfil transmite máxima
                confiança para as famílias.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('mb-6 border bg-linear-to-r', gradientClass)}>
      <CardContent className="p-6">
        {/* Header: Current Seal + Progress */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {sealResult.seal ? (
              <>
                <SealBadge seal={sealResult.seal} variant="default" />
                <span className="text-sm text-gray-600">Seu selo atual</span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-700">
                Complete seu perfil para conquistar seu primeiro selo
              </span>
            )}
          </div>
          {nextSeal && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Próximo:</span>
              <SealBadge
                seal={nextSeal.toUpperCase().replace('Á', 'A') as NannySeal}
                variant="default"
              />
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {nextSeal && (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span>Progresso</span>
              <span>{sealProgress.completed} de {sealProgress.total}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn('h-full rounded-full transition-all', progressBarColor)}
                style={{ width: `${sealProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Requirements Grid */}
        <div className="mb-4 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {/* Met requirements */}
          {metRequirements.map((item, index) => (
            <div
              key={`met-${index}`}
              className="flex items-center gap-2 text-sm text-green-700"
            >
              <PiCheckCircle className="size-4 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
          {/* Missing requirements */}
          {missing.map((item, index) => (
            <div
              key={`missing-${index}`}
              className="flex items-center gap-2 text-sm text-gray-500"
            >
              <PiCircle className="size-4 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Action Button - contextual based on next seal and subscription */}
        {nextSeal && nextSeal !== 'Confiável' && (
          <div className="flex justify-end">
            {nextSeal === 'Identificada' ? (
              <Link href="/app/perfil">
                <Button variant="outline" size="sm">
                  Completar perfil
                  <PiArrowRight className="ml-1 size-4" />
                </Button>
              </Link>
            ) : nextSeal === 'Verificada' && !hasProSubscription ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUpgradeModalOpen(true)}
              >
                Assinar Pro
                <PiArrowRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Link href="/app/perfil">
                <Button variant="outline" size="sm">
                  Fazer verificações
                  <PiArrowRight className="ml-1 size-4" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Upgrade Modal */}
        <NannyProUpsellModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          feature="validation"
        />
      </CardContent>
    </Card>
  );
}
