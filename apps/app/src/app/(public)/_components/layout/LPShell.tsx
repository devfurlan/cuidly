'use client';

import Footer from '@/app/(public)/_components/Footer';
import Header from '@/app/(public)/_components/Header';
import TopBanner from '@/app/(public)/_components/TopBanner';
import { TopBannerProvider } from '@/contexts/TopBannerContext';

export default function LPShell({ children }: { children: React.ReactNode }) {
  return (
    <TopBannerProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <TopBanner />
        <Header />
        <main className="grow pt-16">{children}</main>
        <Footer />
      </div>
    </TopBannerProvider>
  );
}
