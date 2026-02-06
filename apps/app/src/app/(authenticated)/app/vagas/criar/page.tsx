'use client';

import { PiBaby, PiBriefcase, PiCalendar, PiCurrencyDollar, PiShieldCheck, PiWarningCircle } from 'react-icons/pi';

import { trackJobCreated } from '@/lib/gtm-events';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/shadcn/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { Switch } from '@/components/ui/shadcn/switch';
import { Textarea } from '@/components/ui/shadcn/textarea';
import {
  BENEFITS_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  CreateJobData,
  createJobSchema,
  DAYS_OF_WEEK,
  DaySchedule,
  JOB_TYPE_OPTIONS,
  MANDATORY_REQUIREMENTS_OPTIONS,
  OVERNIGHT_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  TIME_OPTIONS,
} from '@/schemas/job';
import { JobPhotosUpload } from '@/components/jobs/JobPhotosUpload';
import { PremiumUpsellModal } from '@/components/PremiumUpsellModal';
import { createClient } from '@/utils/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface Child {
  id: number;
  name: string | null;
  age: number | null;
  birthDate: string | null;
}

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  planName?: string;
  endDate?: string;
  plan?: string;
  maxJobs?: number;
  activeJobsCount?: number;
}

const DEFAULT_SCHEDULE: Record<string, DaySchedule> = {
  monday: { enabled: false, startTime: '08:00', endTime: '18:00' },
  tuesday: { enabled: false, startTime: '08:00', endTime: '18:00' },
  wednesday: { enabled: false, startTime: '08:00', endTime: '18:00' },
  thursday: { enabled: false, startTime: '08:00', endTime: '18:00' },
  friday: { enabled: false, startTime: '08:00', endTime: '18:00' },
  saturday: { enabled: false, startTime: '08:00', endTime: '18:00' },
  sunday: { enabled: false, startTime: '08:00', endTime: '18:00' },
};

function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  const number = parseInt(digits, 10) / 100;
  if (isNaN(number)) return '';
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrency(value: string): number {
  const digits = value.replace(/\D/g, '');
  return parseInt(digits, 10) / 100 || 0;
}

