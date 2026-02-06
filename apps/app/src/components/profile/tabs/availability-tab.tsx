'use client';

import { PiCheck, PiX } from 'react-icons/pi';

import { MissingFieldsBanner } from '@/components/profile/missing-fields-banner';
import { SettingsSection } from '@/components/profile/settings-section';
import { Button } from '@/components/ui/shadcn/button';

import type { AvailabilityTabProps } from '../types';

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

const DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];
const SHIFTS = ['MORNING', 'AFTERNOON', 'NIGHT', 'OVERNIGHT'];

interface AvailabilityGridProps {
  availabilityJson: unknown;
}

function AvailabilityGrid({ availabilityJson }: AvailabilityGridProps) {
  const slots = new Set<string>();

  if (availabilityJson && typeof availabilityJson === 'object') {
    const data = availabilityJson as { slots?: string[] };
    if (Array.isArray(data.slots)) {
      data.slots.forEach((slot) => slots.add(slot));
    }
  }

  const isSlotSelected = (day: string, shift: string) =>
    slots.has(`${day}_${shift}`);

  return (
    <div className="w-full">
      <div className="mb-2 grid grid-cols-[40px_repeat(7,1fr)] gap-0.5 sm:grid-cols-[60px_repeat(7,1fr)] sm:gap-1">
        <div />
        {DAYS.map((day) => (
          <div
            key={day}
            className="rounded-md bg-gray-100 py-1 text-center text-[9px] font-medium text-gray-600 sm:py-1.5 sm:text-xs"
          >
            {DAY_LABELS[day]}
          </div>
        ))}
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        {SHIFTS.map((shift) => (
          <div
            key={shift}
            className="grid grid-cols-[40px_repeat(7,1fr)] gap-0.5 sm:grid-cols-[60px_repeat(7,1fr)] sm:gap-1"
          >
            <div className="flex items-center justify-center rounded-md bg-gray-100 py-1.5 text-[9px] font-medium text-gray-600 sm:py-2 sm:text-xs">
              {SHIFT_LABELS[shift]}
            </div>

            {DAYS.map((day) => {
              const isSelected = isSlotSelected(day, shift);
              return (
                <div
                  key={`${day}_${shift}`}
                  className={`flex h-7 items-center justify-center rounded-md border sm:h-9 ${
                    isSelected
                      ? 'border-fuchsia-500 bg-fuchsia-500 text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-300'
                  }`}
                >
                  {isSelected ? (
                    <PiCheck className="size-3 sm:size-4" />
                  ) : (
                    <PiX className="size-3 sm:size-4" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AvailabilityTab({
  nannyData,
  missingFields,
  onSetEditing,
}: AvailabilityTabProps) {
  return (
    <div className="space-y-0">
      {missingFields.availability && (
        <MissingFieldsBanner
          fields={['Disponibilidade semanal']}
          title="Complete sua disponibilidade"
        />
      )}

      {/* Seção: Disponibilidade */}
      <SettingsSection
        title="Disponibilidade"
        description="Seus horários disponíveis durante a semana"
        onEdit={() => onSetEditing(true)}
        isFirst
      >
        {nannyData.availabilityJson ? (
          <div className="overflow-x-auto">
            <AvailabilityGrid availabilityJson={nannyData.availabilityJson} />
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-gray-400">
              Nenhuma disponibilidade configurada ainda.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => onSetEditing(true)}
            >
              Configurar Disponibilidade
            </Button>
          </div>
        )}
      </SettingsSection>
    </div>
  );
}
