'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { z } from 'zod';
import { secureStorage } from '@/lib/onboarding-storage';

export interface FlowQuestion {
  id: string;
  field: string;
  type: 'text' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'address' | 'custom' | 'photo' | 'multi-photo' | 'ai-generated-text' | 'children-section' | 'availability-section' | 'preferences-section';
  title: string;
  subtitle?: string;
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string; description?: string }[];
  validation?: z.ZodSchema;
  mask?: (value: string) => string;
  showIf?: (data: Record<string, unknown>) => boolean;
  maxLength?: number;
  minLength?: number;
  maxSelections?: number;
  defaultValue?: unknown;
  generateEndpoint?: string; // For AI-generated text questions
  hint?: { title: string; description?: string }; // Optional hint/tip shown above options
  section?: string; // Section key for visual grouping (e.g. 'familyProfile', 'jobCreation')
}

export interface FlowStepConfig {
  stepNumber: number;
  totalSteps: number;
  questions: FlowQuestion[];
  saveEndpoint?: string;
}

interface FlowContextValue {
  // Flow state
  currentIndex: number;
  totalQuestions: number;
  visibleQuestions: FlowQuestion[];
  currentQuestion: FlowQuestion | null;
  stepConfig: FlowStepConfig;
  userType: 'family' | 'nanny';

  // Form data
  formData: Record<string, unknown>;
  updateField: (field: string, value: unknown) => void;

  // Navigation
  goNext: () => Promise<boolean>;
  goBack: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;

  // Progress
  progress: number;
  globalProgress: number;
  currentGlobalQuestion: number;
  totalGlobalQuestions: number;

  // State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  setError: (error: string | null) => void;

  // Direction for animations
  direction: 'forward' | 'backward';
}

const FlowContext = createContext<FlowContextValue | null>(null);

interface FlowProviderProps {
  children: ReactNode;
  config: FlowStepConfig;
  storageKey: string;
  onComplete: () => void;
  onBack: () => void;
  onSave?: (data: Record<string, unknown>) => Promise<void>;
  initialData?: Record<string, unknown>;
  /** Number of questions completed in previous steps */
  previousStepsQuestions?: number;
  /** Total questions in the entire onboarding flow */
  totalFlowQuestions?: number;
  /** Type of user for contextual messages */
  userType?: 'family' | 'nanny';
}

