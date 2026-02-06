import { GeolocationProvider } from '@/contexts/GeolocationContext';
import { TopBannerProvider } from '@/contexts/TopBannerContext';
import { Metadata } from 'next';
import CTAFinal from './_components/CTAFinal';
import FAQ from './_components/FAQ';
import Features from './_components/Features';
import Footer from './_components/Footer';
import Header from './_components/Header';
import Hero from './_components/Hero';
import HowItWorks from './_components/HowItWorks';
import NannyPreviewSection from './_components/NannyPreviewSection';
import TopBanner from './_components/TopBanner';

export const metadata: Metadata = {
  title: 'Cuidly - Babás de Confiança | Contrate Profissionais Verificadas',
  description:
    'Encontre babás qualificadas e verificadas para cuidar das suas crianças. Conectamos famílias a profissionais de confiança para o cuidado especializado em todo o Brasil. Plataforma segura e prática.',
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
    title: 'Cuidly - Babás de Confiança',
    description:
      'Encontre babás qualificadas e verificadas. Conectamos famílias a profissionais de confiança para o cuidado especializado das suas crianças.',
    url: 'https://cuidly.com',
    siteName: 'Cuidly',
    type: 'website',
    locale: 'pt_BR',
    images: [
      {
        url: 'https://cuidly.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cuidly - Babás de Confiança',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuidly - Babás de Confiança',
    description:
      'Encontre babás qualificadas e verificadas para o cuidado especializado das suas crianças.',
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
      <TopBannerProvider>
        <div className="min-h-screen bg-white">
          <TopBanner />
          <Header />
          <main>
            <Hero />
            {/* <Stats /> */}
            <Features />
            <NannyPreviewSection />
            <HowItWorks />
            {/* <Testimonials /> */}
            {/* <Pricing /> */}
            <FAQ />
            <CTAFinal />
          </main>
          <Footer />
        </div>
      </TopBannerProvider>
    </GeolocationProvider>
  );
}
