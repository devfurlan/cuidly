'use client';

import { createContext, useContext, useCallback, useState, ReactNode } from 'react';

type BackHandler = () => void;

const OnboardingBackContext = createContext<{
  onBack: BackHandler | null;
  setOnBack: (handler: BackHandler | null) => void;
}>({
  onBack: null,
  setOnBack: () => {},
});

export function OnboardingBackProvider({ children }: { children: ReactNode }) {
  const [onBack, setOnBackState] = useState<BackHandler | null>(null);

  const setOnBack = useCallback((handler: BackHandler | null) => {
    setOnBackState(() => handler);
  }, []);

  return (
    <OnboardingBackContext.Provider value={{ onBack, setOnBack }}>
      {children}
    </OnboardingBackContext.Provider>
  );
}

export function useOnboardingBack() {
  return useContext(OnboardingBackContext);
}
