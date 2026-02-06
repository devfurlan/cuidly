/**
 * Onboarding Router
 * /app/onboarding
 *
 * Detects user role and redirects to appropriate onboarding flow
 */

'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

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

        // Get user data from API
        const response = await fetch('/api/user/me');

        if (!response.ok) {
          throw new Error('Failed to load user data');
        }

        const userData = await response.json();

        // If onboarding already completed, redirect to dashboard
        if (userData.onboardingCompleted) {
          router.push('/app');
          return;
        }

        // Redirect based on role
        if (userData.role === 'UNTYPED') {
          router.push('/app/onboarding/select-type');
        } else if (userData.role === 'NANNY') {
          router.push('/app/onboarding/nanny');
        } else if (userData.role === 'FAMILY') {
          router.push('/app/onboarding/family');
        } else {
          // Admin or unknown role - redirect to app
          router.push('/app');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }

    checkUserAndRedirect();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return null;
}
