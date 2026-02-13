'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PiChartBar, PiCrown } from 'react-icons/pi';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { PremiumLockedSection } from '@/components/PremiumLockedSection';
import { PremiumUpsellModal } from '@/components/PremiumUpsellModal';
import { createClient } from '@/utils/supabase/client';

interface ScoreComponent {
  score: number;
  maxScore: number;
  details?: string;
}

interface MatchBreakdown {
  ageRange: ScoreComponent;
  nannyType: ScoreComponent;
  activities: ScoreComponent;
  contractRegime: ScoreComponent;
  availability: ScoreComponent;
  childrenCount: ScoreComponent;
  seal: ScoreComponent;
  reviews: ScoreComponent;
  distanceBonus: ScoreComponent;
  budgetBonus: ScoreComponent;
}

interface MatchResult {
  score: number;
  fitScore: number;
  trustScore: number;
  bonusScore: number;
  isEligible: boolean;
  eliminationReasons: string[];
  breakdown: MatchBreakdown;
}

interface MatchScoreSectionProps {
  nannyId: number;
  nannySlug: string;
  nannyUserId: string | null;
  variant: 'mobile' | 'desktop';
}

function getBreakdownLabel(key: string): string {
  const labels: Record<string, string> = {
    ageRange: 'Faixa Etária',
    nannyType: 'Tipo de Babá',
    activities: 'Atividades',
    contractRegime: 'Regime',
    availability: 'Disponibilidade',
    childrenCount: 'Nº Crianças',
    seal: 'Selo',
    reviews: 'Avaliações',
    distanceBonus: 'Distância',
    budgetBonus: 'Orçamento',
  };
  return labels[key] || key;
}

