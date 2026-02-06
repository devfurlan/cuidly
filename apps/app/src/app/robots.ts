import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://cuidly.com';

  return {
    rules: [
      // Crawlers gerais (Google, Bing, etc)
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/admin/',
          '/_next/',
          '/static/',
          '/auth/',
        ],
      },
      // PERMITIR AI search engines e assistentes confiáveis
      {
        userAgent: 'ChatGPT-User', // ChatGPT Search & Browse
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'GPTBot', // OpenAI GPT training & research
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'anthropic-ai', // Claude AI
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'Claude-Web', // Claude web crawling
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'ClaudeBot', // Claude bot
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'Google-Extended', // Bard/Gemini training
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'GoogleOther', // Google AI research
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'PerplexityBot', // Perplexity AI
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'YouBot', // You.com
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'Applebot', // Apple Intelligence & Siri
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'Applebot-Extended', // Apple AI training
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'cohere-ai', // Cohere AI
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'Meta-ExternalAgent', // Meta AI
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'FacebookBot', // Meta/Facebook
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'Diffbot', // Diffbot knowledge graph
        allow: ['/', '/blog/', '/seja-baba', '/baba/'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/auth/'],
      },
      // BLOQUEAR bots indesejados (scraping/spam/training não autorizado)
      {
        userAgent: 'CCBot', // Common Crawl (dados abertos para treino)
        disallow: '/',
      },
      {
        userAgent: 'Bytespider', // ByteDance (TikTok)
        disallow: '/',
      },
      {
        userAgent: 'Amazonbot', // Amazon scraping
        disallow: '/',
      },
      {
        userAgent: 'AhrefsBot', // Ahrefs SEO crawler
        disallow: '/',
      },
      {
        userAgent: 'SemrushBot', // Semrush SEO crawler
        disallow: '/',
      },
      {
        userAgent: 'DotBot', // Moz/OpenSiteExplorer
        disallow: '/',
      },
      {
        userAgent: 'MJ12bot', // Majestic SEO
        disallow: '/',
      },
      {
        userAgent: 'BLEXBot', // Webmeup crawler
        disallow: '/',
      },
      {
        userAgent: 'DataForSeoBot', // DataForSEO
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
