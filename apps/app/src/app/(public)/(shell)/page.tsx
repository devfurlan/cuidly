import { GeolocationProvider } from '@/contexts/GeolocationContext';
import { Metadata } from 'next';
import CTAFinal from '@/app/(public)/_components/CTAFinal';
import FAQ from '@/app/(public)/_components/FAQ';
import Features from '@/app/(public)/_components/Features';
import Hero from '@/app/(public)/_components/Hero';
import HowItWorks from '@/app/(public)/_components/HowItWorks';
import NannyPreviewSection from '@/app/(public)/_components/NannyPreviewSection';

export const metadata: Metadata = {
  title: 'Encontre Babás Verificadas e de Confiança | Cuidly',
  description:
    'Encontre babás verificadas perto de você. Perfis com validação de identidade e antecedentes criminais. Cadastre-se grátis e busque a babá ideal para sua família.',
  keywords: [
    'babá',
    'babá profissional',
    'contratar babá',
    'cuidadora de crianças',
    'babá período integral',
    'babá meio período',
    'cuidado infantil',
    'babá de confiança',
  ],
  alternates: {
    canonical: 'https://cuidly.com',
  },
  openGraph: {
    title: 'Encontre Babás Verificadas e de Confiança | Cuidly',
    description:
      'Encontre babás verificadas perto de você. Perfis com validação de identidade e antecedentes criminais. Cadastre-se grátis e busque a babá ideal para sua família.',
    url: 'https://cuidly.com',
    siteName: 'Cuidly',
    type: 'website',
    locale: 'pt_BR',
    images: [
      {
        url: 'https://cuidly.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cuidly - Babás Verificadas e de Confiança',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Encontre Babás Verificadas e de Confiança | Cuidly',
    description:
      'Encontre babás verificadas perto de você. Perfis com validação de identidade e antecedentes criminais. Cadastre-se grátis e busque a babá ideal para sua família.',
    images: ['https://cuidly.com/og-image.png'],
  },
  other: {
    robots:
      'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    'content-type': 'website',
    'content-language': 'pt-BR',
    'geo.region': 'BR',
    'geo.position': '-23.5505;-46.6333',
    ICBM: '-23.5505, -46.6333',
  },
};

export default function HomePage() {
  return (
    <GeolocationProvider>
      <Hero />
      {/* <Stats /> */}
      <Features />
      <NannyPreviewSection />
      <HowItWorks />
      {/* <Testimonials /> */}
      {/* <Pricing /> */}
      <FAQ />
      <CTAFinal />
    </GeolocationProvider>
  );
}
