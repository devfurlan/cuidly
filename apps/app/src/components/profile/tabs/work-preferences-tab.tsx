'use client';

import { PiCheck, PiX } from 'react-icons/pi';

import { MissingFieldsBanner } from '@/components/profile/missing-fields-banner';
import {
  EmptyValue,
  FieldGrid,
  FieldItem,
  SettingsSection,
} from '@/components/profile/settings-section';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import {
  getAcceptsHolidayWorkLabel,
  getContractRegimeLabel,
  getHourlyRateRangeLabel,
  getMaxChildrenCareLabel,
  getMaxTravelDistanceLabel,
  getNannyTypeLabel,
} from '@/helpers/label-getters';

import type { WorkPreferencesTabProps } from '../types';

// Availability Grid constants
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

export function WorkPreferencesTab({
  nannyData,
  missingFields,
  onEditClick,
  onSetEditingAvailability,
}: WorkPreferencesTabProps) {
  // Handler para Modelo de Trabalho
  const handleEditWorkModel = () => {
    onEditClick('work-model', {
      nannyTypes: nannyData.nannyTypes || [],
      contractRegimes: nannyData.contractRegimes || [],
      acceptsHolidayWork: nannyData.acceptsHolidayWork,
    });
  };

  // Handler para Valores e Limites
  const handleEditValues = () => {
    onEditClick('work-values', {
      hourlyRateRange: nannyData.hourlyRateRange,
      maxChildrenCare: nannyData.maxChildrenCare,
    });
  };

  // Handler para Logística
  const handleEditLogistics = () => {
    onEditClick('work-logistics', {
      maxTravelDistance: nannyData.maxTravelDistance,
    });
  };

  // Combine missing fields from workPreferences and availability
  const allMissingFields = [
    ...missingFields.workPreferences,
    ...(missingFields.availability ? ['Disponibilidade semanal'] : []),
  ];

  return (
    <div className="space-y-0">
      <MissingFieldsBanner
        fields={allMissingFields}
        title="Complete suas preferências de trabalho"
      />

      {/* Seção: Disponibilidade */}
      <SettingsSection
        title="Disponibilidade"
        description="Seus horários preferidos de trabalho"
        onEdit={() => onSetEditingAvailability(true)}
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
              onClick={() => onSetEditingAvailability(true)}
            >
              Configurar Disponibilidade
            </Button>
          </div>
        )}
      </SettingsSection>

      {/* Seção: Modelo de Trabalho */}
      <SettingsSection
        title="Modelo de trabalho"
        description="Como você prefere trabalhar"
        onEdit={handleEditWorkModel}
        isFirst
      >
        <FieldGrid>
          <FieldItem label="Tipo de babá">
            {(nannyData.nannyTypes?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {nannyData.nannyTypes.map((type) => (
                  <Badge key={type} className="font-normal" size={'lg'}>
                    {getNannyTypeLabel(type)}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptyValue />
            )}
          </FieldItem>

          <FieldItem label="Regime de contratação">
            {(nannyData.contractRegimes?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {nannyData.contractRegimes.map((regime) => (
                  <Badge key={regime} className="font-normal" size={'lg'}>
                    {getContractRegimeLabel(regime)}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptyValue />
            )}
          </FieldItem>

          <FieldItem label="Trabalha em feriados">
            {nannyData.acceptsHolidayWork ? (
              getAcceptsHolidayWorkLabel(nannyData.acceptsHolidayWork)
            ) : (
              <EmptyValue />
            )}
          </FieldItem>
        </FieldGrid>
      </SettingsSection>

      {/* Seção: Valores e Limites */}
      <SettingsSection
        title="Valores e limites"
        description="Sua faixa de valores e capacidade"
        onEdit={handleEditValues}
      >
        <FieldGrid>
          <FieldItem label="Faixa de valor por hora">
            {nannyData.hourlyRateRange ? (
              <span className="font-medium">
                {getHourlyRateRangeLabel(nannyData.hourlyRateRange)}
              </span>
            ) : (
              <EmptyValue />
            )}
          </FieldItem>

          <FieldItem label="Máximo de crianças">
            {nannyData.maxChildrenCare ? (
              getMaxChildrenCareLabel(nannyData.maxChildrenCare)
            ) : (
              <EmptyValue />
            )}
          </FieldItem>
        </FieldGrid>
      </SettingsSection>

      {/* Seção: Logística */}
      <SettingsSection
        title="Logística"
        description="Raio de deslocamento"
        onEdit={handleEditLogistics}
      >
        <FieldGrid>
          <FieldItem label="Raio de deslocamento">
            {nannyData.maxTravelDistance ? (
              getMaxTravelDistanceLabel(nannyData.maxTravelDistance)
            ) : (
              <EmptyValue />
            )}
          </FieldItem>
        </FieldGrid>
      </SettingsSection>
    </div>
  );
}
