import { BlogPost } from '@/app/(public)/(shell)/blog/types';
import { getExperienceYearsLabel } from '@/helpers/label-getters';

interface ArticleStructuredDataProps {
  post: BlogPost;
}

export function ArticleStructuredData({ post }: ArticleStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt.replace(/<[^>]+>/g, '').slice(0, 160),
    image: post.featuredImage?.node?.sourceUrl || '',
    datePublished: post.dateGmt,
    dateModified: post.modifiedGmt,
    author: {
      '@type': 'Person',
      name: post.author?.node?.firstName && post.author?.node?.lastName
        ? `${post.author.node.firstName} ${post.author.node.lastName}`
        : 'Cuidly',
      url: post.author?.node?.slug
        ? `https://cuidly.com/autor/${post.author.node.slug}`
        : 'https://cuidly.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cuidly',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cuidly.com/static/favicon-512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://cuidly.com/blog/${post.slug}`,
    },
    articleSection: post.categories?.nodes?.map((cat) => cat.name).join(', '),
    keywords: post.tags?.nodes?.map((tag) => tag.name).join(', '),
    // AI-friendly metadata
    inLanguage: 'pt-BR',
    about: {
      '@type': 'Thing',
      name: 'Cuidado de Crianças',
      description: 'Informações sobre cuidado de crianças, babás e apoio a famílias',
    },
    isAccessibleForFree: true,
    isPartOf: {
      '@type': 'Blog',
      name: 'Blog da Cuidly',
      url: 'https://cuidly.com/blog',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({
  items
}: {
  items: Array<{ name: string; url: string }>
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function WebSiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cuidly',
    url: 'https://cuidly.com',
    description: 'Encontre babás qualificadas e verificadas para cuidar das suas crianças com carinho e segurança.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://cuidly.com/buscar?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BlogStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog da Cuidly',
    description: 'Conteúdos sobre cuidado de crianças, rotina das babás e dicas para famílias que buscam apoio especializado.',
    url: 'https://cuidly.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Cuidly',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cuidly.com/static/favicon-512.png',
      },
    },
    inLanguage: 'pt-BR',
    about: {
      '@type': 'Thing',
      name: 'Cuidado de Crianças no Brasil',
      description: 'Informações confiáveis sobre cuidado de crianças, contratação de babás profissionais e apoio a famílias',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQStructuredData({ items }: { items: FAQItem[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cuidly',
    url: 'https://cuidly.com',
    logo: 'https://cuidly.com/static/favicon-512.png',
    description: 'Plataforma onde babás qualificadas e verificadas se cadastram e famílias buscam por elas em todo o Brasil',
    sameAs: [
      'https://www.instagram.com/cuidlybr',
      'https://www.linkedin.com/company/cuidly',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: 'pt-BR',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface CaregiverProfileData {
  firstName: string;
  age: number;
  slug: string;
  aboutMe: string | null;
  photoUrl: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHERWISE' | null;
  experienceYears: string | null;
  specialties: string[];
  address: {
    city: string;
    state: string;
  } | null;
}

export function CaregiverProfileStructuredData({
  caregiver
}: {
  caregiver: CaregiverProfileData
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: caregiver.firstName,
    jobTitle: 'Babá',
    description: caregiver.aboutMe || 'Babá profissional',
    image: caregiver.photoUrl || undefined,
    url: `https://cuidly.com/baba/${caregiver.slug}`,
    worksFor: {
      '@type': 'Organization',
      name: 'Cuidly',
      url: 'https://cuidly.com',
    },
    knowsAbout: caregiver.specialties.length > 0
      ? caregiver.specialties
      : ['Cuidado de Crianças', 'Educação Infantil'],
    address: caregiver.address ? {
      '@type': 'PostalAddress',
      addressLocality: caregiver.address.city,
      addressRegion: caregiver.address.state,
      addressCountry: 'BR',
    } : undefined,
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Babá',
      occupationLocation: {
        '@type': 'City',
        name: caregiver.address?.city || 'Brasil',
      },
      skills: caregiver.specialties.join(', '),
      experienceRequirements: caregiver.experienceYears
        ? getExperienceYearsLabel(parseInt(caregiver.experienceYears, 10))
        : undefined,
    },
    // AI-friendly metadata
    alumniOf: undefined, // Can be added if we have education info
    award: undefined, // Can be added if we have certifications
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'profileId',
      value: caregiver.slug,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function LocalBusinessStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://cuidly.com/#organization',
    name: 'Cuidly',
    image: 'https://cuidly.com/static/favicon-512.png',
    url: 'https://cuidly.com',
    telephone: '+55-11-99483-3226',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BR',
      addressRegion: 'Brasil',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-23.5505',
      longitude: '-46.6333',
    },
    description: 'Plataforma onde babás qualificadas e verificadas se cadastram e famílias buscam por elas em todo o Brasil',
    areaServed: {
      '@type': 'Country',
      name: 'Brasil',
    },
    serviceType: [
      'Babás',
      'Cuidado de Crianças',
      'Acompanhamento Infantil',
      'Babá Período Integral',
    ],
    knowsAbout: [
      'Cuidado de Crianças',
      'Educação Infantil',
      'Desenvolvimento Infantil',
      'Primeiros Socorros Pediátricos',
    ],
    sameAs: [
      'https://www.instagram.com/cuidlybr',
      'https://www.linkedin.com/company/cuidly',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function JobPostingStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: 'Babá',
    description: 'Cadastre-se gratuitamente e receba propostas de atendimento para crianças em todo o Brasil. Flexibilidade de horários, pagamento garantido e benefícios exclusivos.',
    identifier: {
      '@type': 'PropertyValue',
      name: 'Cuidly',
      value: 'baba',
    },
    datePosted: '2024-01-01',
    validThrough: '2025-12-31',
    employmentType: ['CONTRACTOR', 'PART_TIME', 'FULL_TIME'],
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Cuidly',
      sameAs: 'https://cuidly.com',
      logo: 'https://cuidly.com/static/favicon-512.png',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'BR',
        addressRegion: 'Brasil',
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'BRL',
      value: {
        '@type': 'QuantitativeValue',
        value: 2500,
        unitText: 'MONTH',
      },
    },
    qualifications: 'Experiência com cuidado de crianças',
    responsibilities: 'Acompanhamento e cuidado de crianças, auxílio em atividades diárias',
    skills: 'Empatia, paciência, responsabilidade, conhecimentos em primeiros socorros pediátricos',
    benefits: 'Flexibilidade de horários, pagamento garantido, certificado de antecedentes criminais gratuito',
    jobBenefits: 'Flexibilidade de horários, pagamento garantido, suporte para MEI',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
