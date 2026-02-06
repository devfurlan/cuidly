'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

import { ProfilePhotoUpload } from '@/components/profile/profile-photo-upload';
import { Card } from '@/components/ui/shadcn/card';
import {
  calculateProgress,
  getNextDestination,
  getPrevDestination,
  getQuestion,
  NannyFormData,
} from '@/lib/onboarding-flow/nanny-questions';
import { secureStorage } from '@/lib/onboarding-storage';
import { createClient } from '@/utils/supabase/client';

import { FlowNavigation } from './FlowNavigation';
import { FlowProgress } from './FlowProgress';
import { FlowTransition } from './FlowTransition';
import { QuestionCard } from './QuestionCard';
import { QuestionRenderer } from './questions/QuestionRenderer';

const STORAGE_KEY = 'nanny-onboarding-data';
const GENERATED_BIO_KEY = 'nanny-generated-bio';
const GENERATED_MINI_BIO_KEY = 'nanny-generated-mini-bio';

interface NannyQuestionFlowProps {
  questionIndex: number; // q param (1-based)
  conditionalIndex?: number; // qc param (1-based)
}

export function NannyQuestionFlow({
  questionIndex,
  conditionalIndex,
}: NannyQuestionFlowProps) {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [formData, setFormData] = useState<NannyFormData>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>(
    {},
  );

  // Photo-specific state (for q=32)
  const [nannyId, setNannyId] = useState<number | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  // Keep a ref to the latest formData for synchronous access
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Get current question
  const question = getQuestion(questionIndex, conditionalIndex, formData);

  // Calculate progress
  const progress = calculateProgress(questionIndex, conditionalIndex, formData);

  // Check if this is the photo question (by question id, not position)
  const isPhotoQuestion = question?.id === 'photo';

  // Load saved data on mount
  useEffect(() => {
    async function loadData() {
      // Check auth
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Load from secure storage
      const savedData = secureStorage.getItem(STORAGE_KEY);
      let parsedData: NannyFormData = {};
      if (savedData) {
        try {
          parsedData = JSON.parse(savedData);
          setFormData(parsedData);
          formDataRef.current = parsedData;
        } catch (e) {
          console.error('Error loading saved data:', e);
        }
      }

      // If photo question, first save data to API to create the nanny record
      if (isPhotoQuestion) {
        try {
          // First, save partial data to create/update nanny record
          if (Object.keys(parsedData).length > 0) {
            const saveResponse = await fetch('/api/nannies/save-partial', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(parsedData),
            });

            if (!saveResponse.ok) {
              const errorText = await saveResponse.text().catch(() => '');
              let errorData: { error?: string } = {};
              try {
                errorData = errorText ? JSON.parse(errorText) : {};
              } catch {
                // Response was not JSON
              }
              console.error(
                `Error saving nanny data before photo: status=${saveResponse.status}, error=${errorData.error || errorText || 'Unknown error'}`,
              );
            }
          }

          // Now load nanny data
          const response = await fetch('/api/nannies/me');
          if (response.ok) {
            const data = await response.json();
            if (data.nanny) {
              setNannyId(data.nanny.id);
              setCurrentPhotoUrl(data.nanny.photoUrl);
              setUserName(data.nanny.name || '');
            }
          }
        } catch (error) {
          console.error('Error loading nanny data:', error);
        }
      }

      setIsLoading(false);
    }
    loadData();
  }, [router, supabase, isPhotoQuestion]);

  // Auto-save to storage on form data change
  useEffect(() => {
    if (!isLoading && Object.keys(formData).length > 0) {
      const existingData = secureStorage.getItem(STORAGE_KEY);
      const existing = existingData ? JSON.parse(existingData) : {};
      secureStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...existing, ...formData }),
      );
    }
  }, [formData, isLoading]);

  // Update field
  const updateField = useCallback((field: string, value: unknown) => {
    formDataRef.current = { ...formDataRef.current, [field]: value };
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  // Apply defaultValue if the field is undefined and question has defaultValue
  useEffect(() => {
    if (!isLoading && question?.defaultValue !== undefined) {
      const currentValue = formDataRef.current[question.field];
      if (currentValue === undefined) {
        updateField(question.field, question.defaultValue);
      }
    }
  }, [isLoading, question, updateField]);

  // Validate current question
  const validateCurrentQuestion = useCallback((): boolean => {
    if (!question) return true;

    const value = formDataRef.current[question.field];

    // Special validation for address type
    if (question.type === 'address') {
      const address = value as
        | {
            zipCode?: string;
            streetName?: string;
            neighborhood?: string;
            city?: string;
            state?: string;
          }
        | undefined;
      const errors: Record<string, string> = {};

      if (!address?.zipCode || address.zipCode.length < 9) {
        errors.zipCode = 'CEP é obrigatório';
      }
      if (!address?.streetName) {
        errors.streetName = 'Logradouro é obrigatório';
      }
      if (!address?.neighborhood) {
        errors.neighborhood = 'Bairro é obrigatório';
      }
      if (!address?.city) {
        errors.city = 'Cidade é obrigatória';
      }
      if (!address?.state || address.state.length < 2) {
        errors.state = 'Estado é obrigatório';
      }

      if (Object.keys(errors).length > 0) {
        setAddressErrors(errors);
        return false;
      }
      setAddressErrors({});
      return true;
    }

    // Special validation for preferences-section type
    if (question.type === 'preferences-section') {
      const prefs = value as
        | {
            hasCnh?: string;
            isSmoker?: string;
            comfortableWithPets?: string;
          }
        | undefined;

      if (!prefs?.hasCnh) {
        setError('Responda se você possui CNH');
        return false;
      }
      if (!prefs?.isSmoker) {
        setError('Responda se você é fumante');
        return false;
      }
      if (!prefs?.comfortableWithPets) {
        setError('Responda sobre animais de estimação');
        return false;
      }
      return true;
    }

    // Check required for other types
    if (question.required) {
      if (value === undefined || value === null || value === '') {
        setError('Este campo é obrigatório');
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        setError('Selecione pelo menos uma opção');
        return false;
      }
    }

    // Check validation schema
    if (question.validation) {
      const result = (question.validation as z.ZodSchema).safeParse(value);
      if (!result.success) {
        setError(result.error.errors[0]?.message || 'Valor inválido');
        return false;
      }
    }

    setError(null);
    return true;
  }, [question]);

  // Navigate to URL
  const navigateTo = useCallback(
    (dest: { q: number; qc?: number } | 'complete' | 'exit') => {
      if (dest === 'complete') {
        // Clear storage and go to complete page
        secureStorage.removeItem(STORAGE_KEY);
        secureStorage.removeItem(GENERATED_BIO_KEY);
        secureStorage.removeItem(GENERATED_MINI_BIO_KEY);
        router.push('/app/onboarding/nanny/complete');
      } else if (dest === 'exit') {
        router.push('/app/onboarding/nanny');
      } else {
        const url = dest.qc
          ? `/app/onboarding/nanny?q=${dest.q}&qc=${dest.qc}`
          : `/app/onboarding/nanny?q=${dest.q}`;
        router.push(url);
      }
    },
    [router],
  );

  // Validate CPF uniqueness against API
  const validateCpfUniqueness = useCallback(
    async (cpf: string): Promise<boolean> => {
      try {
        const response = await fetch('/api/check-cpf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf, userType: 'NANNY' }),
        });

        const result = await response.json();

        if (!result.available) {
          setError(result.error || 'Este CPF já está cadastrado');
          return false;
        }

        return true;
      } catch (e) {
        console.error('Error validating CPF:', e);
        setError('Erro ao validar CPF. Tente novamente.');
        return false;
      }
    },
    [],
  );

  // Handle next
  const handleNext = useCallback(async () => {
    // Photo question - just go to next question (photo is optional)
    if (isPhotoQuestion) {
      setDirection('forward');
      const next = getNextDestination(
        questionIndex,
        conditionalIndex,
        formDataRef.current,
      );
      navigateTo(next);
      return;
    }

    // Validate current question
    if (!validateCurrentQuestion()) {
      return;
    }

    // Special validation for CPF field - check uniqueness before proceeding
    if (question?.field === 'cpf') {
      const cpfValue = formDataRef.current.cpf;
      if (cpfValue && typeof cpfValue === 'string') {
        setIsSaving(true);
        const isUnique = await validateCpfUniqueness(cpfValue);
        setIsSaving(false);
        if (!isUnique) {
          return;
        }
      }
    }

    setDirection('forward');

    // Calculate next destination with latest form data
    const next = getNextDestination(
      questionIndex,
      conditionalIndex,
      formDataRef.current,
    );

    // If going to complete, save to API first
    if (next === 'complete') {
      setIsSaving(true);
      try {
        const response = await fetch('/api/nannies/save-partial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formDataRef.current),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Erro ao salvar');
        }

        navigateTo(next);
      } catch (e) {
        console.error('Error saving:', e);
        setError('Erro ao salvar. Tente novamente.');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    navigateTo(next);
  }, [
    isPhotoQuestion,
    validateCurrentQuestion,
    questionIndex,
    conditionalIndex,
    navigateTo,
    question?.field,
    validateCpfUniqueness,
  ]);

  // Handle back
  const handleBack = useCallback(() => {
    setDirection('backward');
    setError(null);

    const prev = getPrevDestination(
      questionIndex,
      conditionalIndex,
      formDataRef.current,
    );

    navigateTo(prev);
  }, [questionIndex, conditionalIndex, navigateTo]);

  // Handle photo change
  const handlePhotoChange = useCallback(
    async (
      photoDataUrl: string | null,
      options?: { validationBypassed?: boolean },
    ) => {
      if (!nannyId) return;

      if (photoDataUrl === null) {
        // Delete photo
        const response = await fetch('/api/profile/photo', {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao remover foto');
        }

        setCurrentPhotoUrl(null);
      } else {
        // Upload photo
        const response = await fetch('/api/profile/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoDataUrl,
            validationBypassed: options?.validationBypassed ?? false,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar foto');
        }

        const result = await response.json();
        setCurrentPhotoUrl(result.url);
      }
    },
    [nannyId],
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
      </div>
    );
  }

  // Invalid question
  if (!question) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Pergunta não encontrada</p>
      </div>
    );
  }

  // Generate unique key for animation
  const questionKey = conditionalIndex
    ? `q${questionIndex}-qc${conditionalIndex}`
    : `q${questionIndex}`;

  // Render photo question
  if (isPhotoQuestion) {
    return (
      <>
        <FlowProgress
          currentGlobalQuestion={progress.current}
          totalGlobalQuestions={progress.total}
          className="mb-8"
        />
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-6 md:py-8">
          <div className="flex min-h-[70vh] flex-col">
            <div className="flex-1">
              <FlowTransition questionKey={questionKey} direction={direction}>
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Foto de Perfil
                    </h1>
                    <p className="mt-2 text-gray-600">
                      Adicione uma foto para que as famílias possam te conhecer
                      melhor
                    </p>
                  </div>

                  <Card className="p-6">
                    <div className="flex flex-col items-center space-y-6">
                      <ProfilePhotoUpload
                        currentPhotoUrl={currentPhotoUrl}
                        userName={userName}
                        onPhotoChange={handlePhotoChange}
                        size="lg"
                      />

                      <div className="max-w-md text-center">
                        <p className="text-sm text-gray-500">
                          Uma boa foto de perfil ajuda as famílias a confiarem
                          em você desde o primeiro contato. Escolha uma foto
                          clara, com boa iluminação e com seu rosto visível.
                        </p>
                      </div>

                      <div className="w-full rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h3 className="font-medium text-blue-900">
                          Como escolher uma boa foto de perfil
                        </h3>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
                          <li> Use uma foto recente e bem nítida</li>
                          <li>
                            Prefira fundo neutro ou um ambiente organizado
                          </li>
                          <li>
                            Mostre seu rosto com clareza e expressão natural
                          </li>
                          <li>
                            Evite óculos escuros, filtros ou fotos cortadas
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              </FlowTransition>
            </div>

            <div className="mt-8">
              <FlowNavigation
                onBack={handleBack}
                onNext={handleNext}
                isLoading={isSaving}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render normal question
  return (
    <>
      <FlowProgress
        currentGlobalQuestion={progress.current}
        totalGlobalQuestions={progress.total}
        className="mb-8"
      />
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-6 md:py-8">
        <div className="flex min-h-[70vh] flex-col">
          <div className="flex-1">
            <FlowTransition questionKey={questionKey} direction={direction}>
              <QuestionCard title={question.title} subtitle={question.subtitle}>
                <QuestionRenderer
                  question={question}
                  value={formData[question.field]}
                  onChange={(value) => updateField(question.field, value)}
                  onSubmit={handleNext}
                  onExtraFieldChange={updateField}
                  addressErrors={addressErrors}
                  error={error}
                  userType="nanny"
                />
              </QuestionCard>
            </FlowTransition>
          </div>

          <div className="mt-8">
            <FlowNavigation
              onBack={handleBack}
              onNext={handleNext}
              isLoading={isSaving}
            />
          </div>
        </div>
      </div>
    </>
  );
}
