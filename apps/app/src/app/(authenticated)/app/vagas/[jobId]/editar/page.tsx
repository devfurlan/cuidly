'use client';

import { JobPhotosUpload } from '@/components/jobs/JobPhotosUpload';
import {
  PiBaby,
  PiBriefcase,
  PiCalendar,
  PiCheck,
  PiCheckCircleFill,
  PiCheckSquareFill,
  PiCurrencyDollar,
  PiImages,
  PiMapPin,
  PiPlus,
  PiShieldCheck,
  PiSquare,
  PiWarningCircle,
} from 'react-icons/pi';

import { AddressQuestion } from '@/components/onboarding-flow/questions/AddressQuestion';
import { type ChildData } from '@/components/onboarding-flow/questions/ChildrenSectionQuestion';
import {
  RichTextEditor,
  getPlainTextLength,
} from '@/components/ui/RichTextEditor';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import {
  FAMILY_CONTRACT_REGIME_OPTIONS,
  FAMILY_HOURLY_RATE_OPTIONS,
  FAMILY_NANNY_TYPE_OPTIONS,
  NEEDED_DAYS_OPTIONS,
  NEEDED_SHIFTS_OPTIONS,
} from '@/constants/options/family-options';
import {
  BENEFITS_OPTIONS,
  MANDATORY_REQUIREMENTS_OPTIONS,
  OVERNIGHT_OPTIONS,
} from '@/schemas/job';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@cuidly/shared';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AddressData {
  zipCode: string;
  streetName: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

// Day and shift labels for the availability grid
const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Seg',
  TUESDAY: 'Ter',
  WEDNESDAY: 'Qua',
  THURSDAY: 'Qui',
  FRIDAY: 'Sex',
  SATURDAY: 'Sáb',
  SUNDAY: 'Dom',
};

const SHIFT_LABELS: Record<string, string> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  NIGHT: 'Noite',
  OVERNIGHT: 'Pernoite',
};

