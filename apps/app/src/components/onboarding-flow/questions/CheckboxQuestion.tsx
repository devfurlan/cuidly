'use client';

import {
  Field,
  FieldDescription,
  FieldError,
} from '@/components/ui/shadcn/field';
import { cn } from '@cuidly/shared';
import { PiCheckSquareFill, PiSquare } from 'react-icons/pi';
import { FlowQuestion } from '../FlowProvider';

interface CheckboxQuestionProps {
  question: FlowQuestion;
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  error?: string | null;
}

export function CheckboxQuestion({
  question,
  value = [],
  onChange,
  error,
}: CheckboxQuestionProps) {
  const maxSelections = question.maxSelections;

  const toggleOption = (optionValue: string) => {
    const currentValues = value || [];
    const isSelected = currentValues.includes(optionValue);

    if (isSelected) {
      onChange(currentValues.filter((v) => v !== optionValue));
    } else {
      if (maxSelections && currentValues.length >= maxSelections) {
        // Replace the first selected item
        const newValues = [...currentValues.slice(1), optionValue];
        onChange(newValues);
      } else {
        onChange([...currentValues, optionValue]);
      }
    }
  };

  return (
    <Field data-invalid={!!error}>
      {maxSelections && (
        <FieldDescription className="mb-3 text-center">
          Selecione até {maxSelections} opções ({value?.length || 0}/
          {maxSelections})
        </FieldDescription>
      )}
      <div className="grid gap-3">
        {question.options?.map((option) => {
          const isSelected = value?.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleOption(option.value)}
              className={cn(
                'flex items-center justify-between rounded-lg border-2 bg-white/40 p-4 text-left transition-all',
                isSelected
                  ? 'border-fuchsia-500 bg-white'
                  : 'border-gray-200 hover:border-fuchsia-300 hover:bg-fuchsia-50',
              )}
            >
              <div className="flex flex-col">
                <span
                  className={cn(
                    'text-base font-medium',
                    isSelected ? 'text-fuchsia-900' : 'text-gray-500',
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <span
                    className={cn(
                      'text-sm',
                      isSelected ? 'text-gray-500' : 'text-gray-300',
                    )}
                  >
                    {option.description}
                  </span>
                )}
              </div>
              {isSelected ? (
                <PiCheckSquareFill className="size-6 shrink-0 text-fuchsia-500" />
              ) : (
                <PiSquare className="size-6 shrink-0 text-gray-300" />
              )}
            </button>
          );
        })}
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
