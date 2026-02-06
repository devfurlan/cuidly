'use client';

/**
 * Availability Grid Editor Component
 * Componente simples para editar apenas a grade de disponibilidade (dias x períodos)
 */

import { Button } from '@/components/ui/shadcn/button';
import {
  NEEDED_DAYS_OPTIONS,
  NEEDED_SHIFTS_OPTIONS,
} from '@/constants/options/family-options';
import { useApiError } from '@/hooks/useApiError';
import { cn } from '@cuidly/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PiCheck, PiCheckCircle } from 'react-icons/pi';

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

interface AvailabilityGridEditorProps {
  initialSlots: string[];
  onSaved?: () => void;
}

export function AvailabilityGridEditor({
  initialSlots,
  onSaved,
}: AvailabilityGridEditorProps) {
  const router = useRouter();
  const { showError, showSuccess } = useApiError();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(
    new Set(initialSlots),
  );

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

  async function onSave() {
    setIsSaving(true);
    try {
      const response = await fetch('/api/nannies/save-partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Selecione os dias e períodos em que você está disponível para trabalhar.
      </p>

      <div className="mx-auto w-full max-w-xl">
        {/* Header row - Days */}
        <div className="mb-2 grid grid-cols-[70px_repeat(7,1fr)] gap-1">
          <div />
          {NEEDED_DAYS_OPTIONS.map((day) => {
            const allShiftsSelected = NEEDED_SHIFTS_OPTIONS.every((shift) =>
              selectedSlots.has(makeSlotKey(day.value, shift.value)),
            );
            const someShiftsSelected = NEEDED_SHIFTS_OPTIONS.some((shift) =>
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
      </div>

      <p className="text-center text-[11px] text-gray-500">
        Toque no dia ou turno para selecionar tudo
      </p>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
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
              Salvar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
