/**
 * Layout for Nanny Profile Page with Dynamic Metadata
 * Route: /baba/[cidade]/[slug]
 *
 * Uses the same data fetching function as the page for deduplication
 */

import { Metadata } from 'next';
import { getNannyBySlug, generateCitySlug } from './_lib/get-nanny';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cidade: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, cidade } = await params;
  const nanny = await getNannyBySlug(slug);

  if (!nanny) {
    return {
      title: 'Perfil de Babá - Cuidly',
      description: 'Perfil de babá profissional na Cuidly',
    };
  }

  const citySlug = nanny.address ? generateCitySlug(nanny.address.city) : cidade;
  const canonicalUrl = `https://cuidly.com/baba/${citySlug}/${slug}`;

  // Create description from bio or default
  const description = nanny.aboutMe
    ? nanny.aboutMe.slice(0, 160)
    : `Conheça ${nanny.firstName}, babá profissional ${
        nanny.address ? `em ${nanny.address.city}, ${nanny.address.state}` : ''
      }. Perfil verificado pela Cuidly.`;

  const title = `${nanny.firstName} - Babá ${
    nanny.address ? `em ${nanny.address.city}` : ''
  } | Cuidly`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      `babá ${nanny.address?.city || ''}`,
      `babá profissional`,
      'babá de confiança',
      'contratar babá',
      `${nanny.firstName} babá`,
      'cuidadora de crianças',
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Cuidly',
      type: 'profile',
      locale: 'pt_BR',
      images: nanny.photoUrl
        ? [
            {
              url: nanny.photoUrl,
              width: 400,
              height: 400,
              alt: `Foto de ${nanny.firstName}`,
            },
          ]
        : [
            {
              url: 'https://cuidly.com/og-image.png',
              width: 1200,
              height: 630,
              alt: `Perfil de ${nanny.firstName} - Cuidly`,
            },
          ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: nanny.photoUrl
        ? [nanny.photoUrl]
        : ['https://cuidly.com/og-image.png'],
    },
    other: {
      'profile:username': nanny.firstName || '',
      'profile:gender': nanny.gender === 'MALE' ? 'male' : 'female',
      'robots': 'index, follow, max-snippet:-1, max-image-preview:large',
      'content-type': 'profile',
      'content-language': 'pt-BR',
      'geo.region': nanny.address?.state || '',
      'geo.placename': nanny.address?.city || '',
      'person-type': 'childcare professional',
      'profession': 'Babá',
    },
  };
}

export default function NannyProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
