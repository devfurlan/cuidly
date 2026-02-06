'use client';

import {
  Field,
  FieldDescription,
  FieldError,
} from '@/components/ui/shadcn/field';
import {
  NEEDED_DAYS_OPTIONS,
  NEEDED_SHIFTS_OPTIONS,
} from '@/constants/options/family-options';
import type { AvailabilityData } from '@/schemas/family-onboarding';
import { cn } from '@cuidly/shared';
import { PiCheck } from 'react-icons/pi';

interface AvailabilitySectionQuestionProps {
  value: AvailabilityData | undefined;
  onChange: (value: AvailabilityData) => void;
  error?: string | null;
}

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

export function AvailabilitySectionQuestion({
  value,
  onChange,
  error,
}: AvailabilitySectionQuestionProps) {
  const slots = new Set(value?.slots || []);

  const makeSlotKey = (day: string, shift: string) => `${day}_${shift}`;

  const isSlotSelected = (day: string, shift: string) =>
    slots.has(makeSlotKey(day, shift));

  const toggleSlot = (day: string, shift: string) => {
    const key = makeSlotKey(day, shift);
    const newSlots = new Set(slots);

    if (newSlots.has(key)) {
      newSlots.delete(key);
    } else {
      newSlots.add(key);
    }

    onChange({ slots: Array.from(newSlots) });
  };

  const toggleFullDay = (day: string) => {
    const newSlots = new Set(slots);
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

    onChange({ slots: Array.from(newSlots) });
  };

  const toggleFullShift = (shift: string) => {
    const newSlots = new Set(slots);
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

    onChange({ slots: Array.from(newSlots) });
  };

  return (
    <Field data-invalid={!!error}>
      {/* Grid container */}
      <div className="mx-auto w-full max-w-xl">
        {/* Header row - Days */}
        <div className="mb-2 grid grid-cols-[70px_repeat(7,1fr)] gap-1">
          {/* Empty corner */}
          <div />
          {/* Day headers */}
          {NEEDED_DAYS_OPTIONS.map((day) => {
            const allShiftsSelected = NEEDED_SHIFTS_OPTIONS.every((shift) =>
              slots.has(makeSlotKey(day.value, shift.value)),
            );
            const someShiftsSelected = NEEDED_SHIFTS_OPTIONS.some((shift) =>
              slots.has(makeSlotKey(day.value, shift.value)),
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
              slots.has(makeSlotKey(day.value, shift.value)),
            );
            const someDaysSelected = NEEDED_DAYS_OPTIONS.some((day) =>
              slots.has(makeSlotKey(day.value, shift.value)),
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
      </div>

      {/* Helper text */}
      <FieldDescription className="mt-4 text-center text-[11px]">
        Toque no dia ou turno para selecionar tudo
      </FieldDescription>

      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
