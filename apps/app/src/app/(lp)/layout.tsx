import type { Metadata } from 'next';
import Header from './_components/layout/Header';
import Footer from './_components/layout/Footer';
import { CookieConsentBanner } from '@/components/cookie-consent/CookieConsentBanner';
import { GTMPageContext } from '@/components/GTMPageContext';

export const metadata: Metadata = {
  title: 'Cuidly - Babás de Confiança',
  description:
    'Encontre babás qualificadas e verificadas para garantir o melhor cuidado para suas crianças. Plataforma segura, prática e confiável para contratar o apoio que faz a diferença.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <GTMPageContext pageType="lp" showCookieConsent={true} />
      <Header />
      {children}
      <Footer />
      <CookieConsentBanner />
    </div>
  );
}