export function FlowProvider({
  children,
  config,
  storageKey,
  onComplete,
  onBack,
  onSave,
  initialData = {},
  previousStepsQuestions = 0,
  totalFlowQuestions,
  userType = 'family',
}: FlowProviderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref to the latest formData for synchronous access in callbacks
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Filter visible questions based on showIf conditions
  const visibleQuestions = config.questions.filter(
    (q) => !q.showIf || q.showIf(formData)
  );

  const totalQuestions = visibleQuestions.length;

  // Adjust currentIndex if it goes out of bounds when visibleQuestions changes
  // This can happen when showIf conditions change (e.g., user changes answer)
  const adjustedIndex = totalQuestions > 0
    ? Math.min(currentIndex, totalQuestions - 1)
    : 0;

  const currentQuestion = visibleQuestions[adjustedIndex] || null;

  // Sync currentIndex if it was adjusted
  useEffect(() => {
    if (adjustedIndex !== currentIndex && totalQuestions > 0) {
      setCurrentIndex(adjustedIndex);
    }
  }, [adjustedIndex, currentIndex, totalQuestions]);

  // Load saved data on mount and apply defaults
  useEffect(() => {
    // Build defaults from question config
    const defaults: Record<string, unknown> = {};
    for (const question of config.questions) {
      if (question.defaultValue !== undefined) {
        defaults[question.field] = question.defaultValue;
      }
    }

    const savedData = secureStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Merge: defaults first, then saved data (saved takes priority)
        setFormData((prev) => ({ ...defaults, ...prev, ...parsed }));
      } catch (e) {
        console.error('Error loading saved data:', e);
        setFormData((prev) => ({ ...defaults, ...prev }));
      }
    } else {
      // No saved data, just apply defaults
      setFormData((prev) => ({ ...defaults, ...prev }));
    }
    setIsLoading(false);
  }, [storageKey, config.questions]);

  // Auto-save to storage on form data change
  useEffect(() => {
    if (!isLoading && Object.keys(formData).length > 0) {
      const existingData = secureStorage.getItem(storageKey);
      const existing = existingData ? JSON.parse(existingData) : {};
      secureStorage.setItem(storageKey, JSON.stringify({ ...existing, ...formData }));
    }
  }, [formData, storageKey, isLoading]);

  const updateField = useCallback((field: string, value: unknown) => {
    // Update ref immediately for synchronous access
    formDataRef.current = { ...formDataRef.current, [field]: value };
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const validateCurrentQuestion = useCallback((): boolean => {
    if (!currentQuestion) return true;

    // Use ref for the most up-to-date value (handles async setState)
    const value = formDataRef.current[currentQuestion.field];

    // Check required
    if (currentQuestion.required) {
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
    if (currentQuestion.validation) {
      const result = currentQuestion.validation.safeParse(value);
      if (!result.success) {
        setError(result.error.errors[0]?.message || 'Valor inválido');
        return false;
      }
    }

    setError(null);
    return true;
  }, [currentQuestion]);

  const goNext = useCallback(async (): Promise<boolean> => {
    // Validate current question
    if (!validateCurrentQuestion()) {
      return false;
    }

    setDirection('forward');

    // Recalculate visible questions with latest form data to get accurate count
    const latestVisibleQuestions = config.questions.filter(
      (q) => !q.showIf || q.showIf(formDataRef.current)
    );
    const latestTotalQuestions = latestVisibleQuestions.length;

    // If last question, save and complete
    if (adjustedIndex >= latestTotalQuestions - 1) {
      setIsSaving(true);
      try {
        if (onSave) {
          // Use ref for most up-to-date data
          await onSave(formDataRef.current);
        }
        onComplete();
        return true;
      } catch (e) {
        console.error('Error saving:', e);
        setError('Erro ao salvar. Tente novamente.');
        return false;
      } finally {
        setIsSaving(false);
      }
    }

    // Go to next question
    setCurrentIndex((prev) => prev + 1);
    return true;
  }, [adjustedIndex, config.questions, validateCurrentQuestion, onSave, onComplete]);

  const goBack = useCallback(() => {
    setDirection('backward');
    setError(null);

    if (adjustedIndex === 0) {
      onBack();
    } else {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  }, [adjustedIndex, onBack]);

  // Calculate progress using adjustedIndex for accuracy
  const progress = totalQuestions > 0 ? ((adjustedIndex + 1) / totalQuestions) * 100 : 0;

  // Global progress across all steps
  // Use totalFlowQuestions if provided, otherwise fall back to step-based calculation
  const totalGlobalQuestions = totalFlowQuestions ?? (previousStepsQuestions + totalQuestions);
  const currentGlobalQuestion = previousStepsQuestions + adjustedIndex + 1;
  const globalProgress = totalGlobalQuestions > 0
    ? (currentGlobalQuestion / totalGlobalQuestions) * 100
    : 0;

  const value: FlowContextValue = {
    currentIndex: adjustedIndex,
    totalQuestions,
    visibleQuestions,
    currentQuestion,
    stepConfig: config,
    userType,
    formData,
    updateField,
    goNext,
    goBack,
    canGoNext: !isSaving,
    canGoBack: !isSaving,
    isFirstQuestion: adjustedIndex === 0,
    isLastQuestion: adjustedIndex >= totalQuestions - 1,
    progress,
    globalProgress,
    currentGlobalQuestion,
    totalGlobalQuestions,
    isLoading,
    isSaving,
    error,
    setError,
    direction,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow(): FlowContextValue {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
}
