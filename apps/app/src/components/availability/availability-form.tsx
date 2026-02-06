'use client';

/**
 * Availability Form Client Component
 * Formulário para editar disponibilidade da babá
 */

import { Button } from '@/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import { Label } from '@/components/ui/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/shadcn/radio-group';
import { HOURLY_RATE_OPTIONS } from '@/constants/options/common-options';
import {
  NEEDED_DAYS_OPTIONS,
  NEEDED_SHIFTS_OPTIONS,
} from '@/constants/options/family-options';
import {
  CONTRACT_TYPE_OPTIONS,
  JOB_TYPE_OPTIONS,
} from '@/constants/options/nanny-options';
import { useApiError } from '@/hooks/useApiError';
import type { AvailabilityData } from '@/lib/data/availability';
import { cn } from '@cuidly/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  PiCalendar,
  PiCheck,
  PiCheckCircle,
  PiClock,
  PiMoney,
} from 'react-icons/pi';

// Day labels for the grid (columns)
const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Seg',
  TUESDAY: 'Ter',
  WEDNESDAY: 'Qua',
  THURSDAY: 'Qui',
  FRIDAY: 'Sex',
  SATURDAY: 'Sáb',
  SUNDAY: 'Dom',
};

// Shift labels for the grid (rows)
const SHIFT_LABELS: Record<string, string> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  NIGHT: 'Noite',
  OVERNIGHT: 'Pernoite',
};

interface AvailabilityFormProps {
  initialData: AvailabilityData | null;
  nannyId: number;
  onSaved?: () => void;
}

