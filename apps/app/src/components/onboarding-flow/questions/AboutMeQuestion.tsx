'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PiCircleNotch } from 'react-icons/pi';
import { Field, FieldDescription, FieldError } from '@/components/ui/shadcn/field';
import { RichTextEditor, getPlainTextLength } from '@/components/ui/RichTextEditor';
import { isSafeText } from '@/services/content-moderation';
import { secureStorage } from '@/lib/onboarding-storage';
import { FlowQuestion } from '../FlowProvider';

const STORAGE_KEY = 'nanny-onboarding-data';
const GENERATED_BIO_KEY = 'nanny-generated-bio';

interface AboutMeQuestionProps {
  question: FlowQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string | null;
}

export function AboutMeQuestion({ question, value, onChange, error }: AboutMeQuestionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [contactWarning, setContactWarning] = useState<string | null>(null);
  const hasTriedAutoGenerate = useRef(false);

  const minLength = question.minLength || 200;
  const maxLength = question.maxLength || 2000;
  const charCount = getPlainTextLength(value || '');

  // Load previously generated content
  useEffect(() => {
    // Check for previously generated bio if no value
    if (!value || value.trim().length === 0) {
      const generatedBio = secureStorage.getItem(GENERATED_BIO_KEY);
      if (generatedBio && generatedBio.trim().length > 0) {
        onChange(generatedBio);
      }
    }
  }, []);

  // Validate contact info with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value && value.length > 0) {
        const plainText = value.replace(/<[^>]*>/g, '');
        const validation = isSafeText(plainText);
        if (!validation.safe) {
          setContactWarning('Dados de contato detectados. Remova telefones, e-mails ou redes sociais.');
        } else {
          setContactWarning(null);
        }
      } else {
        setContactWarning(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Generate bio function
  const generateBio = useCallback(async () => {
    setIsGenerating(true);
    try {
      const savedData = secureStorage.getItem(STORAGE_KEY);
      if (!savedData) {
        console.error('No saved data found');
        return null;
      }

      const parsed = JSON.parse(savedData);

      const response = await fetch('/api/nannies/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Gênero para linguagem correta
          gender: parsed.gender,
          // Tipo de trabalho e contratação
          nannyType: parsed.nannyType,
          contractRegime: parsed.contractRegime,
          // Experiência
          experienceYears: parsed.experienceYears !== undefined ? Number(parsed.experienceYears) : undefined,
          childAgeExperiences: parsed.childAgeExperiences,
          maxChildrenCare: parsed.maxChildrenCare !== undefined ? Number(parsed.maxChildrenCare) : undefined,
          // Preferências
          hasCnh: parsed.hasCnh,
          isSmoker: parsed.isSmoker,
          comfortableWithPets: parsed.comfortableWithPets,
          // Pontos fortes e atividades
          strengths: parsed.strengths,
          acceptedActivities: parsed.acceptedActivities,
          activitiesNotAccepted: parsed.activitiesNotAccepted,
          // Disponibilidade e valor
          availability: parsed.availability,
          hourlyRateRange: parsed.hourlyRateRange,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate bio');
      }

      const result = await response.json();
      if (result.bio) {
        onChange(result.bio);
        secureStorage.setItem(GENERATED_BIO_KEY, result.bio);
        return result.bio;
      }
      return null;
    } catch (error) {
      console.error('Error generating bio:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [onChange]);

  // Auto-generate bio on mount if no existing content
  useEffect(() => {
    if (!hasTriedAutoGenerate.current && (!value || value.trim().length === 0)) {
      const generatedBio = secureStorage.getItem(GENERATED_BIO_KEY);
      if (!generatedBio || generatedBio.trim().length === 0) {
        hasTriedAutoGenerate.current = true;
        generateBio();
      }
    }
  }, [generateBio, value]);

  const isBelowMin = charCount < minLength;
  const isAboveMax = charCount > maxLength;

  return (
    <div className="space-y-6">
      {/* About Me Section */}
      <Field data-invalid={!!error || !!contactWarning || isAboveMax}>
        {isGenerating && !value ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-md border bg-gray-50">
            <div className="flex flex-col items-center gap-3">
              <PiCircleNotch className="h-8 w-8 animate-spin text-fuchsia-500" />
              <p className="text-sm text-gray-500">Gerando sua bio com IA...</p>
            </div>
          </div>
        ) : (
          <RichTextEditor
            value={value || ''}
            onChange={onChange}
            placeholder="Sua apresentação será gerada automaticamente..."
          />
        )}

        <FieldDescription className={isBelowMin ? 'text-amber-600' : isAboveMax ? 'text-red-500' : 'text-green-600'}>
          {charCount} caracteres (mínimo {minLength}, máximo {maxLength})
        </FieldDescription>

        {contactWarning && (
          <FieldError>{contactWarning}</FieldError>
        )}
        {error && <FieldError>{error}</FieldError>}
      </Field>

      {/* Tips */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-medium text-blue-900">Dicas para personalizar:</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
          <li>Revise o texto gerado e ajuste conforme necessário</li>
          <li>Adicione detalhes pessoais que te diferenciam</li>
          <li>Compartilhe o que te motiva nessa profissão</li>
        </ul>
      </div>
    </div>
  );
}
