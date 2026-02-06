'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { FamilyQuestionFlow } from '@/components/onboarding-flow/FamilyQuestionFlow';
import { findResumePoint, FamilyFormData } from '@/lib/onboarding-flow/family-questions';
import { secureStorage } from '@/lib/onboarding-storage';
import { createClient } from '@/utils/supabase/client';

const STORAGE_KEY = 'family-onboarding-data';

function FamilyOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  // Get URL params
  const qParam = searchParams.get('q');

  // If we have q param, render the question flow directly
  const hasQuestionParam = qParam !== null;
  const questionIndex = qParam ? parseInt(qParam, 10) : 0;

  useEffect(() => {
    async function checkUserAndResume() {
      // Check auth
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is actually a family
      try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== 'FAMILY') {
            router.push('/app/onboarding');
            return;
          }
          if (userData.onboardingCompleted) {
            router.push('/app');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }

      // If we already have question params, just finish loading
      if (hasQuestionParam) {
        setIsLoading(false);
        return;
      }

      // No question params - detect where user left off
      const savedData = secureStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const formData: FamilyFormData = JSON.parse(savedData);

          // Check if there's any data saved
          const hasData = Object.keys(formData).some((key) => {
            const value = formData[key];
            return (
              value !== undefined &&
              value !== null &&
              value !== '' &&
              !(Array.isArray(value) && value.length === 0)
            );
          });

          if (hasData) {
            // Find where to resume
            const resumePoint = findResumePoint(formData);

            if (resumePoint === 'complete') {
              router.push('/app/onboarding/family/complete');
              return;
            }

            // Redirect to the resume point
            router.push(`/app/onboarding/family?q=${resumePoint.q}`);
            return;
          }
        } catch (e) {
          console.error('Error parsing saved data:', e);
        }
      }

      // No saved data or empty data - go directly to first question
      router.push('/app/onboarding/family?q=1');
    }

    checkUserAndResume();
  }, [router, supabase, hasQuestionParam]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
      </div>
    );
  }

  // Render question flow if we have params
  if (hasQuestionParam && questionIndex > 0) {
    return <FamilyQuestionFlow questionIndex={questionIndex} />;
  }

  // Fallback loading while redirecting
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
    </div>
  );
}

export default function FamilyOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
        </div>
      }
    >
      <FamilyOnboardingContent />
    </Suspense>
  );
}
