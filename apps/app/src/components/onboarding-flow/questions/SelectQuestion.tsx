'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { Field, FieldError } from '@/components/ui/shadcn/field';
import { FlowQuestion } from '../FlowProvider';

interface SelectQuestionProps {
  question: FlowQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  error?: string | null;
}

export function SelectQuestion({ question, value, onChange, onSubmit, error }: SelectQuestionProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue);
    // Auto-advance after selection
    // Use requestAnimationFrame to ensure React has processed the state update
    if (onSubmit) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          onSubmit();
        }, 150);
      });
    }
  };

  return (
    <Field data-invalid={!!error}>
      <Select value={value || ''} onValueChange={handleChange}>
        <SelectTrigger className="h-12 bg-white text-base" aria-invalid={!!error}>
          <SelectValue placeholder={question.placeholder || 'Selecione uma opção'} />
        </SelectTrigger>
        <SelectContent>
          {question.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
