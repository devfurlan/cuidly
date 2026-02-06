import { GTMPageContext } from '@/components/GTMPageContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cuidly - Babás de Confiança',
  description:
    'Encontre babás qualificadas e verificadas para cuidar das suas crianças com carinho e segurança. Plataforma segura, prática e confiável para contratar a babá ideal.',
  keywords: [
    'babá',
    'babá de confiança',
    'cuidadora de crianças',
    'babá profissional',
    'cuidado infantil',
  ],
  other: {
    robots: 'index, follow, max-snippet:-1, max-image-preview:large',
    'content-language': 'pt-BR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <GTMPageContext pageType="public" showCookieConsent={true} />
      {children}
    </div>
  );
}
