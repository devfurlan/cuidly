'use client';

import Footer from '@/app/(public-pages)/_components/Footer';
import Header from '@/app/(public-pages)/_components/Header';
import TopBanner from '@/app/(public-pages)/_components/TopBanner';
import { TopBannerProvider } from '@/contexts/TopBannerContext';

export default function TermsShell({ children }: { children: React.ReactNode }) {
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
