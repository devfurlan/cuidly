import PageProviders from '@/components/PageProviders';
import { WebSiteStructuredData } from '@/components/StructuredData';
import { Toaster } from '@/components/ui/shadcn/sonner';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';
import { Inter, Quicksand } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cuidly - Babás de Confiança',
  description:
    'Encontre babás qualificadas e verificadas para cuidar das suas crianças com carinho e segurança. Plataforma segura, prática e confiável para contratar a babá ideal para sua família.',
  icons: {
    icon: [
      {
        url: '/static/favicon-16.png',
        sizes: '16x16',
      },
      {
        url: '/static/favicon-32.png',
        sizes: '32x32',
      },
      {
        url: '/static/favicon-96.png',
        sizes: '96x96',
      },
      {
        url: '/static/favicon-180.png',
        sizes: '180x180',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${quicksand.variable} light antialiased`}
    >
      <head>
        <WebSiteStructuredData />
      </head>
      <GoogleAnalytics gaId="G-MS72CHHPVP" />
      <GoogleTagManager gtmId="GTM-5P3FNWZM" />
      <body>
        <PageProviders>{children}</PageProviders>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
