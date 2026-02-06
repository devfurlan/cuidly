'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProfileSetupData, ProfileSetupAPIResponse } from '../types';

interface UseProfileSetupDataReturn {
  data: ProfileSetupData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProfileSetupData(): UseProfileSetupDataReturn {
  const [data, setData] = useState<ProfileSetupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/profile/setup-status');

      if (!response.ok) {
        throw new Error('Failed to fetch profile setup status');
      }

      const result: ProfileSetupAPIResponse = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
