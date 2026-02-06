'use client';

import { FlowProvider, FlowContainer } from '@/components/onboarding-flow';
import type { FlowStepConfig } from '@/components/onboarding-flow/FlowProvider';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, ReactNode } from 'react';
import { secureStorage } from '@/lib/onboarding-storage';

const STORAGE_KEY = 'family-onboarding-data';

interface FamilyStepWrapperProps {
  config: FlowStepConfig;
  nextStep: string;
  previousStep: string;
  /** Original step number from URL (5-10) */
  originalStepNumber: number;
  children?: ReactNode;
}

export function FamilyStepWrapper({
  config,
  nextStep,
  previousStep,
  originalStepNumber,
}: FamilyStepWrapperProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown>>({});
  const [numberOfChildren, setNumberOfChildren] = useState(1);

  // Calculate dynamic totalSteps based on number of children
  // Formula: 1 (personal) + 3*numberOfChildren (child steps) + 6 (remaining steps: 5-10)
  const dynamicConfig = useMemo(() => {
    const totalSteps = 1 + 3 * numberOfChildren + 6;
    // Steps 5-10 in URL correspond to positions after all child steps
    // baseStepsAfterChildren = 1 (step1) + 3*numberOfChildren (child steps)
    // step 5 = baseStepsAfterChildren + 1
    // step 6 = baseStepsAfterChildren + 2
    // etc.
    const baseStepsAfterChildren = 1 + 3 * numberOfChildren;
    const currentStep = baseStepsAfterChildren + (originalStepNumber - 4);

    return {
      ...config,
      stepNumber: currentStep,
      totalSteps,
    };
  }, [config, numberOfChildren, originalStepNumber]);

  // Check auth and load initial data
  useEffect(() => {
    async function loadData() {
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
          setInitialData(parsed);
          // Get number of children for dynamic step calculation
          if (parsed.numberOfChildren) {
            setNumberOfChildren(parseInt(parsed.numberOfChildren, 10));
          }
        } catch (e) {
          console.error('Error loading saved data:', e);
        }
      } else {
        // Pre-fill email from user auth for step 1
        if (config.stepNumber === 1 && user.email) {
          setInitialData({ email: user.email });
        }
      }

      setIsAuthLoading(false);
    }
    loadData();
  }, [router, supabase, config.stepNumber]);

  async function handleSave(data: Record<string, unknown>) {
    const response = await fetch('/api/families/save-partial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Erro ao salvar');
    }

    return response.json();
  }

  function handleComplete() {
    router.push(nextStep);
  }

  function handleBack() {
    router.push(previousStep);
  }

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <FlowProvider
      config={dynamicConfig}
      storageKey={STORAGE_KEY}
      initialData={initialData}
      onComplete={handleComplete}
      onBack={handleBack}
      onSave={handleSave}
    >
      <FlowContainer />
    </FlowProvider>
  );
}
