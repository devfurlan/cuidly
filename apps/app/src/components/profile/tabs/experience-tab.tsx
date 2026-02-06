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
  getAgeRangeLabel,
  getExperienceYearsLabel,
  getLanguageLabel,
  getStrengthLabel,
} from '@/helpers/label-getters';

import type { NannyTabProps } from '../types';

export function ExperienceTab({
  nannyData,
  missingFields,
  onEditClick,
}: NannyTabProps) {
  // Handler para Experiência (anos, idiomas, necessidades especiais)
  const handleEditExperience = () => {
    onEditClick('experience', {
      experienceYears: nannyData.experienceYears,
      languages: nannyData.languages || [],
      hasSpecialNeedsExperience: nannyData.hasSpecialNeedsExperience,
      specialNeedsExperienceDescription:
        nannyData.specialNeedsExperienceDescription,
    });
  };

  // Handler para Faixas Etárias
  const handleEditAgeRanges = () => {
    onEditClick('age-ranges', {
      ageRangesExperience: nannyData.ageRangesExperience || [],
    });
  };

  // Handler para Pontos Fortes
  const handleEditStrengths = () => {
    onEditClick('strengths', {
      strengths: nannyData.strengths || [],
    });
  };

  return (
    <div className="space-y-0">
      <MissingFieldsBanner
        fields={missingFields.experience}
        title="Complete sua experiência"
      />

      {/* Seção: Experiência */}
      <SettingsSection
        title="Experiência"
        description="Seu tempo de atuação e qualificações"
        onEdit={handleEditExperience}
        isFirst
      >
        <FieldGrid>
          <FieldItem label="Anos de experiência">
            {nannyData.experienceYears !== null ? (
              getExperienceYearsLabel(nannyData.experienceYears)
            ) : (
              <EmptyValue />
            )}
          </FieldItem>

          <FieldItem label="Idiomas">
            {nannyData.languages && nannyData.languages.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {nannyData.languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="font-normal">
                    {getLanguageLabel(lang)}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptyValue text="Nenhum idioma adicionado" />
            )}
          </FieldItem>

          <FieldItem label="Experiência com necessidades especiais" fullWidth>
            {nannyData.hasSpecialNeedsExperience ? (
              nannyData.specialNeedsExperienceDescription ||
              'Tenho experiência com crianças com necessidades especiais'
            ) : (
              <EmptyValue text="Não possui" />
            )}
          </FieldItem>
        </FieldGrid>
      </SettingsSection>

      {/* Seção: Faixas etárias */}
      <SettingsSection
        title="Faixas etárias"
        description="Idades com que você trabalha"
        onEdit={handleEditAgeRanges}
      >
        {(nannyData.ageRangesExperience?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {nannyData.ageRangesExperience.map((range) => (
              <Badge key={range} className="font-normal" size={'lg'}>
                {getAgeRangeLabel(range)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Nenhuma faixa etária selecionada
          </p>
        )}
      </SettingsSection>

      {/* Seção: Pontos fortes */}
      <SettingsSection
        title="Pontos fortes"
        description="Suas principais habilidades"
        onEdit={handleEditStrengths}
      >
        {(nannyData.strengths?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {nannyData.strengths.map((strength) => (
              <Badge key={strength} className="font-normal" size={'lg'}>
                {getStrengthLabel(strength)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Nenhum ponto forte selecionado
          </p>
        )}
      </SettingsSection>
    </div>
  );
}