function calculateAge(birthDate: string | Date | null): number | null {
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

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');

  // Children from family (existing)
  const [familyChildren, setFamilyChildren] = useState<ChildData[]>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<number[]>([]);

  // Address
  const [address, setAddress] = useState<AddressData>({
    zipCode: '',
    streetName: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>(
    {},
  );

  // Availability grid (slots like "MONDAY_MORNING")
  const [availabilitySlots, setAvailabilitySlots] = useState<Set<string>>(
    new Set(),
  );

  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState<string>('');
  const [contractType, setContractType] = useState<string>('');
  const [budgetRange, setBudgetRange] = useState<string>('');
  const [requiresOvernight, setRequiresOvernight] = useState<string>('NO');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [mandatoryRequirements, setMandatoryRequirements] = useState<string[]>(
    [],
  );
  const [startDate, setStartDate] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const maxDescriptionLength = 2000;

  // Load job data on mount
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
        // Fetch job data
        const jobResponse = await fetch(`/api/jobs/${jobId}`);
        if (!jobResponse.ok) {
          throw new Error('Erro ao carregar vaga');
        }
        const jobData = await jobResponse.json();

        if (!jobData.isOwner) {
          router.push(`/app/vagas/${jobId}`);
          return;
        }

        const job = jobData.job;
        setJobTitle(job.title);

        // Fetch family data with children and address
        const familyResponse = await fetch('/api/families/me');
        if (!familyResponse.ok) {
          throw new Error('Erro ao carregar dados da família');
        }
        const familyData = await familyResponse.json();

        // Set children from family
        if (familyData.children) {
          const children = familyData.children.map(
            (c: {
              child: {
                id: number;
                name: string;
                birthDate: string;
                gender: string;
                hasSpecialNeeds: boolean;
                specialNeedsDescription: string | null;
                carePriorities: string[];
              };
            }) => ({
              id: c.child.id,
              name: c.child.name,
              birthDate: c.child.birthDate,
              gender: c.child.gender,
              hasSpecialNeeds: c.child.hasSpecialNeeds,
              specialNeedsDescription: c.child.specialNeedsDescription,
              carePriorities: c.child.carePriorities || [],
            }),
          );
          setFamilyChildren(children);
        }

        // Set selected children from job
        if (job.children) {
          setSelectedChildrenIds(job.children.map((c: { id: number }) => c.id));
        }

        // Set address from family data
        if (familyData.address) {
          setAddress({
            zipCode: familyData.address.zipCode || '',
            streetName: familyData.address.streetName || '',
            number: familyData.address.number || '',
            complement: familyData.address.complement || '',
            neighborhood: familyData.address.neighborhood || '',
            city: familyData.address.city || '',
            state: familyData.address.state || '',
          });
        }

        // Set form data from job
        setTitle(job.title || '');
        setDescription(job.description || '');
        setJobType(job.jobType || '');
        setContractType(job.contractType || '');
        setRequiresOvernight(job.requiresOvernight || 'NO');
        setBenefits(job.benefits || []);
        setMandatoryRequirements(job.mandatoryRequirements || []);
        setStartDate(job.startDate ? job.startDate.split('T')[0] : '');
        setPhotos(job.photos || []);

        // Convert budget to range
        if (job.budgetMin && job.budgetMax) {
          const avg = (job.budgetMin + job.budgetMax) / 2;
          if (avg <= 20) setBudgetRange('UP_TO_20');
          else if (avg <= 30) setBudgetRange('20_TO_30');
          else if (avg <= 40) setBudgetRange('30_TO_40');
          else if (avg <= 50) setBudgetRange('40_TO_50');
          else setBudgetRange('ABOVE_50');
        }

        // Convert schedule to slots
        if (job.schedule) {
          const slots = new Set<string>();
          const dayMap: Record<string, string> = {
            monday: 'MONDAY',
            tuesday: 'TUESDAY',
            wednesday: 'WEDNESDAY',
            thursday: 'THURSDAY',
            friday: 'FRIDAY',
            saturday: 'SATURDAY',
            sunday: 'SUNDAY',
          };

          (
            Object.entries(job.schedule) as [
              string,
              { enabled?: boolean; startTime?: string; endTime?: string },
            ][]
          ).forEach(([day, schedule]) => {
            if (schedule?.enabled) {
              const upperDay = dayMap[day];
              const startHour = parseInt(
                schedule.startTime?.split(':')[0] || '8',
              );
              const endHour = parseInt(schedule.endTime?.split(':')[0] || '18');

              // Morning: 6-12, Afternoon: 12-18, Night: 18-22, Overnight: 22+
              if (startHour < 12) slots.add(`${upperDay}_MORNING`);
              if (
                (startHour < 18 && endHour > 12) ||
                (startHour >= 12 && startHour < 18)
              )
                slots.add(`${upperDay}_AFTERNOON`);
              if (
                (startHour < 22 && endHour > 18) ||
                (startHour >= 18 && startHour < 22)
              )
                slots.add(`${upperDay}_NIGHT`);
              if (endHour >= 22 || startHour >= 22)
                slots.add(`${upperDay}_OVERNIGHT`);
            }
          });
          setAvailabilitySlots(slots);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [jobId, router, supabase]);

  // Availability grid helpers
  const makeSlotKey = (day: string, shift: string) => `${day}_${shift}`;

  const isSlotSelected = (day: string, shift: string) =>
    availabilitySlots.has(makeSlotKey(day, shift));

  const toggleSlot = (day: string, shift: string) => {
    const key = makeSlotKey(day, shift);
    const newSlots = new Set(availabilitySlots);
    if (newSlots.has(key)) {
      newSlots.delete(key);
    } else {
      newSlots.add(key);
    }
    setAvailabilitySlots(newSlots);
  };

  const toggleFullDay = (day: string) => {
    const newSlots = new Set(availabilitySlots);
    const allSelected = NEEDED_SHIFTS_OPTIONS.every((shift) =>
      newSlots.has(makeSlotKey(day, shift.value)),
    );

    for (const shift of NEEDED_SHIFTS_OPTIONS) {
      const key = makeSlotKey(day, shift.value);
      if (allSelected) {
        newSlots.delete(key);
      } else {
        newSlots.add(key);
      }
    }
    setAvailabilitySlots(newSlots);
  };

  const toggleFullShift = (shift: string) => {
    const newSlots = new Set(availabilitySlots);
    const allSelected = NEEDED_DAYS_OPTIONS.every((day) =>
      newSlots.has(makeSlotKey(day.value, shift)),
    );

    for (const day of NEEDED_DAYS_OPTIONS) {
      const key = makeSlotKey(day.value, shift);
      if (allSelected) {
        newSlots.delete(key);
      } else {
        newSlots.add(key);
      }
    }
    setAvailabilitySlots(newSlots);
  };

  // Toggle helpers
  function toggleChild(childId: number) {
    if (selectedChildrenIds.includes(childId)) {
      setSelectedChildrenIds(
        selectedChildrenIds.filter((id) => id !== childId),
      );
    } else {
      setSelectedChildrenIds([...selectedChildrenIds, childId]);
    }
  }

  function toggleBenefit(value: string) {
    if (benefits.includes(value)) {
      setBenefits(benefits.filter((v) => v !== value));
    } else {
      setBenefits([...benefits, value]);
    }
  }

  function toggleRequirement(value: string) {
    if (mandatoryRequirements.includes(value)) {
      setMandatoryRequirements(
        mandatoryRequirements.filter((v) => v !== value),
      );
    } else {
      setMandatoryRequirements([...mandatoryRequirements, value]);
    }
  }

  function validateAddress(): boolean {
    const errors: Record<string, string> = {};

    if (!address.zipCode || address.zipCode.length < 9) {
      errors.zipCode = 'CEP é obrigatório';
    }
    if (!address.streetName) {
      errors.streetName = 'Logradouro é obrigatório';
    }
    if (!address.neighborhood) {
      errors.neighborhood = 'Bairro é obrigatório';
    }
    if (!address.city) {
      errors.city = 'Cidade é obrigatória';
    }
    if (!address.state || address.state.length < 2) {
      errors.state = 'Estado é obrigatório';
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Convert slots to schedule format
  function slotsToSchedule() {
    const schedule: Record<
      string,
      { enabled: boolean; startTime: string; endTime: string }
    > = {
      monday: { enabled: false, startTime: '08:00', endTime: '18:00' },
      tuesday: { enabled: false, startTime: '08:00', endTime: '18:00' },
      wednesday: { enabled: false, startTime: '08:00', endTime: '18:00' },
      thursday: { enabled: false, startTime: '08:00', endTime: '18:00' },
      friday: { enabled: false, startTime: '08:00', endTime: '18:00' },
      saturday: { enabled: false, startTime: '08:00', endTime: '18:00' },
      sunday: { enabled: false, startTime: '08:00', endTime: '18:00' },
    };

    const dayMap: Record<string, string> = {
      MONDAY: 'monday',
      TUESDAY: 'tuesday',
      WEDNESDAY: 'wednesday',
      THURSDAY: 'thursday',
      FRIDAY: 'friday',
      SATURDAY: 'saturday',
      SUNDAY: 'sunday',
    };

    availabilitySlots.forEach((slot) => {
      const [day, shift] = slot.split('_');
      const lowerDay = dayMap[day];
      if (lowerDay) {
        schedule[lowerDay].enabled = true;
        // Adjust times based on shift
        if (shift === 'MORNING') {
          schedule[lowerDay].startTime = '06:00';
        }
        if (shift === 'OVERNIGHT') {
          schedule[lowerDay].endTime = '23:00';
        }
      }
    });

    return schedule;
  }

  // Convert budget range to min/max values
  function budgetRangeToValues(range: string): { min: number; max: number } {
    switch (range) {
      case 'UP_TO_20':
        return { min: 15, max: 20 };
      case '20_TO_30':
        return { min: 20, max: 30 };
      case '30_TO_40':
        return { min: 30, max: 40 };
      case '40_TO_50':
        return { min: 40, max: 50 };
      case 'ABOVE_50':
        return { min: 50, max: 80 };
      default:
        return { min: 0, max: 0 };
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate
    if (!title || title.length < 5) {
      setError('Título deve ter pelo menos 5 caracteres');
      return;
    }
    if (!jobType) {
      setError('Selecione o tipo de trabalho');
      return;
    }
    if (!contractType) {
      setError('Selecione o tipo de contratação');
      return;
    }
    if (selectedChildrenIds.length === 0) {
      setError('Selecione pelo menos uma criança');
      return;
    }
    if (!validateAddress()) {
      setError('Por favor, preencha o endereço corretamente');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // First, update the family address
      const addressResponse = await fetch('/api/families/save-partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!addressResponse.ok) {
        throw new Error('Erro ao atualizar endereço');
      }

      const budget = budgetRangeToValues(budgetRange);

      // Then update the job
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          jobType,
          schedule: slotsToSchedule(),
          requiresOvernight,
          contractType,
          benefits,
          paymentType: 'HOURLY', // Default to hourly for range-based budget
          budgetMin: budget.min,
          budgetMax: budget.max,
          childrenIds: selectedChildrenIds,
          mandatoryRequirements,
          startDate,
          photos,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar vaga');
      }

      // Redirect to job details page
      router.push(`/app/vagas/${jobId}`);
    } catch (err) {
      console.error('Error updating job:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar vaga');
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

  return (
    <>
      <div className="mb-6">
        <p className="text-gray-600">{jobTitle}</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <PiWarningCircle className="size-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Babá fixa para 2 crianças"
                className="mt-1 h-12 bg-white text-base"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <div className="mt-1">
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Descreva detalhes sobre a vaga, rotina, expectativas..."
                  maxLength={maxDescriptionLength}
                />
              </div>
              <div className="mt-1 flex justify-end text-xs text-gray-500">
                <span>
                  {getPlainTextLength(description)}/{maxDescriptionLength}
                </span>
              </div>
            </div>

            {/* Photos */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <PiImages className="size-5 text-fuchsia-500" />
                <Label className="text-base">Fotos da vaga (opcional)</Label>
              </div>
              <p className="mb-3 text-sm text-gray-500">
                Adicione fotos do ambiente de trabalho, quarto das crianças,
                área de lazer, etc.
              </p>
              <JobPhotosUpload
                value={photos}
                onChange={setPhotos}
                maxPhotos={5}
              />
            </div>

            <div>
              <Label className="mb-3 block">Tipo de babá *</Label>
              <div className="grid gap-3">
                {FAMILY_NANNY_TYPE_OPTIONS.map((option) => {
                  const isSelected = jobType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setJobType(option.value)}
                      className={cn(
                        'flex items-center justify-between rounded-lg border-2 bg-white/60 p-3 text-left transition-all',
                        isSelected
                          ? 'border-fuchsia-500 bg-white'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      )}
                    >
                      <div className="flex-1">
                        <span
                          className={cn(
                            'text-base font-medium',
                            isSelected ? 'text-fuchsia-900' : 'text-gray-700',
                          )}
                        >
                          {option.label}
                        </span>
                        <p
                          className={cn(
                            'mt-0.5 text-xs',
                            isSelected ? 'text-fuchsia-600' : 'text-gray-500',
                          )}
                        >
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <PiCheckCircleFill className="ml-3 size-6 shrink-0 text-fuchsia-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="startDate">Data de início *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 h-12 bg-white text-base"
              />
            </div>
          </div>
        </Card>

        {/* Address */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <PiMapPin className="size-5 text-fuchsia-500" />
            <h2 className="text-lg font-semibold">Local do Trabalho</h2>
          </div>

          <p className="mb-4 text-sm text-gray-500">
            Endereço onde a babá irá trabalhar
          </p>

          <AddressQuestion
            value={address}
            onChange={setAddress}
            errors={addressErrors}
          />
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

          {familyChildren.length === 0 ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                <p className="text-gray-500">Nenhuma criança cadastrada</p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/app/filhos')}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-all',
                  'border-gray-300 bg-gray-50/50 text-gray-600 hover:border-fuchsia-400 hover:bg-fuchsia-50/50 hover:text-fuchsia-600',
                )}
              >
                <PiPlus className="size-5" />
                <span className="font-medium">Adicionar criança</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3">
                {familyChildren.map((child) => {
                  const isSelected = selectedChildrenIds.includes(child.id!);
                  const age = calculateAge(child.birthDate);
                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => toggleChild(child.id!)}
                      className={cn(
                        'flex items-center justify-between rounded-lg border-2 bg-white/60 p-4 text-left transition-all',
                        isSelected
                          ? 'border-fuchsia-500 bg-white'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      )}
                    >
                      <div>
                        <span
                          className={cn(
                            'text-base font-medium',
                            isSelected ? 'text-fuchsia-900' : 'text-gray-700',
                          )}
                        >
                          {child.name || `Criança ${child.id}`}
                        </span>
                        {age !== null && (
                          <p
                            className={cn(
                              'text-sm',
                              isSelected ? 'text-fuchsia-600' : 'text-gray-500',
                            )}
                          >
                            {age} {age === 1 ? 'ano' : 'anos'}
                          </p>
                        )}
                      </div>
                      {isSelected ? (
                        <PiCheckSquareFill className="size-6 text-fuchsia-500" />
                      ) : (
                        <PiSquare className="size-6 text-gray-300" />
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => router.push('/app/filhos')}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-all',
                  'border-gray-300 bg-gray-50/50 text-gray-600 hover:border-fuchsia-400 hover:bg-fuchsia-50/50 hover:text-fuchsia-600',
                )}
              >
                <PiPlus className="size-5" />
                <span className="font-medium">Adicionar criança</span>
              </button>
            </div>
          )}
        </Card>

        {/* Schedule - Grid based like onboarding */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <PiCalendar className="size-5 text-fuchsia-500" />
            <h2 className="text-lg font-semibold">Horário</h2>
          </div>

          <p className="mb-4 text-sm text-gray-500">
            Selecione os dias e turnos que você precisa da babá
          </p>

          {/* Availability Grid */}
          <div className="mx-auto w-full max-w-xl">
            {/* Header row - Days */}
            <div className="mb-2 grid grid-cols-[70px_repeat(7,1fr)] gap-1">
              {/* Empty corner */}
              <div />
              {/* Day headers */}
              {NEEDED_DAYS_OPTIONS.map((day) => {
                const allShiftsSelected = NEEDED_SHIFTS_OPTIONS.every((shift) =>
                  availabilitySlots.has(makeSlotKey(day.value, shift.value)),
                );
                const someShiftsSelected = NEEDED_SHIFTS_OPTIONS.some((shift) =>
                  availabilitySlots.has(makeSlotKey(day.value, shift.value)),
                );

                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleFullDay(day.value)}
                    className={cn(
                      'rounded-md py-1.5 text-2xs font-medium transition-all sm:text-xs',
                      allShiftsSelected
                        ? 'bg-fuchsia-500 text-white'
                        : someShiftsSelected
                          ? 'bg-fuchsia-100 text-fuchsia-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                    )}
                  >
                    {DAY_LABELS[day.value]}
                  </button>
                );
              })}
            </div>

            {/* Shift rows */}
            <div className="space-y-1">
              {NEEDED_SHIFTS_OPTIONS.map((shift) => {
                const allDaysSelected = NEEDED_DAYS_OPTIONS.every((day) =>
                  availabilitySlots.has(makeSlotKey(day.value, shift.value)),
                );
                const someDaysSelected = NEEDED_DAYS_OPTIONS.some((day) =>
                  availabilitySlots.has(makeSlotKey(day.value, shift.value)),
                );

                return (
                  <div
                    key={shift.value}
                    className="grid grid-cols-[70px_repeat(7,1fr)] gap-1"
                  >
                    {/* Shift label */}
                    <button
                      type="button"
                      onClick={() => toggleFullShift(shift.value)}
                      className={cn(
                        'rounded-md py-2 text-2xs font-medium transition-all sm:text-xs',
                        allDaysSelected
                          ? 'bg-fuchsia-500 text-white'
                          : someDaysSelected
                            ? 'bg-fuchsia-100 text-fuchsia-700'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                      )}
                    >
                      {SHIFT_LABELS[shift.value]}
                    </button>

                    {/* Day cells */}
                    {NEEDED_DAYS_OPTIONS.map((day) => {
                      const isSelected = isSlotSelected(day.value, shift.value);
                      return (
                        <button
                          key={`${day.value}_${shift.value}`}
                          type="button"
                          onClick={() => toggleSlot(day.value, shift.value)}
                          className={cn(
                            'flex h-9 items-center justify-center rounded-md border transition-all',
                            isSelected
                              ? 'border-fuchsia-500 bg-fuchsia-500 text-white'
                              : 'border-gray-200 bg-white hover:border-gray-300',
                          )}
                        >
                          <PiCheck
                            className={cn(
                              'size-4 transition-opacity',
                              isSelected ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-center text-[11px] text-gray-500">
              Toque no dia ou turno para selecionar tudo
            </p>
          </div>

          <div className="mt-6">
            <Label className="mb-3 block">Requer pernoite?</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {OVERNIGHT_OPTIONS.map((option) => {
                const isSelected = requiresOvernight === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRequiresOvernight(option.value)}
                    className={cn(
                      'flex items-center justify-between rounded-lg border-2 bg-white/60 p-4 text-left transition-all',
                      isSelected
                        ? 'border-fuchsia-500 bg-white'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    )}
                  >
                    <span
                      className={cn(
                        'text-base font-medium',
                        isSelected ? 'text-fuchsia-900' : 'text-gray-700',
                      )}
                    >
                      {option.label}
                    </span>
                    {isSelected && (
                      <PiCheckCircleFill className="ml-3 size-6 shrink-0 text-fuchsia-500" />
                    )}
                  </button>
                );
              })}
            </div>
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
              <div className="grid gap-3">
                {FAMILY_CONTRACT_REGIME_OPTIONS.map((option) => {
                  const isSelected = contractType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setContractType(option.value)}
                      className={cn(
                        'flex items-center justify-between rounded-lg border-2 bg-white/60 p-3 text-left transition-all',
                        isSelected
                          ? 'border-fuchsia-500 bg-white'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      )}
                    >
                      <div className="flex-1">
                        <span
                          className={cn(
                            'text-base font-medium',
                            isSelected ? 'text-fuchsia-900' : 'text-gray-700',
                          )}
                        >
                          {option.label}
                        </span>
                        <p
                          className={cn(
                            'mt-0.5 text-xs',
                            isSelected ? 'text-fuchsia-600' : 'text-gray-500',
                          )}
                        >
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <PiCheckCircleFill className="ml-3 size-6 shrink-0 text-fuchsia-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Faixa de valor por hora *</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {FAMILY_HOURLY_RATE_OPTIONS.map((option) => {
                  const isSelected = budgetRange === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setBudgetRange(option.value)}
                      className={cn(
                        'flex items-center justify-between rounded-lg border-2 bg-white/60 p-4 text-left transition-all',
                        isSelected
                          ? 'border-fuchsia-500 bg-white'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      )}
                    >
                      <span
                        className={cn(
                          'text-base font-medium',
                          isSelected ? 'text-fuchsia-900' : 'text-gray-700',
                        )}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <PiCheckCircleFill className="ml-3 size-6 shrink-0 text-fuchsia-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">
                Benefícios oferecidos (opcional)
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {BENEFITS_OPTIONS.map((option) => {
                  const isSelected = benefits.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleBenefit(option.value)}
                      className={cn(
                        'flex items-center justify-between rounded-lg border-2 bg-white/60 p-4 text-left transition-all',
                        isSelected
                          ? 'border-fuchsia-500 bg-white'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      )}
                    >
                      <span
                        className={cn(
                          'text-base font-medium',
                          isSelected ? 'text-fuchsia-900' : 'text-gray-700',
                        )}
                      >
                        {option.label}
                      </span>
                      {isSelected ? (
                        <PiCheckSquareFill className="size-6 text-fuchsia-500" />
                      ) : (
                        <PiSquare className="size-6 text-gray-300" />
                      )}
                    </button>
                  );
                })}
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

          <div className="grid gap-3 sm:grid-cols-2">
            {MANDATORY_REQUIREMENTS_OPTIONS.map((option) => {
              const isSelected = mandatoryRequirements.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleRequirement(option.value)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border-2 bg-white/60 p-4 text-left transition-all',
                    isSelected
                      ? 'border-fuchsia-500 bg-white'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  <span
                    className={cn(
                      'text-base font-medium',
                      isSelected ? 'text-fuchsia-900' : 'text-gray-700',
                    )}
                  >
                    {option.label}
                  </span>
                  {isSelected ? (
                    <PiCheckSquareFill className="size-6 text-fuchsia-500" />
                  ) : (
                    <PiSquare className="size-6 text-gray-300" />
                  )}
                </button>
              );
            })}
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
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </>
  );
}
