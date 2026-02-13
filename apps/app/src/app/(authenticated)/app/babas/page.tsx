'use client';

import { PiBriefcase, PiCaretRight, PiCertificate, PiCheckCircle, PiCrown, PiFirstAidKit, PiHeart, PiLightning, PiMapPin, PiSlidersHorizontal, PiSparkle, PiStar, PiStarFill, PiUser, PiX } from 'react-icons/pi';

export const dynamic = 'force-dynamic';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/shadcn/avatar';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import { Label } from '@/components/ui/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { getNannyProfileUrl } from '@/utils/slug';
import { getExperienceYearsLabel } from '@/helpers/label-getters';
import { PremiumUpsellModal } from '@/components/PremiumUpsellModal';

interface NannyListing {
  id: number;
  name: string;
  slug: string;
  photoUrl: string | null;
  experienceYears: number | null;
  certifications: string[];
  hasSpecialNeedsExperience: boolean;
  ageRangesExperience: string[];
  strengths: string[];
  hasCnh: boolean;
  location: {
    city: string | null;
    state: string | null;
    neighborhood: string | null;
  };
  availability: {
    jobTypes: string[];
    monthlyRate: number | null;
    hourlyRate: number | null;
    dailyRate: number | null;
  } | null;
  hasPremium: boolean;
  isVerified: boolean;
  hasActiveBoost: boolean;
  hasHighlight: boolean;
  matchScore: number | null;
  isEligible: boolean;
}

interface Filters {
  city: string;
  state: string;
  minExperience: string;
  certifications: string[];
  hasSpecialNeedsExperience: boolean;
  jobType: string;
}

interface FilterOptions {
  locations: { city: string; state: string }[];
  certifications: string[];
  experienceRanges: { value: string; label: string }[];
}

const CERTIFICATION_LABELS: Record<string, string> = {
  FIRST_AID: 'Primeiros Socorros',
  CPR: 'RCP',
  CHILD_DEVELOPMENT: 'Desenvolvimento Infantil',
  EARLY_EDUCATION: 'Educação Infantil',
  NUTRITION: 'Nutrição Infantil',
  SPECIAL_NEEDS: 'Necessidades Especiais',
  MONTESSORI: 'Montessori',
  NURSING: 'Enfermagem',
};

const STRENGTH_LABELS: Record<string, string> = {
  PATIENCE: 'Paciência',
  CREATIVITY: 'Criatividade',
  ORGANIZATION: 'Organização',
  COMMUNICATION: 'Comunicação',
  FLEXIBILITY: 'Flexibilidade',
  PUNCTUALITY: 'Pontualidade',
  AFFECTION: 'Carinho',
  DISCIPLINE: 'Disciplina',
  EDUCATION: 'Educação',
  SAFETY: 'Segurança',
};

