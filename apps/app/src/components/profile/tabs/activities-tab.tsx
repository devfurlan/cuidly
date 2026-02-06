'use client';

import { MissingFieldsBanner } from '@/components/profile/missing-fields-banner';
import {
  EmptyValue,
  FieldGrid,
  FieldItem,
  SettingsSection,
} from '@/components/profile/settings-section';
import { Badge } from '@/components/ui/shadcn/badge';
import {
  getActivityLabel,
  getActivityNotAcceptedLabel,
  getCareMethodologyLabel,
  getChildTypeLabel,
} from '@/helpers/label-getters';

import type { NannyTabProps } from '../types';

const comfortWithPetsLabels: Record<string, string> = {
  YES_ANY: 'Sim, fico confortável com qualquer animal',
  ONLY_SOME: 'Depende do animal',
  NO: 'Não me sinto confortável com animais',
};

const parentPresenceLabels: Record<string, string> = {
  PRESENT: 'Prefiro que os pais estejam presentes',
  ABSENT: 'Prefiro trabalhar sem os pais por perto',
  NO_PREFERENCE: 'Sem preferência',
};

export function ActivitiesTab({
  nannyData,
  missingFields,
  onEditClick,
}: NannyTabProps) {
  // Handler para Atividades que Aceita
  const handleEditAcceptedActivities = () => {
    onEditClick('activities-accepted', {
      acceptedActivities: nannyData.acceptedActivities || [],
    });
  };

  // Handler para Atividades que Não Aceita
  const handleEditNotAcceptedActivities = () => {
    onEditClick('activities-not-accepted', {
      activitiesNotAccepted: nannyData.activitiesNotAccepted || [],
    });
  };

  // Handler para Preferências de Ambiente
  const handleEditEnvironment = () => {
    onEditClick('activities-environment', {
      comfortableWithPets: nannyData.comfortableWithPets,
      petsDescription: nannyData.petsDescription,
      parentPresencePreference: nannyData.parentPresencePreference,
      childTypePreference: nannyData.childTypePreference || [],
      careMethodology: nannyData.careMethodology,
    });
  };

  return (
    <div className="space-y-0">
      <MissingFieldsBanner
        fields={missingFields.activities}
        title="Complete suas atividades"
      />

      {/* Seção: Atividades que Aceita */}
      <SettingsSection
        title="Atividades que aceita"
        description="Tarefas que você realiza"
        onEdit={handleEditAcceptedActivities}
        isFirst
      >
        {(nannyData.acceptedActivities?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {nannyData.acceptedActivities.map((activity) => (
              <Badge
                key={activity}
                variant="fuchsia"
                className="font-normal"
                size={'lg'}
              >
                {getActivityLabel(activity)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Nenhuma atividade selecionada
          </p>
        )}
      </SettingsSection>

      {/* Seção: Atividades que Não Aceita */}
      <SettingsSection
        title="Atividades que não aceita"
        description="Tarefas que você não realiza"
        onEdit={handleEditNotAcceptedActivities}
      >
        {(nannyData.activitiesNotAccepted?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {nannyData.activitiesNotAccepted.map((activity) => (
              <Badge
                key={activity}
                variant="destructive-outline"
                className="font-normal"
                size={'lg'}
              >
                {getActivityNotAcceptedLabel(activity)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Nenhuma restrição selecionada
          </p>
        )}
      </SettingsSection>

      {/* Seção: Preferências de Ambiente */}
      <SettingsSection
        title="Preferências de ambiente"
        description="Como você prefere trabalhar"
        onEdit={handleEditEnvironment}
      >
        <FieldGrid>
          <FieldItem label="Conforto com pets">
            {nannyData.comfortableWithPets ? (
              comfortWithPetsLabels[nannyData.comfortableWithPets] ||
              nannyData.comfortableWithPets
            ) : (
              <EmptyValue />
            )}
          </FieldItem>

          <FieldItem label="Presença dos pais">
            {nannyData.parentPresencePreference
              ? parentPresenceLabels[nannyData.parentPresencePreference] ||
                nannyData.parentPresencePreference
              : parentPresenceLabels['NO_PREFERENCE']}
          </FieldItem>

          <FieldItem label="Preferência de tipo de criança" fullWidth>
            {(nannyData.childTypePreference?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {nannyData.childTypePreference.map((pref) => (
                  <Badge
                    key={pref}
                    variant="fuchsia"
                    className="font-normal"
                    size={'lg'}
                  >
                    {getChildTypeLabel(pref)}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptyValue />
            )}
          </FieldItem>

          <FieldItem label="Metodologia de cuidado" fullWidth>
            {nannyData.careMethodology
              ? getCareMethodologyLabel(nannyData.careMethodology)
              : getCareMethodologyLabel('NONE')}
          </FieldItem>
        </FieldGrid>
      </SettingsSection>
    </div>
  );
}
