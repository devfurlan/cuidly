/**
 * App Entry Page
 * /app
 *
 * Checks authentication and onboarding status, then redirects accordingly:
 * - If not authenticated: redirect to login
 * - If onboarding not completed: redirect to /app/onboarding
 * - If onboarding completed: redirect to /app/dashboard
 */

'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      try {
        // Check authentication
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace('/login');
          return;
        }

        // Check onboarding status
        const response = await fetch('/api/user/me');
        if (!response.ok) {
          console.error('Failed to fetch user data');
          router.replace('/login');
          return;
        }

        const userData = await response.json();

        if (!userData.onboardingCompleted) {
          // Redirect to onboarding
          router.replace('/app/onboarding');
        } else {
          // Redirect to dashboard
          router.replace('/app/dashboard');
        }
      } catch (error) {
        console.error('Error checking auth and onboarding:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndOnboarding();
  }, [router, supabase]);

  // Show loading state while checking
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 animate-spin rounded-full border-4 border-fuchsia-200 border-t-fuchsia-600" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return null;
}