function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function CreateJobPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null,
  );
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [jobLimitReached, setJobLimitReached] = useState(false);

  // Currency input states
  const [budgetMinInput, setBudgetMinInput] = useState('');
  const [budgetMaxInput, setBudgetMaxInput] = useState('');

  const form = useForm<CreateJobData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: '',
      description: '',
      jobType: undefined,
      schedule: DEFAULT_SCHEDULE,
      requiresOvernight: 'NO',
      contractType: undefined,
      benefits: [],
      paymentType: undefined,
      budgetMin: 0,
      budgetMax: 0,
      childrenIds: [],
      mandatoryRequirements: [],
      photos: [],
      startDate: '',
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = form;

  const selectedChildren = watch('childrenIds') || [];
  const selectedBenefits = watch('benefits') || [];
  const selectedRequirements = watch('mandatoryRequirements') || [];
  const photos = watch('photos') || [];
  const schedule = watch('schedule');
  const jobType = watch('jobType');
  const paymentType = watch('paymentType');

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Fetch family data with children and subscription
        const response = await fetch('/api/families/me');
        if (!response.ok) {
          throw new Error('Erro ao carregar dados da família');
        }
        const data = await response.json();

        // Set children
        if (data.children) {
          setChildren(
            data.children.map((c: { child: Child }) => ({
              id: c.child.id,
              name: c.child.name,
              age: calculateAge(c.child.birthDate),
              birthDate: c.child.birthDate,
            })),
          );
        }

        // Set subscription status
        const subscriptionData = {
          hasActiveSubscription: data.hasActiveSubscription || false,
          planName: data.subscription?.plan,
          endDate: data.subscription?.endDate,
          plan: data.subscription?.plan,
          maxJobs: data.maxJobs,
          activeJobsCount: data.activeJobsCount,
        };
        setSubscription(subscriptionData);

        // Check if job limit is reached
        const maxJobs = data.maxJobs ?? 1;
        const activeJobs = data.activeJobsCount ?? 0;
        if (activeJobs >= maxJobs) {
          setJobLimitReached(true);
          setShowUpgradeModal(true);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  // Set default payment type based on job type
  useEffect(() => {
    if (jobType === 'FIXED' && !paymentType) {
      setValue('paymentType', 'MONTHLY');
    } else if (jobType === 'OCCASIONAL' && !paymentType) {
      setValue('paymentType', 'HOURLY');
    } else if (jobType === 'SUBSTITUTE' && !paymentType) {
      setValue('paymentType', 'DAILY');
    }
  }, [jobType, paymentType, setValue]);

  function toggleChild(childId: number) {
    const current = selectedChildren || [];
    if (current.includes(childId)) {
      setValue(
        'childrenIds',
        current.filter((id) => id !== childId),
      );
    } else {
      setValue('childrenIds', [...current, childId]);
    }
  }

  function toggleBenefit(value: string) {
    const current = selectedBenefits || [];
    if (current.includes(value)) {
      setValue(
        'benefits',
        current.filter((v) => v !== value),
      );
    } else {
      setValue('benefits', [...current, value]);
    }
  }

  function toggleRequirement(value: string) {
    const current = selectedRequirements || [];
    if (current.includes(value)) {
      setValue(
        'mandatoryRequirements',
        current.filter((v) => v !== value),
      );
    } else {
      setValue('mandatoryRequirements', [...current, value]);
    }
  }

  function toggleDayEnabled(day: string) {
    const currentSchedule = schedule || DEFAULT_SCHEDULE;
    const daySchedule = currentSchedule[day as keyof typeof currentSchedule];
    setValue(
      `schedule.${day as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'}`,
      {
        ...daySchedule,
        enabled: !daySchedule.enabled,
      },
    );
  }

  function updateDayTime(
    day: string,
    field: 'startTime' | 'endTime',
    value: string,
  ) {
    const currentSchedule = schedule || DEFAULT_SCHEDULE;
    const daySchedule = currentSchedule[day as keyof typeof currentSchedule];
    setValue(
      `schedule.${day as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'}`,
      {
        ...daySchedule,
        [field]: value,
      },
    );
  }

  async function onSubmit(data: CreateJobData) {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'SUBSCRIPTION_REQUIRED') {
          setError('Você precisa de uma assinatura ativa para criar vagas.');
          return;
        }
        throw new Error(result.error || 'Erro ao criar vaga');
      }

      trackJobCreated(result.job.id);

      // Redirect to job details page
      router.push(`/app/vagas/${result.job.id}`);
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar vaga');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent"></div>
      </div>
    );
  }

  // Show blocked state if job limit reached
  if (jobLimitReached) {
    return (
      <>
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-amber-100">
              <PiWarningCircle className="size-8 text-amber-600" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-semibold">Limite de vagas atingido</h2>
          <p className="mb-6 text-gray-600">
            Você já possui {subscription?.activeJobsCount ?? 1} vaga ativa.
            No plano gratuito, você pode ter apenas 1 vaga ativa por vez.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => setShowUpgradeModal(true)}>
              Fazer upgrade para criar mais vagas
            </Button>
            <Button variant="outline" onClick={() => router.push('/app/vagas')}>
              Ver minhas vagas
            </Button>
          </div>
        </div>

        <PremiumUpsellModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="general"
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <p className="text-gray-600">
          Preencha os detalhes da vaga para encontrar a babá ideal
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <PiWarningCircle className="size-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <PiBriefcase className="size-5 text-fuchsia-500" />
            <h2 className="text-lg font-semibold">Informações Básicas</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título da vaga *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ex: Babá fixa para 2 crianças"
                className="mt-1"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descreva detalhes sobre a vaga, rotina, expectativas..."
                className="mt-1 min-h-24"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Photos */}
            <div>
              <Label className="mb-3 block">Fotos do ambiente (opcional)</Label>
              <p className="mb-3 text-sm text-gray-500">
                Adicione fotos do quarto da criança, área de brincar ou outros espaços relevantes
              </p>
              <JobPhotosUpload
                value={photos}
                onChange={(newPhotos) => setValue('photos', newPhotos)}
                maxPhotos={5}
              />
            </div>

            <div>
              <Label className="mb-3 block">Tipo de trabalho *</Label>
              <Controller
                name="jobType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid gap-3 sm:grid-cols-3"
                  >
                    {JOB_TYPE_OPTIONS.map((option) => (
                      <div key={option.value} className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem
                            value={option.value}
                            id={`job-type-${option.value}`}
                          />
                          <Label htmlFor={`job-type-${option.value}`}>
                            {option.label}
                          </Label>
                        </div>
                        <p className="pl-7 text-sm text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.jobType && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.jobType.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="startDate">Data de início *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className="mt-1"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.startDate.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Children Selection */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <PiBaby className="size-5 text-fuchsia-500" />
            <h2 className="text-lg font-semibold">Crianças</h2>
          </div>

          <p className="mb-3 text-sm text-gray-500">
            Selecione as crianças que precisarão de cuidados
          </p>

          {children.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-500">Nenhuma criança cadastrada</p>
              <Button
                type="button"
                variant="link"
                onClick={() => router.push('/app/filhos')}
                className="mt-2"
              >
                Cadastrar criança
              </Button>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {children.map((child) => (
                <label
                  key={child.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 ${
                    selectedChildren.includes(child.id)
                      ? 'border-fuchsia-500 bg-fuchsia-50'
                      : ''
                  }`}
                >
                  <Checkbox
                    checked={selectedChildren.includes(child.id)}
                    onCheckedChange={() => toggleChild(child.id)}
                  />
                  <div>
                    <span className="font-medium">
                      {child.name || `Criança ${child.id}`}
                    </span>
                    {child.age !== null && (
                      <p className="text-sm text-gray-500">{child.age} anos</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
          {errors.childrenIds && (
            <p className="mt-1 text-sm text-red-500">
              {errors.childrenIds.message}
            </p>
          )}
        </Card>

        {/* Schedule */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <PiCalendar className="size-5 text-fuchsia-500" />
            <h2 className="text-lg font-semibold">Horário</h2>
          </div>

          <p className="mb-3 text-sm text-gray-500">
            Defina os dias e horários que você precisa da babá
          </p>

          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const daySchedule =
                schedule?.[day.key as keyof typeof schedule] ||
                DEFAULT_SCHEDULE[day.key];
              return (
                <div
                  key={day.key}
                  className={`rounded-lg border p-3 transition-colors ${
                    daySchedule.enabled
                      ? 'border-fuchsia-500 bg-fuchsia-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={daySchedule.enabled}
                        onCheckedChange={() => toggleDayEnabled(day.key)}
                      />
                      <span
                        className={`font-medium ${daySchedule.enabled ? 'text-gray-900' : 'text-gray-500'}`}
                      >
                        {day.label}
                      </span>
                    </div>

                    {daySchedule.enabled && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={daySchedule.startTime}
                          onValueChange={(value: string) =>
                            updateDayTime(day.key, 'startTime', value)
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-gray-500">às</span>
                        <Select
                          value={daySchedule.endTime}
                          onValueChange={(value: string) =>
                            updateDayTime(day.key, 'endTime', value)
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <Label className="mb-3 block">Requer pernoite? *</Label>
            <Controller
              name="requiresOvernight"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-2 sm:grid-cols-3"
                >
                  {OVERNIGHT_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center gap-3"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`overnight-${option.value}`}
                      />
                      <Label htmlFor={`overnight-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>
        </Card>

        {/* Payment & Contract */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <PiCurrencyDollar className="size-5 text-fuchsia-500" />
            <h2 className="text-lg font-semibold">Pagamento e Contrato</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-3 block">Tipo de contratação *</Label>
              <Controller
                name="contractType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {CONTRACT_TYPE_OPTIONS.map((option) => (
                      <div key={option.value} className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem
                            value={option.value}
                            id={`contract-${option.value}`}
                          />
                          <Label htmlFor={`contract-${option.value}`}>
                            {option.label}
                          </Label>
                        </div>
                        <p className="pl-7 text-sm text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.contractType && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.contractType.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-3 block">Tipo de pagamento *</Label>
              <Controller
                name="paymentType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-4"
                  >
                    {PAYMENT_TYPE_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center gap-3"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`payment-${option.value}`}
                        />
                        <Label htmlFor={`payment-${option.value}`}>
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.paymentType && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.paymentType.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="budgetMin">
                  Orçamento mínimo (R$) *{paymentType === 'MONTHLY' && ' /mês'}
                  {paymentType === 'HOURLY' && ' /hora'}
                  {paymentType === 'DAILY' && ' /dia'}
                </Label>
                <div className="relative mt-1">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <Input
                    id="budgetMin"
                    value={budgetMinInput}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      setBudgetMinInput(formatted);
                      setValue('budgetMin', parseCurrency(e.target.value));
                    }}
                    placeholder="0,00"
                    className="pl-10"
                  />
                </div>
                {errors.budgetMin && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.budgetMin.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="budgetMax">
                  Orçamento máximo (R$) *{paymentType === 'MONTHLY' && ' /mês'}
                  {paymentType === 'HOURLY' && ' /hora'}
                  {paymentType === 'DAILY' && ' /dia'}
                </Label>
                <div className="relative mt-1">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <Input
                    id="budgetMax"
                    value={budgetMaxInput}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      setBudgetMaxInput(formatted);
                      setValue('budgetMax', parseCurrency(e.target.value));
                    }}
                    placeholder="0,00"
                    className="pl-10"
                  />
                </div>
                {errors.budgetMax && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.budgetMax.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">
                Benefícios oferecidos (opcional)
              </Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {BENEFITS_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-gray-50 ${
                      selectedBenefits.includes(option.value)
                        ? 'border-fuchsia-500 bg-fuchsia-50'
                        : ''
                    }`}
                  >
                    <Checkbox
                      checked={selectedBenefits.includes(option.value)}
                      onCheckedChange={() => toggleBenefit(option.value)}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Requirements */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <PiShieldCheck className="size-5 text-fuchsia-500" />
            <h2 className="text-lg font-semibold">Requisitos Obrigatórios</h2>
          </div>

          <p className="mb-3 text-sm text-gray-500">
            Selecione os requisitos que a babá deve atender obrigatoriamente
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            {MANDATORY_REQUIREMENTS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 ${
                  selectedRequirements.includes(option.value)
                    ? 'border-fuchsia-500 bg-fuchsia-50'
                    : ''
                }`}
              >
                <Checkbox
                  checked={selectedRequirements.includes(option.value)}
                  onCheckedChange={() => toggleRequirement(option.value)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Criando...' : 'Criar Vaga'}
          </Button>
        </div>
      </form>
    </>
  );
}
