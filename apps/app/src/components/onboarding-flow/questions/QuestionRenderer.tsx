'use client';

import { FlowQuestion } from '../FlowProvider';
import { AddressQuestion } from './AddressQuestion';
import { TextQuestion } from './TextQuestion';
import { DateQuestion } from './DateQuestion';
import { SelectQuestion } from './SelectQuestion';
import { RadioQuestion } from './RadioQuestion';
import { CheckboxQuestion } from './CheckboxQuestion';
import { TextareaQuestion } from './TextareaQuestion';
import { AboutMeQuestion } from './AboutMeQuestion';
import { PhotoQuestion } from './PhotoQuestion';
import { MultiPhotoQuestion } from './MultiPhotoQuestion';
import { AIGeneratedTextQuestion } from './AIGeneratedTextQuestion';
import { ChildrenSectionQuestion } from './ChildrenSectionQuestion';
import type { ChildData } from './ChildrenSectionQuestion';
import { AvailabilitySectionQuestion } from './AvailabilitySectionQuestion';
import type { AvailabilityData } from '@/schemas/family-onboarding';

interface QuestionRendererProps {
  question: FlowQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
  onSubmit?: () => void;
  onExtraFieldChange?: (field: string, value: unknown) => void;
  addressErrors?: Record<string, string>;
  formData?: Record<string, unknown>;
  error?: string | null;
  userType?: 'family' | 'nanny';
}

export function QuestionRenderer({ question, value, onChange, onSubmit, onExtraFieldChange, addressErrors, formData, error, userType = 'family' }: QuestionRendererProps) {
  // Special case for aboutMe field - use AI-powered component
  if (question.field === 'aboutMe') {
    return (
      <AboutMeQuestion
        question={question}
        value={value as string | undefined}
        onChange={onChange}
        error={error}
      />
    );
  }

  switch (question.type) {
    case 'text':
      return (
        <TextQuestion
          question={question}
          value={value as string | undefined}
          onChange={onChange}
          onSubmit={onSubmit}
          error={error}
        />
      );

    case 'date':
      return (
        <DateQuestion
          question={question}
          value={value as string | undefined}
          onChange={onChange}
          onSubmit={onSubmit}
          error={error}
        />
      );

    case 'select':
      return (
        <SelectQuestion
          question={question}
          value={value as string | undefined}
          onChange={onChange}
          onSubmit={onSubmit}
          error={error}
        />
      );

    case 'radio':
      return (
        <RadioQuestion
          question={question}
          value={value as string | undefined}
          onChange={onChange}
          onSubmit={onSubmit}
          error={error}
        />
      );

    case 'checkbox':
      return (
        <CheckboxQuestion
          question={question}
          value={value as string[] | undefined}
          onChange={onChange}
          error={error}
        />
      );

    case 'textarea':
      return (
        <TextareaQuestion
          question={question}
          value={value as string | undefined}
          onChange={onChange}
          error={error}
        />
      );

    case 'address':
      return (
        <AddressQuestion
          value={value as { zipCode: string; streetName: string; number: string; complement: string; neighborhood: string; city: string; state: string } | undefined}
          onChange={onChange}
          errors={addressErrors}
          userType={userType}
        />
      );

    case 'custom':
      // Will be handled by custom components passed to the flow
      return null;

    case 'photo':
      return (
        <PhotoQuestion
          question={question}
          value={value as string | null | undefined}
          onChange={onChange}
        />
      );

    case 'multi-photo':
      return (
        <MultiPhotoQuestion
          question={question}
          value={value as string[] | null | undefined}
          onChange={onChange}
        />
      );

    case 'ai-generated-text':
      return (
        <AIGeneratedTextQuestion
          question={question}
          value={value as string | null | undefined}
          onChange={onChange}
          formData={formData}
          generateEndpoint={question.generateEndpoint}
          error={error}
        />
      );

    case 'children-section':
      return (
        <ChildrenSectionQuestion
          value={value as ChildData[] || []}
          onChange={onChange as (children: ChildData[]) => void}
          error={error}
        />
      );

    case 'availability-section':
      return (
        <AvailabilitySectionQuestion
          value={value as AvailabilityData | undefined}
          onChange={onChange as (value: AvailabilityData) => void}
          error={error}
        />
      );

    default:
      return (
        <p className="text-center text-gray-500">
          Tipo de pergunta não suportado: {question.type}
        </p>
      );
  }
}
