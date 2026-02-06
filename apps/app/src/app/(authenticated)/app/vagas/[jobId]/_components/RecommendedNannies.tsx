'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiSparkle, PiSpinner, PiUser } from 'react-icons/pi';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { PremiumLockedSection } from '@/components/PremiumLockedSection';
import { PremiumUpsellModal } from '@/components/PremiumUpsellModal';
import { getCertificationLabel, getExperienceYearsLabel } from '@/helpers/label-getters';
import { getNannyProfileUrl } from '@/utils/slug';
import { type RecommendedNanny, getScoreColor, getScoreBgColor } from './types';

interface RecommendedNanniesProps {
  jobId: number;
  hasActiveSubscription: boolean;
}

export function RecommendedNannies({
  jobId,
  hasActiveSubscription,
}: RecommendedNanniesProps) {
  const router = useRouter();
  const [recommendedNannies, setRecommendedNannies] = useState<RecommendedNanny[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    async function loadRecommendedNannies() {
      if (!hasActiveSubscription) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/matching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            limit: 10,
            minScore: 30,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar recomendações');
        }

        const data = await response.json();
        setRecommendedNannies(data.matches || []);
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError('Não foi possível carregar as babás recomendadas');
      } finally {
        setIsLoading(false);
      }
    }

    loadRecommendedNannies();
  }, [jobId, hasActiveSubscription]);

  return (
    <>
      <Card className="mt-6 border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-purple-50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <PiSparkle className="size-5 text-fuchsia-500" />
          <h2 className="text-lg font-semibold">Babás Recomendadas</h2>
          <Badge variant="fuchsia">Exclusivo Cuidly</Badge>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          Encontramos as babás com maior compatibilidade para esta vaga, baseado
          em localização, horários, valores e experiência.
        </p>

        {!hasActiveSubscription ? (
          <PremiumLockedSection
            onUnlock={() => setShowPremiumModal(true)}
            title="Veja as Babás Mais Compatíveis"
            description="Assine o plano Plus para acessar recomendações personalizadas de babás com maior compatibilidade para sua vaga."
            blurIntensity="medium"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-fuchsia-100">
                      <PiUser className="size-6 text-fuchsia-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate font-semibold text-gray-900">
                          Maria S.
                        </h3>
                        <div className="shrink-0 rounded-lg bg-green-100 px-2 py-1 text-center">
                          <p className="text-sm font-bold text-green-600">92%</p>
                          <p className="text-xs text-gray-500">Match</p>
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span>5+ anos exp.</span>
                        <span className="ml-2">São Paulo</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          Primeiros Socorros
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Ver Perfil
                  </Button>
                </Card>
              ))}
            </div>
          </PremiumLockedSection>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <PiSpinner className="size-8 animate-spin text-fuchsia-500" />
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        ) : recommendedNannies.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center">
            <PiUser className="mx-auto size-10 text-gray-300" />
            <p className="mt-2 text-gray-500">
              Ainda não encontramos babás compatíveis com esta vaga.
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Conforme mais babás se cadastram, você receberá recomendações.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedNannies.map((match) => (
              <Card
                key={match.nanny.id}
                className="cursor-pointer bg-white p-4 transition-shadow hover:shadow-md"
                onClick={() =>
                  router.push(
                    getNannyProfileUrl(match.nanny.slug, match.nanny.city)
                  )
                }
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-fuchsia-100">
                    {match.nanny.photoUrl ? (
                      <img
                        src={match.nanny.photoUrl}
                        alt={match.nanny.name}
                        className="size-12 rounded-full object-cover"
                      />
                    ) : (
                      <PiUser className="size-6 text-fuchsia-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate font-semibold text-gray-900">
                        {match.nanny.name}
                      </h3>
                      <div
                        className={`shrink-0 rounded-lg px-2 py-1 text-center ${getScoreBgColor(match.matchScore)}`}
                      >
                        <p
                          className={`text-sm font-bold ${getScoreColor(match.matchScore)}`}
                        >
                          {match.matchScore}%
                        </p>
                        <p className="text-xs text-gray-500">Match</p>
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {match.nanny.experienceYears !== null && (
                        <span>
                          {getExperienceYearsLabel(match.nanny.experienceYears)}{' '}
                          exp.
                        </span>
                      )}
                      {match.nanny.city && (
                        <span className="ml-2">{match.nanny.city}</span>
                      )}
                    </div>
                    {match.nanny.certifications.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {match.nanny.certifications.slice(0, 2).map((cert) => (
                          <Badge key={cert} variant="outline" className="text-xs">
                            {getCertificationLabel(cert)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      getNannyProfileUrl(match.nanny.slug, match.nanny.city)
                    );
                  }}
                >
                  Ver Perfil
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <PremiumUpsellModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="recommendations"
      />
    </>
  );
}
