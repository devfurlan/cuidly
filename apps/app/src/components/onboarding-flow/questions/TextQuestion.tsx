'use client';

import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/shadcn/input';
import { Field, FieldError } from '@/components/ui/shadcn/field';
import { FlowQuestion } from '../FlowProvider';

interface TextQuestionProps {
  question: FlowQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  error?: string | null;
}

export function TextQuestion({ question, value, onChange, onSubmit, error }: TextQuestionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [question.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (question.mask) {
      newValue = question.mask(newValue);
    }
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Field data-invalid={!!error}>
      <Input
        ref={inputRef}
        type="text"
        value={value || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={question.placeholder}
        maxLength={question.maxLength}
        className="h-12 bg-white text-base"
        aria-invalid={!!error}
      />
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
