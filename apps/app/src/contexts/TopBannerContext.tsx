'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface TopBannerContextType {
  isBannerVisible: boolean;
  closeBanner: () => void;
}

const TopBannerContext = createContext<TopBannerContextType | undefined>(
  undefined
);

export function TopBannerProvider({ children }: { children: ReactNode }) {
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const closeBanner = () => {
    setIsBannerVisible(false);
  };

  return (
    <TopBannerContext.Provider value={{ isBannerVisible, closeBanner }}>
      {children}
    </TopBannerContext.Provider>
  );
}

export function useTopBanner() {
  const context = useContext(TopBannerContext);
  if (context === undefined) {
    throw new Error('useTopBanner must be used within a TopBannerProvider');
  }
  return context;
}
