'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WidgetState } from '../types';

const STORAGE_KEY = 'cuidly-profile-setup-widget';

interface UseProfileSetupDismissReturn {
  state: WidgetState;
  isVisible: boolean;
  minimize: () => void;
  expand: () => void;
  dismissFor24Hours: () => void;
}

function getStoredState(): WidgetState {
  if (typeof window === 'undefined') {
    return { minimized: false };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as WidgetState;

      // Check if dismissedUntil has passed
      if (parsed.dismissedUntil && new Date(parsed.dismissedUntil) <= new Date()) {
        // Clear the dismissedUntil since it has expired
        const newState = { minimized: parsed.minimized, dismissedUntil: undefined };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        return newState;
      }

      return parsed;
    }
  } catch {
    // Ignore parse errors
  }

  return { minimized: false };
}

export function useProfileSetupDismiss(): UseProfileSetupDismissReturn {
  const [state, setState] = useState<WidgetState>({ minimized: false });
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    setIsClient(true);
    setState(getStoredState());
  }, []);

  const persistState = useCallback((newState: WidgetState) => {
    setState(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  }, []);

  const minimize = useCallback(() => {
    persistState({ ...state, minimized: true });
  }, [state, persistState]);

  const expand = useCallback(() => {
    persistState({ ...state, minimized: false });
  }, [state, persistState]);

  const dismissFor24Hours = useCallback(() => {
    const dismissedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    persistState({ minimized: false, dismissedUntil });
  }, [persistState]);

  // Calculate visibility: not dismissed and client-side
  const isVisible = isClient && (!state.dismissedUntil || new Date(state.dismissedUntil) <= new Date());

  return { state, isVisible, minimize, expand, dismissFor24Hours };
}
