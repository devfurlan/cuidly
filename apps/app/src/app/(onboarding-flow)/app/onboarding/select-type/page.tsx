'use client';

/**
 * User Type Selection Page
 * /app/onboarding/select-type
 *
 * First step of onboarding for all signup methods (Google, email, etc.)
 * Creates the Nanny or Family record and redirects to the appropriate onboarding flow.
 */

import {
  PiCheckCircleFill,
  PiUserCheckDuotone,
  PiUsersDuotone,
} from 'react-icons/pi';

import { LoadingButton } from '@/components/ui/LoadingButton';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { cn } from '@cuidly/shared';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserType = 'FAMILY' | 'NANNY';

export default function SelectTypePage() {
  const router = useRouter();
  const supabase = createClient();
  const [userType, setUserType] = useState<UserType>('FAMILY');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authData, setAuthData] = useState<{
    id: string;
    email: string;
    name: string | null;
  } | null>(null);

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user already has a type
      try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== 'UNTYPED') {
            // User already has a type, redirect to onboarding
            router.push('/app/onboarding');
            return;
          }
        }
      } catch {
        // Continue to type selection
      }

      setAuthData({
        id: user.id,
        email: user.email || '',
        name:
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          null,
      });
      setIsCheckingAuth(false);
    }

    checkAuth();
  }, [router, supabase]);

  const handleContinue = async () => {
    if (!authData) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create the Nanny or Family record
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authId: authData.id,
          email: authData.email,
          type: userType,
          name: authData.name,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao criar perfil');
      }

      // Redirect to the appropriate onboarding flow
      if (userType === 'NANNY') {
        router.push('/app/onboarding/nanny?q=1');
      } else {
        router.push('/app/onboarding/family?q=1');
      }
    } catch (err) {
      console.error('Error creating user record:', err);
      setError(
        err instanceof Error ? err.message : 'Erro ao criar perfil. Tente novamente.',
      );
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Como você quer usar a Cuidly?
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Selecione seu perfil para personalizar sua experiência
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => setUserType('FAMILY')}
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
                  userType === 'FAMILY' ? 'bg-fuchsia-100' : 'bg-gray-100',
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
            onClick={() => setUserType('NANNY')}
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
                  userType === 'NANNY' ? 'bg-fuchsia-100' : 'bg-gray-100',
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

        <LoadingButton
          size="lg"
          className="w-full"
          onClick={handleContinue}
          isLoading={isLoading}
          loadingText="Criando perfil..."
        >
          Continuar
        </LoadingButton>
      </div>
    </div>
  );
}
