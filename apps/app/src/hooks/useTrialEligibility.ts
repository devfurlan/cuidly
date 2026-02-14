'use client';

import { useCallback, useEffect, useState } from 'react';

interface TrialEligibility {
  eligible: boolean;
  trialDays: number;
  plan: string;
  reason?: string;
}

interface UseTrialEligibilityReturn {
  eligible: boolean;
  trialDays: number;
  plan: string | null;
  isLoading: boolean;
  activateTrial: () => Promise<{ success: boolean; message?: string }>;
  isActivating: boolean;
  refresh: () => void;
}

export function useTrialEligibility(): UseTrialEligibilityReturn {
  const [data, setData] = useState<TrialEligibility | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);

  const fetchEligibility = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/subscription/trial-eligibility');
      const result = await response.json();
      setData(result);
    } catch {
      setData({ eligible: false, trialDays: 0, plan: '', reason: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  const activateTrial = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsActivating(true);
      const response = await fetch('/api/subscription/activate-trigger-trial', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, message: result.error || 'Erro ao ativar período de teste' };
      }

      // Mark as no longer eligible after activation
      setData({ eligible: false, trialDays: 0, plan: '', reason: 'already_used' });

      return { success: true, message: result.message };
    } catch {
      return { success: false, message: 'Erro ao ativar período de teste' };
    } finally {
      setIsActivating(false);
    }
  }, []);

  return {
    eligible: data?.eligible ?? false,
    trialDays: data?.trialDays ?? 0,
    plan: data?.plan ?? null,
    isLoading,
    activateTrial,
    isActivating,
    refresh: fetchEligibility,
  };
}
