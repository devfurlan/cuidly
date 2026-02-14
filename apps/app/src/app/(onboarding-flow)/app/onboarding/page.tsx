'use client';

/**
 * Onboarding Page
 * /app/onboarding
 *
 * For UNTYPED users: shows type selection as the first onboarding question.
 * For NANNY/FAMILY: redirects to the appropriate onboarding flow.
 */

import {
  PiCheckCircleFill,
  PiUserCheckDuotone,
  PiUsersDuotone,
} from 'react-icons/pi';

import { FlowNavigation } from '@/components/onboarding-flow/FlowNavigation';
import { FlowProgress } from '@/components/onboarding-flow/FlowProgress';
import { FlowTransition } from '@/components/onboarding-flow/FlowTransition';
import { QuestionCard } from '@/components/onboarding-flow/QuestionCard';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@cuidly/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserType = 'FAMILY' | 'NANNY';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authData, setAuthData] = useState<{
    id: string;
    email: string;
    name: string | null;
    emailVerified: boolean;
  } | null>(null);

  useEffect(() => {
    async function checkUserAndRedirect() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/user/me');

        if (!response.ok) {
          throw new Error('Failed to load user data');
        }

        const userData = await response.json();

        if (userData.onboardingCompleted) {
          router.push('/app');
          return;
        }

        if (userData.role === 'NANNY') {
          router.push('/app/onboarding/nanny');
          return;
        }

        if (userData.role === 'FAMILY') {
          router.push('/app/onboarding/family');
          return;
        }

        if (userData.role === 'ADMIN') {
          router.push('/app');
          return;
        }

        // UNTYPED - show type selection inline
        setAuthData({
          id: user.id,
          email: user.email || '',
          name:
            user.user_metadata?.name || user.user_metadata?.full_name || null,
          emailVerified: !!user.email_confirmed_at,
        });
        setShowTypeSelection(true);
      } catch (err) {
        console.error('Error checking user:', err);
        router.push('/login');
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkUserAndRedirect();
  }, [router, supabase]);

  const handleSelectType = (type: UserType) => {
    setUserType(type);
    requestAnimationFrame(() => {
      setTimeout(() => {
        handleContinue(type);
      }, 150);
    });
  };

  const handleContinue = async (typeOverride?: UserType) => {
    const selectedType = typeOverride ?? userType;
    if (!authData || !selectedType) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authId: authData.id,
          email: authData.email,
          type: selectedType,
          name: authData.name,
          emailVerified: authData.emailVerified,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao criar perfil');
      }

      if (selectedType === 'NANNY') {
        router.push('/app/onboarding/nanny?q=1');
      } else {
        router.push('/app/onboarding/family?q=1');
      }
    } catch (err) {
      console.error('Error creating user record:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao criar perfil. Tente novamente.',
      );
      setIsLoading(false);
    }
  };

  if (isCheckingAuth || !showTypeSelection) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <FlowProgress
        currentGlobalQuestion={0}
        totalGlobalQuestions={1}
        className="mb-8"
      />
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-6 md:py-8">
        <div className="flex min-h-[70vh] flex-col">
          <div className="flex-1">
            <FlowTransition questionKey="select-type" direction="forward">
              <QuestionCard title="Vamos começar" subtitle="Escolha seu perfil">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectType('FAMILY')}
                    disabled={isLoading}
                    className={cn(
                      'flex items-center justify-between rounded-lg border-2 bg-white/60 p-4 text-left transition-all',
                      userType === 'FAMILY'
                        ? 'border-fuchsia-500 bg-white'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      isLoading && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex size-10 items-center justify-center rounded-full',
                          userType === 'FAMILY'
                            ? 'bg-fuchsia-100'
                            : 'bg-gray-100',
                        )}
                      >
                        <PiUsersDuotone
                          className={cn(
                            'size-5',
                            userType === 'FAMILY'
                              ? 'text-fuchsia-600'
                              : 'text-gray-500',
                          )}
                        />
                      </div>
                      <div>
                        <span
                          className={cn(
                            'text-base font-medium',
                            userType === 'FAMILY'
                              ? 'text-fuchsia-900'
                              : 'text-gray-700',
                          )}
                        >
                          Sou uma família
                        </span>
                        <p
                          className={cn(
                            'text-xs',
                            userType === 'FAMILY'
                              ? 'text-fuchsia-600'
                              : 'text-gray-500',
                          )}
                        >
                          Procuro uma babá para meus filhos
                        </p>
                      </div>
                    </div>
                    {userType === 'FAMILY' && (
                      <PiCheckCircleFill className="ml-3 size-6 shrink-0 text-fuchsia-500" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectType('NANNY')}
                    disabled={isLoading}
                    className={cn(
                      'flex items-center justify-between rounded-lg border-2 bg-white/60 p-4 text-left transition-all',
                      userType === 'NANNY'
                        ? 'border-fuchsia-500 bg-white'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      isLoading && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex size-10 items-center justify-center rounded-full',
                          userType === 'NANNY'
                            ? 'bg-fuchsia-100'
                            : 'bg-gray-100',
                        )}
                      >
                        <PiUserCheckDuotone
                          className={cn(
                            'size-5',
                            userType === 'NANNY'
                              ? 'text-fuchsia-600'
                              : 'text-gray-500',
                          )}
                        />
                      </div>
                      <div>
                        <span
                          className={cn(
                            'text-base font-medium',
                            userType === 'NANNY'
                              ? 'text-fuchsia-900'
                              : 'text-gray-700',
                          )}
                        >
                          Sou uma babá
                        </span>
                        <p
                          className={cn(
                            'text-xs',
                            userType === 'NANNY'
                              ? 'text-fuchsia-600'
                              : 'text-gray-500',
                          )}
                        >
                          Procuro famílias para trabalhar
                        </p>
                      </div>
                    </div>
                    {userType === 'NANNY' && (
                      <PiCheckCircleFill className="ml-3 size-6 shrink-0 text-fuchsia-500" />
                    )}
                  </button>
                </div>
              </QuestionCard>
            </FlowTransition>
          </div>

          <div className="mt-8">
            <FlowNavigation
              onBack={() => {}}
              onNext={() => handleContinue()}
              isLoading={isLoading}
              disabled={!userType}
              showBackButton={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}
