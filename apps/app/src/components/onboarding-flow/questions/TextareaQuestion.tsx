'use client';

import { Textarea } from '@/components/ui/shadcn/textarea';
import { Field, FieldDescription, FieldError } from '@/components/ui/shadcn/field';
import { FlowQuestion } from '../FlowProvider';

interface TextareaQuestionProps {
  question: FlowQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string | null;
}

export function TextareaQuestion({ question, value, onChange, error }: TextareaQuestionProps) {
  const charCount = value?.length || 0;
  const minLength = question.minLength || 0;
  const maxLength = question.maxLength || 2000;
  const isBelowMin = minLength > 0 && charCount < minLength;

  return (
    <Field data-invalid={!!error || isBelowMin}>
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        maxLength={maxLength}
        className="min-h-[150px] bg-white text-base"
        rows={6}
        aria-invalid={!!error || isBelowMin}
      />
      <div className="flex justify-between text-xs text-gray-500">
        {minLength > 0 && (
          <FieldDescription className={isBelowMin ? 'text-amber-600' : ''}>
            Mínimo: {minLength} caracteres
          </FieldDescription>
        )}
        <FieldDescription className="ml-auto">
          {charCount}/{maxLength}
        </FieldDescription>
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
