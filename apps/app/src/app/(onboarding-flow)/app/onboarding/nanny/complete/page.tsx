'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PiUserCircle, PiMagnifyingGlass, PiBriefcase } from 'react-icons/pi';
import { trackNannyRegistration } from '@/lib/gtm-events';
import { secureStorage } from '@/lib/onboarding-storage';
import { createClient } from '@/utils/supabase/client';

const STORAGE_KEY = 'nanny-onboarding-data';
const GENERATED_BIO_KEY = 'nanny-generated-bio';
const GENERATED_MINI_BIO_KEY = 'nanny-generated-mini-bio';

const STEPS = [
  {
    text: 'Criando seu perfil…',
    icon: PiUserCircle,
    duration: 2000,
  },
  {
    text: 'Analisando suas informações…',
    icon: PiMagnifyingGlass,
    duration: 2000,
  },
  {
    text: 'Preparando vagas compatíveis para você…',
    icon: PiBriefcase,
    duration: 2000,
  },
];

export default function NannyOnboardingCompletePage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [apiCompleted, setApiCompleted] = useState(false);
  const hasCompleted = useRef(false);

  // Execute complete-onboarding on mount
  useEffect(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;

    async function completeOnboarding() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/nannies/complete-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Erro ao completar onboarding');
        }

        // Clear storage
        secureStorage.removeItem(STORAGE_KEY);
        secureStorage.removeItem(GENERATED_BIO_KEY);
        secureStorage.removeItem(GENERATED_MINI_BIO_KEY);

        trackNannyRegistration();

        // Mark API as completed
        setApiCompleted(true);
      } catch (err) {
        console.error('Error completing onboarding:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    }

    completeOnboarding();
  }, [router, supabase]);

  // Auto-advance steps
  useEffect(() => {
    if (error) return;

    // Only redirect when both animation finished AND API completed
    if (currentStep >= STEPS.length && apiCompleted) {
      router.replace('/app/vagas?welcome=true');
      return;
    }

    // Continue animation if not finished
    if (currentStep < STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, STEPS[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, router, error, apiCompleted]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-fuchsia-50 to-purple-50 px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-3xl">✕</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Ops! Algo deu errado
          </h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/app')}
            className="mt-4 rounded-lg bg-fuchsia-600 px-6 py-2 font-medium text-white hover:bg-fuchsia-700"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const step = STEPS[currentStep] || STEPS[STEPS.length - 1];
  const Icon = step.icon;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-fuchsia-50 to-purple-50 px-4">
      <div className="flex flex-col items-center gap-8">
        {/* Animated Icon */}
        <div className="relative">
          {/* Pulsing background */}
          <div className="absolute inset-0 animate-ping rounded-full bg-fuchsia-300 opacity-30" />
          <div className="absolute inset-0 animate-pulse rounded-full bg-fuchsia-200 opacity-50" />

          {/* Icon container */}
          <div className="relative flex size-32 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-xl">
            <Icon className="size-16 text-white" />
          </div>
        </div>

        {/* Step text */}
        <div className="text-center">
          <p className="text-xl font-medium text-gray-800">{step.text}</p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-3">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                index < currentStep
                  ? 'bg-fuchsia-600'
                  : index === currentStep
                    ? 'w-8 bg-fuchsia-500'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Loading bar */}
        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep + 1) / STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