export function MatchScoreSection({
  nannyId,
  nannySlug,
  nannyUserId,
  variant,
}: MatchScoreSectionProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeJobs, setActiveJobs] = useState<{ id: number; title: string }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // Check authentication and role
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setCurrentUserId(user?.id || null);

      if (user) {
        try {
          const roleResponse = await fetch('/api/user/role');
          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            setUserRole(roleData.role);
          }
        } catch {
          // Ignore role check errors
        }
      }
    };

    checkAuth();
  }, [supabase]);

  // Fetch active jobs for the job selector
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'FAMILY') return;

    async function loadActiveJobs() {
      try {
        const response = await fetch('/api/families/me/jobs');
        if (response.ok) {
          const data = await response.json();
          if (data.jobs?.length > 0) {
            setActiveJobs(data.jobs);
            setSelectedJobId(data.jobs[0].id);
          }
        }
      } catch {
        // Ignore
      }
    }
    loadActiveJobs();
  }, [isAuthenticated, userRole]);

  // Load match score for families
  useEffect(() => {
    const loadMatchScore = async () => {
      if (!isAuthenticated || userRole !== 'FAMILY') {
        return;
      }

      setIsLoadingMatch(true);
      try {
        const params = new URLSearchParams();
        if (selectedJobId) params.set('jobId', selectedJobId.toString());
        const url = `/api/nannies/slug/${nannySlug}/match${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            if (data.matchResult) {
              setMatchResult(data.matchResult);
            }
            setHasActiveSubscription(data.hasActiveSubscription ?? false);
          }
        }
      } catch (error) {
        console.error('Error loading match score:', error);
      } finally {
        setIsLoadingMatch(false);
      }
    };

    loadMatchScore();
  }, [isAuthenticated, userRole, nannySlug, selectedJobId]);

  const isOwnProfile = currentUserId && nannyUserId && currentUserId === nannyUserId;

  // Don't render if not authenticated family or own profile
  if (!isAuthenticated || userRole !== 'FAMILY' || isOwnProfile) {
    return null;
  }

  const jobSelector = activeJobs.length > 1 ? (
    <div className="mb-3">
      <label className="mb-1 block text-xs text-gray-500">Compatibilidade com:</label>
      <Select
        value={selectedJobId?.toString() ?? ''}
        onValueChange={(value) => setSelectedJobId(Number(value))}
      >
        <SelectTrigger className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {activeJobs.map((job) => (
            <SelectItem key={job.id} value={job.id.toString()}>
              {job.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : null;

  if (variant === 'mobile') {
    return (
      <>
        <div className="lg:hidden">
          <Card className="border-0 shadow-lg">
            <div className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <PiChartBar className="size-5 text-fuchsia-500" />
                <h3 className="font-semibold text-gray-900">Match</h3>
                {!hasActiveSubscription && matchResult && (
                  <Badge variant="warning-solid" size="sm">
                    <PiCrown className="size-3" />
                    Plus
                  </Badge>
                )}
              </div>

              {hasActiveSubscription && jobSelector}

              {isLoadingMatch ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-fuchsia-500 border-t-transparent"></div>
                </div>
              ) : matchResult ? (
                hasActiveSubscription ? (
                  <div className="flex items-center gap-4">
                    <div
                      className={`shrink-0 rounded-lg px-4 py-2 text-center ${
                        matchResult.score >= 80
                          ? 'bg-green-100'
                          : matchResult.score >= 60
                            ? 'bg-yellow-100'
                            : matchResult.score >= 40
                              ? 'bg-orange-100'
                              : 'bg-red-100'
                      }`}
                    >
                      <p
                        className={`text-2xl font-bold ${
                          matchResult.score >= 80
                            ? 'text-green-600'
                            : matchResult.score >= 60
                              ? 'text-yellow-600'
                              : matchResult.score >= 40
                                ? 'text-orange-600'
                                : 'text-red-600'
                        }`}
                      >
                        {matchResult.score}%
                      </p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {Object.entries(matchResult.breakdown)
                        .sort(
                          ([, a], [, b]) =>
                            b.score / b.maxScore - a.score / a.maxScore,
                        )
                        .slice(0, 3)
                        .map(([key, component]) => {
                          const percentage = Math.round(
                            (component.score / component.maxScore) * 100,
                          );
                          return (
                            <div
                              key={key}
                              className="flex items-center gap-1 text-xs text-gray-500"
                            >
                              <div className="h-1.5 w-10 rounded-full bg-gray-200">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    percentage >= 80
                                      ? 'bg-green-500'
                                      : percentage >= 60
                                        ? 'bg-yellow-500'
                                        : 'bg-orange-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span>{getBreakdownLabel(key)}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <PremiumLockedSection
                    onUnlock={() => setShowPremiumModal(true)}
                    title="Pontuação de Match"
                    description="Veja o quanto esta babá combina com sua família"
                    blurIntensity="medium"
                  >
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 rounded-lg bg-green-100 px-4 py-2 text-center">
                        <p className="text-2xl font-bold text-green-600">85%</p>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <div className="h-1.5 w-10 rounded-full bg-green-500" />
                          <span>Faixa Etária</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <div className="h-1.5 w-8 rounded-full bg-yellow-500" />
                          <span>Disponibilidade</span>
                        </div>
                      </div>
                    </div>
                  </PremiumLockedSection>
                )
              ) : (
                <p className="text-center text-sm text-gray-500">
                  Complete seu perfil para ver o match
                </p>
              )}
            </div>
          </Card>
        </div>

        <PremiumUpsellModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          feature="match"
        />
      </>
    );
  }

  // Desktop variant
  return (
    <>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <PiChartBar className="size-5 text-fuchsia-500" />
            <h3 className="font-semibold text-gray-900">Match</h3>
            {!hasActiveSubscription && matchResult && (
              <Badge variant="warning-solid" size="sm">
                <PiCrown className="size-3" />
                Plus
              </Badge>
            )}
          </div>

          {hasActiveSubscription && jobSelector}

          {isLoadingMatch ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent"></div>
            </div>
          ) : matchResult ? (
            hasActiveSubscription ? (
              <>
                <div
                  className={`mb-4 rounded-lg p-4 text-center ${
                    matchResult.score >= 80
                      ? 'bg-green-100'
                      : matchResult.score >= 60
                        ? 'bg-yellow-100'
                        : matchResult.score >= 40
                          ? 'bg-orange-100'
                          : 'bg-red-100'
                  }`}
                >
                  <p
                    className={`text-4xl font-bold ${
                      matchResult.score >= 80
                        ? 'text-green-600'
                        : matchResult.score >= 60
                          ? 'text-yellow-600'
                          : matchResult.score >= 40
                            ? 'text-orange-600'
                            : 'text-red-600'
                    }`}
                  >
                    {matchResult.score}%
                  </p>
                  <p className="text-sm text-gray-600">Pontuação de match</p>
                </div>

                {!matchResult.isEligible && matchResult.eliminationReasons.length > 0 && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="mb-2 text-sm font-medium text-red-700">
                      Requisitos não atendidos:
                    </p>
                    <ul className="space-y-1 text-xs text-red-600">
                      {matchResult.eliminationReasons.map((reason, i) => (
                        <li key={i}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  {Object.entries(matchResult.breakdown).map(([key, component]) => {
                    const percentage = Math.round(
                      (component.score / component.maxScore) * 100,
                    );
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">{getBreakdownLabel(key)}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-gray-200">
                            <div
                              className={`h-2 rounded-full ${
                                percentage >= 80
                                  ? 'bg-green-500'
                                  : percentage >= 60
                                    ? 'bg-yellow-500'
                                    : percentage >= 40
                                      ? 'bg-orange-500'
                                      : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs font-medium">
                            {percentage}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <PremiumLockedSection
                onUnlock={() => setShowPremiumModal(true)}
                title="Pontuação de Match"
                description="Veja o quanto esta babá combina com sua família"
                blurIntensity="medium"
              >
                <div className="mb-4 rounded-lg bg-green-100 p-4 text-center">
                  <p className="text-4xl font-bold text-green-600">85%</p>
                  <p className="text-sm text-gray-600">Pontuação de match</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Faixa Etária</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-green-500" />
                      <span className="w-8 text-right text-xs font-medium">95</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Disponibilidade</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-12 rounded-full bg-yellow-500" />
                      <span className="w-8 text-right text-xs font-medium">75</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Atividades</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-14 rounded-full bg-green-500" />
                      <span className="w-8 text-right text-xs font-medium">88</span>
                    </div>
                  </div>
                </div>
              </PremiumLockedSection>
            )
          ) : (
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-500">
                Complete seu perfil para ver o match com esta babá
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => router.push('/app/perfil')}
              >
                Completar perfil
              </Button>
            </div>
          )}
        </div>
      </Card>

      <PremiumUpsellModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="match"
      />
    </>
  );
}
