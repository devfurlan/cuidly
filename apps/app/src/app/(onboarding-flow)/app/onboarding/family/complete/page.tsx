'use client';

import { trackFamilyRegistration } from '@/lib/gtm-events';
import { secureStorage } from '@/lib/onboarding-storage';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import OnboardingLoading from './OnboardingLoading';

const STORAGE_KEY = 'family-onboarding-data';

// Clear all child-specific secure storage keys
function clearChildStorageKeys() {
  for (let i = 1; i <= 10; i++) {
    secureStorage.removeItem(`family-onboarding-child-${i}`);
  }
}

export default function FamilyOnboardingCompletePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isReady, setIsReady] = useState(false);
  const [jobId, setJobId] = useState<number | null>(null);
  const [childName, setChildName] = useState<string | undefined>();

  useEffect(() => {
    async function completeOnboarding() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Mark onboarding as complete
        const response = await fetch('/api/families/complete-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();

          // Set jobId if returned from API
          if (data.jobId) {
            setJobId(data.jobId);
          }

          // Set child name if available
          if (data.childName) {
            setChildName(data.childName);
          }

          // Clear secure storage data
          secureStorage.removeItem(STORAGE_KEY);
          clearChildStorageKeys();

          trackFamilyRegistration();
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error completing onboarding:', errorData);
          // Even if API fails, continue with animation
        }
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // Even if API fails, continue with animation
      }

      setIsReady(true);
    }

    completeOnboarding();
  }, [router, supabase]);

  // Show initial loading while preparing
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent"></div>
      </div>
    );
  }

  // Show animated loading with message sequence
  return <OnboardingLoading jobId={jobId} childName={childName} />;
}