export function AvailabilityForm({
  initialData,
  nannyId,
  onSaved,
}: AvailabilityFormProps) {
  const router = useRouter();
  const { showError, showSuccess } = useApiError();
  const [isSaving, setIsSaving] = useState(false);

  // Map nanny types to job types
  const mapNannyTypesToJobTypes = (nannyTypes: string[]): string[] => {
    const mapping: Record<string, string> = {
      MENSALISTA: 'FIXED',
      FOLGUISTA: 'SUBSTITUTE',
      DIARISTA: 'OCCASIONAL',
    };
    return nannyTypes.map((nt) => mapping[nt] || nt).filter(Boolean);
  };

  // Map contract regimes to contract types
  const mapContractRegimesToContractTypes = (regimes: string[]): string[] => {
    const mapping: Record<string, string> = {
      CLT: 'CLT',
      PJ: 'MEI',
      AUTONOMA: 'DAILY_WORKER',
    };
    return regimes.map((r) => mapping[r] || r).filter(Boolean);
  };

  // Form state
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(
    mapNannyTypesToJobTypes(initialData?.nannyTypes || []),
  );
  // Use availabilitySlots directly from data (stored as ["MONDAY_MORNING", "TUESDAY_AFTERNOON", ...])
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(
    new Set(initialData?.availabilitySlots || []),
  );
  const [hourlyRateRange, setHourlyRateRange] = useState<string>(
    initialData?.hourlyRateRange || '',
  );
  const [selectedContractTypes, setSelectedContractTypes] = useState<string[]>(
    mapContractRegimesToContractTypes(initialData?.contractRegimes || []),
  );

  // Helper functions for slots
  const makeSlotKey = (day: string, shift: string) => `${day}_${shift}`;

  const isSlotSelected = (day: string, shift: string) =>
    selectedSlots.has(makeSlotKey(day, shift));

  const toggleSlot = (day: string, shift: string) => {
    const key = makeSlotKey(day, shift);
    const newSlots = new Set(selectedSlots);

    if (newSlots.has(key)) {
      newSlots.delete(key);
    } else {
      newSlots.add(key);
    }

    setSelectedSlots(newSlots);
  };

  const toggleFullDay = (day: string) => {
    const newSlots = new Set(selectedSlots);
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

    setSelectedSlots(newSlots);
  };

  const toggleFullShift = (shift: string) => {
    const newSlots = new Set(selectedSlots);
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

    setSelectedSlots(newSlots);
  };

  function toggleJobType(value: string) {
    if (selectedJobTypes.includes(value)) {
      setSelectedJobTypes(selectedJobTypes.filter((v) => v !== value));
    } else {
      setSelectedJobTypes([...selectedJobTypes, value]);
    }
  }

  function toggleContractType(value: string) {
    if (selectedContractTypes.includes(value)) {
      setSelectedContractTypes(
        selectedContractTypes.filter((v) => v !== value),
      );
    } else {
      setSelectedContractTypes([...selectedContractTypes, value]);
    }
  }

  async function onSave() {
    setIsSaving(true);
    try {
      const response = await fetch('/api/nannies/save-partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nannyType: selectedJobTypes.map((jt) => {
            const mapping: Record<string, string> = {
              FIXED: 'MENSALISTA',
              SUBSTITUTE: 'FOLGUISTA',
              OCCASIONAL: 'DIARISTA',
            };
            return mapping[jt] || jt;
          }),
          contractRegime: selectedContractTypes.map((ct) => {
            const mapping: Record<string, string> = {
              CLT: 'CLT',
              MEI: 'PJ',
              DAILY_WORKER: 'AUTONOMA',
            };
            return mapping[ct] || ct;
          }),
          hourlyRateRange,
          availability: { slots: Array.from(selectedSlots) },
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao salvar');
      }

      showSuccess('Disponibilidade atualizada com sucesso!');
      router.refresh();
      onSaved?.();
    } catch (error) {
      console.error('Error saving:', error);
      showError(error, 'Erro ao salvar disponibilidade');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <p className="text-gray-600">
          Defina sua disponibilidade e pretensão salarial
        </p>
      </div>

      <div className="space-y-6">
        {/* Tipo de trabalho */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiCalendar className="size-5 text-fuchsia-600" />
              Tipo de Trabalho
            </CardTitle>
            <CardDescription>
              Selecione os tipos de trabalho que você aceita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {JOB_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-gray-50 ${
                    selectedJobTypes.includes(option.value)
                      ? 'border-fuchsia-500 bg-fuchsia-50'
                      : ''
                  }`}
                >
                  <Checkbox
                    checked={selectedJobTypes.includes(option.value)}
                    onCheckedChange={() => toggleJobType(option.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-medium">{option.label}</span>
                    <p className="text-sm text-gray-500">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disponibilidade - Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiClock className="size-5 text-fuchsia-600" />
              Disponibilidade
            </CardTitle>
            <CardDescription>
              Selecione os dias e períodos em que você está disponível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto w-full max-w-xl">
              {/* Header row - Days */}
              <div className="mb-2 grid grid-cols-[70px_repeat(7,1fr)] gap-1">
                <div />
                {NEEDED_DAYS_OPTIONS.map((day) => {
                  const allShiftsSelected = NEEDED_SHIFTS_OPTIONS.every(
                    (shift) =>
                      selectedSlots.has(makeSlotKey(day.value, shift.value)),
                  );
                  const someShiftsSelected = NEEDED_SHIFTS_OPTIONS.some(
                    (shift) =>
                      selectedSlots.has(makeSlotKey(day.value, shift.value)),
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
                    selectedSlots.has(makeSlotKey(day.value, shift.value)),
                  );
                  const someDaysSelected = NEEDED_DAYS_OPTIONS.some((day) =>
                    selectedSlots.has(makeSlotKey(day.value, shift.value)),
                  );

                  return (
                    <div
                      key={shift.value}
                      className="grid grid-cols-[70px_repeat(7,1fr)] gap-1"
                    >
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

                      {NEEDED_DAYS_OPTIONS.map((day) => {
                        const isSelected = isSlotSelected(
                          day.value,
                          shift.value,
                        );
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
            </div>

            <p className="mt-4 text-center text-[11px] text-gray-500">
              Toque no dia ou turno para selecionar tudo
            </p>
          </CardContent>
        </Card>

        {/* Pretensão Salarial */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiMoney className="size-5 text-fuchsia-600" />
              Pretensão Salarial
            </CardTitle>
            <CardDescription>
              Selecione a faixa de valor por hora que você espera receber
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={hourlyRateRange}
              onValueChange={setHourlyRateRange}
              className="grid gap-2 sm:grid-cols-2"
            >
              {HOURLY_RATE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50',
                    hourlyRateRange === option.value
                      ? 'border-fuchsia-500 bg-fuchsia-50'
                      : 'border-gray-200',
                  )}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="cursor-pointer font-medium"
                  >
                    {option.label}
                  </Label>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Tipo de contratação */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Contratação</CardTitle>
            <CardDescription>
              Selecione as formas de contratação que você aceita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {CONTRACT_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-gray-50 ${
                    selectedContractTypes.includes(option.value)
                      ? 'border-fuchsia-500 bg-fuchsia-50'
                      : ''
                  }`}
                >
                  <Checkbox
                    checked={selectedContractTypes.includes(option.value)}
                    onCheckedChange={() => toggleContractType(option.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-medium">{option.label}</span>
                    <p className="text-xs text-gray-500">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="bg-fuchsia-600 hover:bg-fuchsia-700"
          >
            {isSaving ? (
              'Salvando...'
            ) : (
              <>
                <PiCheckCircle className="mr-2 size-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
