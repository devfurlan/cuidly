'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/shadcn/alert';
import { Field, FieldError } from '@/components/ui/shadcn/field';
import { cn } from '@cuidly/shared';
import { PiCheckCircleFill, PiLightbulbDuotone } from 'react-icons/pi';
import { FlowQuestion } from '../FlowProvider';

interface RadioQuestionProps {
  question: FlowQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  error?: string | null;
}

export function RadioQuestion({
  question,
  value,
  onChange,
  onSubmit,
  error,
}: RadioQuestionProps) {
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    // Auto-advance after a short delay to show the selection
    // Use requestAnimationFrame to ensure React has processed the state update
    if (onSubmit) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          onSubmit();
        }, 150);
      });
    }
  };

  // Check if any option has a description
  const hasDescriptions = question.options?.some((opt) => opt.description);

  return (
    <Field data-invalid={!!error}>
      <div className="grid gap-3">
        {question.options?.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                'flex items-center justify-between rounded-lg border-2 bg-white/40 text-left transition-all',
                hasDescriptions ? 'p-3' : 'p-4',
                isSelected
                  ? 'border-fuchsia-500 bg-white'
                  : 'border-gray-200 hover:border-fuchsia-300 hover:bg-fuchsia-50',
              )}
            >
              <div className="flex-1">
                <span
                  className={cn(
                    'text-base font-medium',
                    isSelected ? 'text-fuchsia-900' : 'text-gray-400',
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <p
                    className={cn(
                      'mt-0.5 text-xs',
                      isSelected ? 'text-fuchsia-600' : 'text-gray-400',
                    )}
                  >
                    {option.description}
                  </p>
                )}
              </div>
              {isSelected && (
                <PiCheckCircleFill className="ml-3 size-6 shrink-0 text-fuchsia-500" />
              )}
            </button>
          );
        })}
      </div>
      {error && <FieldError>{error}</FieldError>}

      {question.hint && (
        <Alert variant="info" className="mt-4">
          <PiLightbulbDuotone />
          <AlertTitle>{question.hint.title}</AlertTitle>
          {question.hint.description && (
            <AlertDescription className="text-sm text-gray-600">
              {question.hint.description}
            </AlertDescription>
          )}
        </Alert>
      )}
    </Field>
  );
}
