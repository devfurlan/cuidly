'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

import {
  calculateProgress,
  FAMILY_SECTIONS,
  FamilyFormData,
  findResumePoint,
  getNextDestination,
  getPrevDestination,
  getQuestion,
  getSectionForQuestion,
  isFirstQuestionInSection,
} from '@/lib/onboarding-flow/family-questions';
import { secureStorage } from '@/lib/onboarding-storage';
import { createClient } from '@/utils/supabase/client';

import { FlowNavigation } from './FlowNavigation';
import { FlowProgress } from './FlowProgress';
import { FlowTransition } from './FlowTransition';
import { useOnboardingBack } from './OnboardingBackContext';
import { QuestionCard } from './QuestionCard';
import { SectionInterstitial } from './SectionInterstitial';
import { QuestionRenderer } from './questions/QuestionRenderer';

const STORAGE_KEY = 'family-onboarding-data';

interface FamilyQuestionFlowProps {
  questionIndex: number; // q param (1-based)
}

export function FamilyQuestionFlow({ questionIndex }: FamilyQuestionFlowProps) {
  const router = useRouter();
  const supabase = createClient();
  const { setOnBack } = useOnboardingBack();

  // State
  const [formData, setFormData] = useState<FamilyFormData>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [showInterstitial, setShowInterstitial] = useState(false);

  // Keep a ref to the latest formData for synchronous access
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Get current question based on visible questions
  const question = getQuestion(questionIndex, formData);

  // Calculate progress
  const progress = calculateProgress(questionIndex, formData);

  // Get current section
  const currentSection = getSectionForQuestion(questionIndex, formData);

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
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(parsed);
          formDataRef.current = parsed;

          // Pre-fill email from auth if not set
          if (!parsed.email && user.email) {
            const updatedData = { ...parsed, email: user.email };
            setFormData(updatedData);
            formDataRef.current = updatedData;
            secureStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
          }
        } catch (e) {
          console.error('Error loading saved data:', e);
        }
      } else if (user.email) {
        // No saved data, pre-fill email
        const initialData = { email: user.email };
        setFormData(initialData);
        formDataRef.current = initialData;
        secureStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }

      setIsLoading(false);
    }
    loadData();
  }, [router, supabase]);

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
      const address = value as { zipCode?: string; streetName?: string; neighborhood?: string; city?: string; state?: string } | undefined;
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

    // Check required
    if (question.required) {
      if (value === undefined || value === null || value === '') {
        // Mensagem customizada para campo de filhos
        if (question.field === 'children') {
          setError('Para encontrar a babá ideal, você precisa cadastrar pelo menos 1 filho');
        } else {
          setError('Este campo é obrigatório');
        }
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        // Mensagem customizada para campo de filhos
        if (question.field === 'children') {
          setError('Para encontrar a babá ideal, você precisa cadastrar pelo menos 1 filho');
        } else {
          setError('Selecione pelo menos uma opção');
        }
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
    async (dest: { q: number } | 'complete' | 'exit') => {
      if (dest === 'complete') {
        // Save to API before completing
        saveToApiAndComplete();
      } else if (dest === 'exit') {
        // Go back to type selection — delete current record so user can re-choose
        try {
          await fetch('/api/auth/switch-type', { method: 'POST' });
        } catch {
          // If API fails, still try to navigate
        }
        secureStorage.removeItem(STORAGE_KEY);
        router.push('/app/onboarding');
      } else {
        router.push(`/app/onboarding/family?q=${dest.q}`);
      }
    },
    [router],
  );

  // Save to API and complete
  const saveToApiAndComplete = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/families/save-partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataRef.current),
      });

      if (!response.ok) {
        const result = await response.json();

        // Se o erro for relacionado ao campo responsibleName, redirecionar para a pergunta do nome
        if (result.field === 'responsibleName') {
          // Limpar o campo do storage para forçar o usuário a preencher novamente
          const savedData = secureStorage.getItem(STORAGE_KEY);
          if (savedData) {
            const parsed = JSON.parse(savedData);
            delete parsed.responsibleName;
            secureStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            setFormData(parsed);
            formDataRef.current = parsed;
          }
          setError('Por favor, preencha seu nome corretamente.');
          router.push('/app/onboarding/family?q=1');
          return;
        }

        throw new Error(result.error || 'Erro ao salvar');
      }

      // Clear storage and go to complete page
      secureStorage.removeItem(STORAGE_KEY);
      router.push('/app/onboarding/family/complete');
    } catch (e) {
      console.error('Error saving:', e);
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Validate CPF uniqueness against API
  const validateCpfUniqueness = useCallback(async (cpf: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/check-cpf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, userType: 'FAMILY' }),
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
  }, []);

  // Handle next
  const handleNext = useCallback(async () => {
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
    const next = getNextDestination(questionIndex, formDataRef.current);

    // If going to complete, save to API first
    if (next === 'complete') {
      await saveToApiAndComplete();
      return;
    }

    // Check if entering a new section (forward only, skip section 1)
    if (isFirstQuestionInSection(next.q, formDataRef.current)) {
      const nextSection = getSectionForQuestion(next.q, formDataRef.current);
      if (nextSection && nextSection.sectionNumber > 1) {
        setShowInterstitial(true);
      }
    }

    navigateTo(next);
  }, [validateCurrentQuestion, questionIndex, navigateTo, question, validateCpfUniqueness]);

  // Handle back
  const handleBack = useCallback(() => {
    setDirection('backward');
    setError(null);
    setShowInterstitial(false);

    const prev = getPrevDestination(questionIndex, formDataRef.current);
    navigateTo(prev);
  }, [questionIndex, navigateTo]);

  // Register back handler in header
  useEffect(() => {
    setOnBack(handleBack);
    return () => setOnBack(null);
  }, [handleBack, setOnBack]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
      </div>
    );
  }

  // Invalid question - redirect to resume point
  if (!question) {
    const resumePoint = findResumePoint(formDataRef.current);
    if (resumePoint === 'complete') {
      router.push('/app/onboarding/family/complete');
    } else {
      router.push(`/app/onboarding/family?q=${resumePoint.q}`);
    }
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
      </div>
    );
  }

  // Generate unique key for animation
  const questionKey = `q${questionIndex}-${question.id}`;

  // Show section interstitial
  if (showInterstitial && currentSection) {
    return (
      <>
        <FlowProgress
          currentGlobalQuestion={progress.current}
          totalGlobalQuestions={progress.total}
          className="mb-6"
        />
        <SectionInterstitial
          section={currentSection}
          totalSections={FAMILY_SECTIONS.length}
          onContinue={() => setShowInterstitial(false)}
        />
      </>
    );
  }

  // Render normal question
  return (
    <>
      <FlowProgress
        currentGlobalQuestion={progress.current}
        totalGlobalQuestions={progress.total}
        className="mb-6"
      />
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-6 md:py-8">
        <div className="flex min-h-[70vh] flex-col">
          <div className="flex-1">
            <FlowTransition questionKey={questionKey} direction={direction}>
              <QuestionCard
                title={question.title}
                subtitle={question.subtitle}
              >
                <QuestionRenderer
                  question={question}
                  value={formData[question.field]}
                  onChange={(value) => updateField(question.field, value)}
                  onSubmit={handleNext}
                  onExtraFieldChange={updateField}
                  formData={formData}
                  error={error}
                  addressErrors={addressErrors}
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
