'use client';

import Link from 'next/link';
import {
  PiBaby,
  PiBriefcase,
  PiCalendar,
  PiCaretRight,
  PiConfettiDuotone,
  PiCurrencyDollar,
  PiLightning,
  PiMapPin,
  PiPlus,
  PiSlidersHorizontalDuotone,
  PiStar,
  PiUserDuotone,
  PiUsers,
  PiX,
} from 'react-icons/pi';

export const dynamic = 'force-dynamic';

import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/shadcn/alert';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import { getNannyProfileUrl } from '@/utils/slug';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

interface JobListing {
  id: number;
  title: string;
  description: string | null;
  jobType: string;
  contractType: string;
  paymentType: string;
  budgetMin: number;
  budgetMax: number;
  requiresOvernight: string;
  startDate: string;
  createdAt: string;
  childrenCount: number;
  hasSpecialNeeds: boolean;
  applicationsCount: number;
  location: {
    city: string | null;
    state: string | null;
    neighborhood: string | null;
  };
  hasActiveBoost: boolean;
  hasHighlight: boolean;
  matchScore: number | null;
  isEligible: boolean;
}

interface Filters {
  jobType: string;
  city: string;
  state: string;
  budgetMin: string;
  budgetMax: string;
}

interface FilterOptions {
  locations: { city: string; state: string }[];
  jobTypes: string[];
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Babá Fixa',
  SUBSTITUTE: 'Folguista',
  OCCASIONAL: 'Eventual',
};

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CLT: 'CLT',
  DAILY_WORKER: 'Diarista',
  MEI: 'MEI/PJ',
  TO_BE_DISCUSSED: 'A combinar',
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  MONTHLY: '/mês',
  HOURLY: '/hora',
  DAILY: '/dia',
};

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  if (score >= 40) return 'bg-orange-100';
  return 'bg-red-100';
}

function getJobTypeVariant(
  jobType: string,
): 'info' | 'purple' | 'teal' | 'secondary' {
  switch (jobType) {
    case 'FIXED':
      return 'info';
    case 'SUBSTITUTE':
      return 'purple';
    case 'OCCASIONAL':
      return 'teal';
    default:
      return 'secondary';
  }
}

function JobsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isNanny, setIsNanny] = useState(false);
  const [isFamily, setIsFamily] = useState(false);
  const [nannySlug, setNannySlug] = useState<string | null>(null);
  const [nannyCity, setNannyCity] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    locations: [],
    jobTypes: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Welcome banner state
  const isWelcome = searchParams.get('welcome') === 'true';
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(isWelcome);

  const [filters, setFilters] = useState<Filters>({
    jobType: searchParams.get('jobType') || '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    budgetMin: searchParams.get('budgetMin') || '',
    budgetMax: searchParams.get('budgetMax') || '',
  });

  const loadJobs = useCallback(async () => {
    setIsLoading(true);

    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.jobType) params.set('jobType', filters.jobType);
      if (filters.city) params.set('city', filters.city);
      if (filters.state) params.set('state', filters.state);
      if (filters.budgetMin) params.set('budgetMin', filters.budgetMin);
      if (filters.budgetMax) params.set('budgetMax', filters.budgetMax);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/jobs/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar vagas');
      }

      const data = await response.json();
      setJobs(data.jobs);
      setIsNanny(data.isNanny);
      setIsFamily(data.isFamily);
      setNannySlug(data.nannySlug);
      setNannyCity(data.nannyCity);
      setFilterOptions(data.filters);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  function handleFilterChange(key: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handleLocationChange(value: string) {
    if (value === 'all') {
      setFilters((prev) => ({ ...prev, city: '', state: '' }));
    } else {
      const [city, state] = value.split('|');
      setFilters((prev) => ({ ...prev, city, state }));
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function clearFilters() {
    setFilters({
      jobType: '',
      city: '',
      state: '',
      budgetMin: '',
      budgetMax: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  const hasActiveFilters =
    filters.jobType || filters.city || filters.budgetMin || filters.budgetMax;

  return (
    <>
      {showWelcomeBanner && isNanny && (
        <Alert
          variant="success"
          className="mb-6 pr-40"
          onDismiss={() => setShowWelcomeBanner(false)}
        >
          <PiConfettiDuotone />
          <AlertTitle>Seu perfil foi publicado!</AlertTitle>
          <AlertDescription>
            Agora você já pode compartilhar seu perfil e aumentar suas chances
            de contratação.
          </AlertDescription>
          <AlertActions>
            {nannySlug && (
              <Button variant="success" asChild>
                <Link href={getNannyProfileUrl(nannySlug, nannyCity)}>
                  <PiUserDuotone />
                  Ver meu perfil
                </Link>
              </Button>
            )}
          </AlertActions>
        </Alert>
      )}

      {/* Subtitle + Actions */}
      <div className="mb-6 flex items-center justify-between">
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-28" />
          </>
        ) : (
          <>
            <p className="text-gray-600">
              {pagination.total}{' '}
              {pagination.total === 1 ? 'vaga encontrada' : 'vagas encontradas'}
            </p>

            {isFamily && (
              <Button onClick={() => router.push('/app/vagas/criar')}>
                <PiPlus className="mr-1 size-4" />
                Criar Vaga
              </Button>
            )}
          </>
        )}
      </div>

      {/* Filters */}
      {isLoading ? (
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-4 w-44" />
          </div>
        </Card>
      ) : (
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <PiSlidersHorizontalDuotone className="mr-1 size-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="fuchsia-solid" className="ml-2">
                    {
                      [
                        filters.jobType,
                        filters.city,
                        filters.budgetMin,
                        filters.budgetMax,
                      ].filter(Boolean).length
                    }
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <PiX className="mr-1 size-4" />
                  Limpar filtros
                </Button>
              )}
            </div>

            {isNanny && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PiStar className="size-4 text-fuchsia-500" />
                <span>Ordenado por compatibilidade</span>
              </div>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Job Type */}
              <div>
                <Label className="mb-2 block text-sm">Tipo de trabalho</Label>
                <Select
                  value={filters.jobType || 'all'}
                  onValueChange={(value: string) =>
                    handleFilterChange('jobType', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="FIXED">Babá Fixa</SelectItem>
                    <SelectItem value="SUBSTITUTE">Folguista</SelectItem>
                    <SelectItem value="OCCASIONAL">Eventual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <Label className="mb-2 block text-sm">Localização</Label>
                <Select
                  value={
                    filters.city ? `${filters.city}|${filters.state}` : 'all'
                  }
                  onValueChange={handleLocationChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {filterOptions.locations.map((loc) => (
                      <SelectItem
                        key={`${loc.city}-${loc.state}`}
                        value={`${loc.city}|${loc.state}`}
                      >
                        {loc.city} - {loc.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Min */}
              <div>
                <Label className="mb-2 block text-sm">Orçamento mínimo</Label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500">
                    R$
                  </span>
                  <Input
                    type="number"
                    value={filters.budgetMin}
                    onChange={(e) =>
                      handleFilterChange('budgetMin', e.target.value)
                    }
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Budget Max */}
              <div>
                <Label className="mb-2 block text-sm">Orçamento máximo</Label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500">
                    R$
                  </span>
                  <Input
                    type="number"
                    value={filters.budgetMax}
                    onChange={(e) =>
                      handleFilterChange('budgetMax', e.target.value)
                    }
                    placeholder="10000"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <Skeleton className="mt-2 h-6 w-3/4" />
                </div>
                <Skeleton className="h-14 w-16 rounded-lg" />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && jobs.length === 0 && (
        <Card className="p-12 text-center">
          {isFamily ? (
            <>
              <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-fuchsia-100">
                <PiStar className="size-10 text-fuchsia-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Encontre a babá perfeita para cuidar de quem você tanto ama
              </h2>
              <p className="mx-auto mt-3 max-w-md text-gray-600">
                Crie sua primeira vaga e deixe nosso sistema encontrar as babás
                com maior compatibilidade com o que você procura.
              </p>
              <Button
                onClick={() => router.push('/app/vagas/criar')}
                className="mt-6"
                size="lg"
              >
                <PiPlus className="mr-2 size-5" />
                Criar minha primeira vaga
              </Button>
            </>
          ) : (
            <>
              <PiBriefcase className="mx-auto size-16 text-gray-300" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Nenhuma vaga encontrada
              </h2>
              <p className="mt-2 text-gray-600">
                {hasActiveFilters
                  ? 'Tente ajustar os filtros para ver mais resultados.'
                  : 'Não há vagas disponíveis no momento.'}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Limpar filtros
                </Button>
              )}
            </>
          )}
        </Card>
      )}

      {/* Jobs Grid */}
      {!isLoading && jobs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className={`overflow-hidden transition-shadow hover:shadow-md ${
                !job.isEligible ? 'opacity-60' : ''
              }`}
            >
              <div className="p-5">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {job.hasActiveBoost && (
                        <Badge variant="warning-solid">
                          <PiLightning className="h-3 w-3" />
                          Boost
                        </Badge>
                      )}
                      <Badge variant={getJobTypeVariant(job.jobType)}>
                        {JOB_TYPE_LABELS[job.jobType]}
                      </Badge>
                      {job.hasSpecialNeeds && (
                        <Badge variant="purple-outline">Nec. especiais</Badge>
                      )}
                    </div>
                    <h3 className="mt-2 truncate text-lg font-semibold text-gray-900">
                      {job.title}
                    </h3>
                  </div>

                  {/* Match Score */}
                  {job.matchScore !== null && (
                    <div
                      className={`shrink-0 rounded-lg px-3 py-2 text-center ${getScoreBgColor(job.matchScore)}`}
                    >
                      <p
                        className={`text-xl font-bold ${getScoreColor(job.matchScore)}`}
                      >
                        {job.matchScore}%
                      </p>
                      <p className="text-xs text-gray-600">Match</p>
                    </div>
                  )}
                </div>

                {/* Info Grid */}
                <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <PiMapPin className="size-4 shrink-0" />
                    <span className="truncate">
                      {job.location.city
                        ? `${job.location.city} - ${job.location.state}`
                        : 'Não informado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <PiCurrencyDollar className="size-4 shrink-0" />
                    <span>
                      {formatCurrency(job.budgetMin)} -{' '}
                      {formatCurrency(job.budgetMax)}
                      <span className="text-gray-400">
                        {PAYMENT_TYPE_LABELS[job.paymentType]}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <PiBaby className="size-4 shrink-0" />
                    <span>
                      {job.childrenCount}{' '}
                      {job.childrenCount === 1 ? 'criança' : 'crianças'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <PiCalendar className="size-4 shrink-0" />
                    <span>Início: {formatDate(job.startDate)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <PiUsers className="size-4" />
                      {job.applicationsCount}{' '}
                      {job.applicationsCount === 1
                        ? 'candidatura'
                        : 'candidaturas'}
                    </span>
                    <span>{CONTRACT_TYPE_LABELS[job.contractType]}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/app/vagas/${job.id}`)}
                    className="text-fuchsia-600 hover:text-fuchsia-700"
                  >
                    Ver detalhes
                    <PiCaretRight className="ml-1 size-4" />
                  </Button>
                </div>

                {/* Not Eligible Warning */}
                {job.matchScore !== null && !job.isEligible && (
                  <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                    Você não atende aos requisitos obrigatórios
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
          >
            Anterior
          </Button>
          <span className="px-4 text-sm text-gray-600">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
          >
            Próxima
          </Button>
        </div>
      )}
    </>
  );
}

function JobsListLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent"></div>
    </div>
  );
}

export default function JobsListPage() {
  return (
    <Suspense fallback={<JobsListLoading />}>
      <JobsListContent />
    </Suspense>
  );
}