const JOB_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Fixa',
  SUBSTITUTE: 'Folguista',
  OCCASIONAL: 'Eventual',
};

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function NanniesListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  createClient(); // Initialize supabase client

  const [isLoading, setIsLoading] = useState(true);
  const [nannies, setNannies] = useState<NannyListing[]>([]);
  const [isFamily, setIsFamily] = useState(false);
  const [hasActiveJob, setHasActiveJob] = useState(false);
  const [hasMatchingFeature, setHasMatchingFeature] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [activeJobs, setActiveJobs] = useState<{ id: number; title: string }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    locations: [],
    certifications: [],
    experienceRanges: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<Filters>({
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    minExperience: searchParams.get('minExperience') || '',
    certifications:
      searchParams.get('certifications')?.split(',').filter(Boolean) || [],
    hasSpecialNeedsExperience:
      searchParams.get('hasSpecialNeedsExperience') === 'true',
    jobType: searchParams.get('jobType') || '',
  });

  // Fetch active jobs for the job selector
  useEffect(() => {
    async function loadActiveJobs() {
      try {
        const response = await fetch('/api/families/me/jobs');
        if (response.ok) {
          const data = await response.json();
          if (data.jobs?.length > 0) {
            setActiveJobs(data.jobs);
            // Default to most recent job (first in list, already sorted by createdAt desc)
            setSelectedJobId(data.jobs[0].id);
          }
        }
      } catch {
        // Not a family or not authenticated — ignore
      }
    }
    loadActiveJobs();
  }, []);

  const loadNannies = useCallback(async () => {
    setIsLoading(true);

    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.city) params.set('city', filters.city);
      if (filters.state) params.set('state', filters.state);
      if (filters.minExperience)
        params.set('minExperience', filters.minExperience);
      if (filters.certifications.length > 0)
        params.set('certifications', filters.certifications.join(','));
      if (filters.hasSpecialNeedsExperience)
        params.set('hasSpecialNeedsExperience', 'true');
      if (filters.jobType) params.set('jobType', filters.jobType);
      if (selectedJobId) params.set('jobId', selectedJobId.toString());
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/nannies/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar babás');
      }

      const data = await response.json();
      setNannies(data.nannies);
      setIsFamily(data.isFamily);
      setHasActiveJob(data.hasActiveJob);
      setHasMatchingFeature(data.hasMatchingFeature ?? false);
      setFilterOptions(data.filters);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading nannies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, selectedJobId, pagination.page, pagination.limit]);

  useEffect(() => {
    loadNannies();
  }, [loadNannies]);

  function handleFilterChange<K extends keyof Filters>(
    key: K,
    value: Filters[K],
  ) {
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

  function toggleCertification(cert: string) {
    setFilters((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function clearFilters() {
    setFilters({
      city: '',
      state: '',
      minExperience: '',
      certifications: [],
      hasSpecialNeedsExperience: false,
      jobType: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  const hasActiveFilters =
    filters.city ||
    filters.minExperience ||
    filters.certifications.length > 0 ||
    filters.hasSpecialNeedsExperience ||
    filters.jobType;

  return (
    <div className="py-6">
      {/* Subtitle */}
      <div className="mb-6">
        <p className="text-gray-600">
          {pagination.total}{' '}
          {pagination.total === 1 ? 'babá disponível' : 'babás disponíveis'}
        </p>
      </div>

      {/* Matching info for families with Plus plan */}
      {isFamily && hasMatchingFeature && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-lg p-4 ${hasActiveJob ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}
        >
          <PiStarFill className="size-5 shrink-0" />
          {hasActiveJob ? (
            activeJobs.length > 1 ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span>Ordenado por compatibilidade com:</span>
                <Select
                  value={selectedJobId?.toString() ?? ''}
                  onValueChange={(value) => {
                    setSelectedJobId(Number(value));
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="h-8 w-auto min-w-40 border-green-300 bg-white text-green-700">
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
            ) : (
              <p className="text-sm">
                As babás estão ordenadas por compatibilidade com sua vaga ativa.
              </p>
            )
          ) : (
            <p className="text-sm">
              Crie uma vaga para ver o score de compatibilidade com cada babá.
              <Button
                variant="link"
                className="ml-1 h-auto p-0 text-sm"
                onClick={() => router.push('/app/vagas/criar')}
              >
                Criar vaga
              </Button>
            </p>
          )}
        </div>
      )}

      {/* Upsell banner for families without Plus plan */}
      {isFamily && !hasMatchingFeature && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-purple-50 p-4">
          <PiSparkle className="size-5 shrink-0 text-fuchsia-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-fuchsia-700">
              Desbloqueie a ordenação por compatibilidade
            </p>
            <p className="text-xs text-fuchsia-600">
              Com o Plus, veja quais babás têm maior compatibilidade com sua vaga
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-fuchsia-300 text-fuchsia-600 hover:bg-fuchsia-100"
            onClick={() => setShowUpsellModal(true)}
          >
            <PiCrown className="size-4" />
            Ver Plus
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <PiSlidersHorizontal className="mr-2 size-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="fuchsia-solid" className="ml-2">
                  {[
                    filters.city,
                    filters.minExperience,
                    filters.jobType,
                    filters.hasSpecialNeedsExperience,
                  ].filter(Boolean).length + filters.certifications.length}
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

          {isFamily && hasActiveJob && hasMatchingFeature && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <PiStar className="size-4 text-fuchsia-500" />
              <span>Ordenado por compatibilidade</span>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

              {/* Experience */}
              <div>
                <Label className="mb-2 block text-sm">Experiência mínima</Label>
                <Select
                  value={filters.minExperience || 'any'}
                  onValueChange={(value: string) =>
                    handleFilterChange(
                      'minExperience',
                      value === 'any' ? '' : value,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.experienceRanges.map((range) => (
                      <SelectItem
                        key={range.value}
                        value={range.value || 'any'}
                      >
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              {/* Special Needs */}
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-gray-50">
                  <Checkbox
                    checked={filters.hasSpecialNeedsExperience}
                    onCheckedChange={(checked: boolean | 'indeterminate') =>
                      handleFilterChange('hasSpecialNeedsExperience', !!checked)
                    }
                  />
                  <span className="text-sm">Exp. necessidades especiais</span>
                </label>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <Label className="mb-2 block text-sm">Certificações</Label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.certifications.map((cert) => (
                  <label
                    key={cert}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 ${
                      filters.certifications.includes(cert)
                        ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700'
                        : ''
                    }`}
                  >
                    <Checkbox
                      checked={filters.certifications.includes(cert)}
                      onCheckedChange={() => toggleCertification(cert)}
                      className="size-3.5"
                    />
                    {CERTIFICATION_LABELS[cert] || cert}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden p-5">
              {/* Header Skeleton */}
              <div className="mb-4 flex items-start gap-4">
                <Skeleton className="size-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                  <div className="mt-2 flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-14 w-14 rounded-lg" />
              </div>
              {/* Bio Skeleton */}
              <div className="mb-4 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              {/* Tags Skeleton */}
              <div className="mb-4 flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              {/* Footer Skeleton */}
              <div className="flex items-center justify-between border-t pt-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && nannies.length === 0 && (
        <Card className="p-12 text-center">
          <PiUser className="mx-auto size-16 text-gray-300" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Nenhuma babá encontrada
          </h2>
          <p className="mt-2 text-gray-600">
            {hasActiveFilters
              ? 'Tente ajustar os filtros para ver mais resultados.'
              : 'Não há babás disponíveis no momento.'}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Limpar filtros
            </Button>
          )}
        </Card>
      )}

      {/* Nannies Grid */}
      {!isLoading && nannies.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nannies.map((nanny) => (
            <Card
              key={nanny.id}
              className={`overflow-hidden transition-shadow hover:shadow-md ${
                nanny.matchScore !== null && !nanny.isEligible
                  ? 'opacity-60'
                  : ''
              }`}
            >
              <div className="p-5">
                {/* Header */}
                <div className="mb-4 flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="size-16">
                      <AvatarImage
                        src={nanny.photoUrl || undefined}
                        alt={nanny.name}
                      />
                      <AvatarFallback className="bg-fuchsia-100 text-lg text-fuchsia-600">
                        {getInitials(nanny.name)}
                      </AvatarFallback>
                    </Avatar>
                    {nanny.hasPremium && (
                      <div className="absolute -top-1 -right-1 rounded-full bg-yellow-400 p-1">
                        <PiCrown
                          className="size-3 text-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-gray-900">
                        {nanny.name}
                      </h3>
                      {nanny.isVerified && (
                        <PiCheckCircle
                          className="size-5 shrink-0 text-blue-500"
                        />
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <PiMapPin className="size-4" />
                      <span className="truncate">
                        {nanny.location.city
                          ? `${nanny.location.city} - ${nanny.location.state}`
                          : 'Não informado'}
                      </span>
                    </div>
                    {nanny.experienceYears !== null && (
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                        <PiBriefcase className="size-4" />
                        <span>{getExperienceYearsLabel(nanny.experienceYears)}</span>
                      </div>
                    )}
                  </div>

                  {/* Match Score */}
                  {nanny.matchScore !== null && (
                    <div
                      className={`shrink-0 rounded-lg px-3 py-2 text-center ${getScoreBgColor(nanny.matchScore)}`}
                    >
                      <p
                        className={`text-xl font-bold ${getScoreColor(nanny.matchScore)}`}
                      >
                        {nanny.matchScore}%
                      </p>
                      <p className="text-xs text-gray-600">Match</p>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {nanny.hasActiveBoost && (
                    <Badge variant="warning-solid">
                      <PiLightning className="h-3 w-3" />
                      Boost
                    </Badge>
                  )}
                  {nanny.hasHighlight && (
                    <Badge variant="purple-solid">
                      <PiStarFill className="h-3 w-3" />
                      Destaque
                    </Badge>
                  )}
                  {nanny.hasPremium && (
                    <Badge variant="warning">
                      <PiCrown className="size-3" />
                      Plus
                    </Badge>
                  )}
                  {nanny.isVerified && (
                    <Badge variant="info">
                      <PiCheckCircle className="size-3" />
                      Verificada
                    </Badge>
                  )}
                  {nanny.hasSpecialNeedsExperience && (
                    <Badge variant="purple-outline">
                      <PiHeart className="size-3" />
                      Nec. Especiais
                    </Badge>
                  )}
                  {nanny.hasCnh && (
                    <Badge variant="default-outline">
                      <PiBriefcase className="size-3" />
                      CNH
                    </Badge>
                  )}
                </div>

                {/* Availability */}
                {nanny.availability && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {nanny.availability.jobTypes.map((type) => (
                      <Badge key={type} variant="secondary" size="sm">
                        {JOB_TYPE_LABELS[type]}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {nanny.certifications.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {nanny.certifications.slice(0, 3).map((cert) => (
                      <Badge
                        key={cert}
                        variant="success-outline"
                        size="sm"
                      >
                        <PiCertificate className="size-3" />
                        {CERTIFICATION_LABELS[cert] || cert}
                      </Badge>
                    ))}
                    {nanny.certifications.length > 3 && (
                      <Badge variant="default-outline" size="sm">
                        +{nanny.certifications.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Strengths */}
                {nanny.strengths.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {nanny.strengths.slice(0, 3).map((strength) => (
                      <span key={strength} className="text-xs text-gray-500">
                        {STRENGTH_LABELS[strength] || strength}
                        {nanny.strengths.indexOf(strength) <
                          Math.min(nanny.strengths.length, 3) - 1 && ' •'}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rates */}
                {nanny.availability && (
                  <div className="mb-4 flex flex-wrap gap-3 text-sm text-gray-600">
                    {nanny.availability.monthlyRate && (
                      <span>
                        {formatCurrency(nanny.availability.monthlyRate)}/mês
                      </span>
                    )}
                    {nanny.availability.dailyRate && (
                      <span>
                        {formatCurrency(nanny.availability.dailyRate)}/dia
                      </span>
                    )}
                    {nanny.availability.hourlyRate && (
                      <span>
                        {formatCurrency(nanny.availability.hourlyRate)}/hora
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    {nanny.isVerified && (
                      <>
                        <PiFirstAidKit className="size-4 text-green-500" />
                        <span className="text-green-600">Perfil completo</span>
                      </>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(getNannyProfileUrl(nanny.slug, nanny.location.city))}
                    className="text-fuchsia-600 hover:text-fuchsia-700"
                  >
                    Ver perfil
                    <PiCaretRight className="ml-1 size-4" />
                  </Button>
                </div>

                {/* Not Eligible Warning */}
                {nanny.matchScore !== null && !nanny.isEligible && (
                  <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                    Não atende aos requisitos da vaga
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

      {/* Premium Upsell Modal */}
      <PremiumUpsellModal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        feature="match"
      />
    </div>
  );
}

function NanniesListLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent"></div>
    </div>
  );
}

export default function NanniesListPage() {
  return (
    <Suspense fallback={<NanniesListLoading />}>
      <NanniesListContent />
    </Suspense>
  );
}
