'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PiCircleNotch } from 'react-icons/pi';
import { RichTextEditor, getPlainTextLength } from '@/components/ui/RichTextEditor';
import { Field, FieldDescription, FieldError } from '@/components/ui/shadcn/field';
import type { FlowQuestion } from '../FlowProvider';

interface AIGeneratedTextQuestionProps {
  question: FlowQuestion;
  value?: string | null;
  onChange: (value: string) => void;
  formData?: Record<string, unknown>;
  generateEndpoint?: string;
  error?: string | null;
}

export function AIGeneratedTextQuestion({
  question,
  value,
  onChange,
  formData,
  generateEndpoint,
  error,
}: AIGeneratedTextQuestionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const hasTriedAutoGenerate = useRef(false);

  const maxLength = question.maxLength || 2000;
  const charCount = getPlainTextLength(value || '');

  // Generate text function
  const handleGenerate = useCallback(async () => {
    if (!generateEndpoint || !formData) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(generateEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.text || data.content || '';
        onChange(generatedText);
      } else {
        console.error('Error generating text');
      }
    } catch (error) {
      console.error('Error generating text:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [generateEndpoint, formData, onChange]);

  // Auto-generate on mount if no existing value and endpoint is available
  useEffect(() => {
    if (!hasTriedAutoGenerate.current && generateEndpoint && formData && (!value || value.trim().length === 0)) {
      hasTriedAutoGenerate.current = true;
      handleGenerate();
    }
  }, [generateEndpoint, formData, value, handleGenerate]);

  const isAboveMax = charCount > maxLength;

  return (
    <Field data-invalid={!!error || isAboveMax}>
      {isGenerating && !value ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-md border bg-gray-50">
          <div className="flex flex-col items-center gap-3">
            <PiCircleNotch className="size-8 animate-spin text-fuchsia-500" />
            <p className="text-sm text-gray-500">Gerando texto com IA...</p>
          </div>
        </div>
      ) : (
        <RichTextEditor
          value={value || ''}
          onChange={onChange}
          placeholder={question.placeholder || 'O texto será gerado automaticamente...'}
        />
      )}

      <FieldDescription className={isAboveMax ? 'text-red-500' : ''}>
        {charCount}/{maxLength} caracteres
      </FieldDescription>

      {/* Skip hint for optional */}
      {!question.required && !value && !isGenerating && (
        <FieldDescription className="text-center">
          Você pode pular esta etapa e editar o texto depois
        </FieldDescription>
      )}

      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
