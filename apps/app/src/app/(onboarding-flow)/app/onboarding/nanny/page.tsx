'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { NannyQuestionFlow } from '@/components/onboarding-flow/NannyQuestionFlow';
import { findResumePoint, NannyFormData } from '@/lib/onboarding-flow/nanny-questions';
import { secureStorage } from '@/lib/onboarding-storage';
import { createClient } from '@/utils/supabase/client';

const STORAGE_KEY = 'nanny-onboarding-data';

function NannyOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  // Get URL params
  const qParam = searchParams.get('q');
  const qcParam = searchParams.get('qc');

  // If we have q param, render the question flow directly
  const hasQuestionParam = qParam !== null;
  const questionIndex = qParam ? parseInt(qParam, 10) : 0;
  const conditionalIndex = qcParam ? parseInt(qcParam, 10) : undefined;

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

      // Check if user is actually a nanny
      try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== 'NANNY') {
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
          const formData: NannyFormData = JSON.parse(savedData);

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
              router.push('/app/onboarding/nanny/complete');
              return;
            }

            // Redirect to the resume point
            const url = resumePoint.qc
              ? `/app/onboarding/nanny?q=${resumePoint.q}&qc=${resumePoint.qc}`
              : `/app/onboarding/nanny?q=${resumePoint.q}`;
            router.push(url);
            return;
          }
        } catch (e) {
          console.error('Error parsing saved data:', e);
        }
      }

      // No saved data or empty data - go directly to first question
      router.push('/app/onboarding/nanny?q=1');
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
    return (
      <NannyQuestionFlow
        questionIndex={questionIndex}
        conditionalIndex={conditionalIndex}
      />
    );
  }

  // Fallback loading while redirecting
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
    </div>
  );
}

export default function NannyOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
        </div>
      }
    >
      <NannyOnboardingContent />
    </Suspense>
  );
}
