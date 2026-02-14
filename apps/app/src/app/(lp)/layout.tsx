import type { Metadata } from 'next';
import { CookieConsentBanner } from '@/components/cookie-consent/CookieConsentBanner';
import { GTMPageContext } from '@/components/GTMPageContext';
import LPShell from './_components/layout/LPShell';

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
    <>
      <GTMPageContext pageType="lp" showCookieConsent={true} />
      <LPShell>{children}</LPShell>
      <CookieConsentBanner />
    </>
  );
}
