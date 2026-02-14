import { MetadataRoute } from 'next';
import { getApolloClient } from '@/lib/api-clients/apollo';
import { gql } from '@apollo/client';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

export const revalidate = 3600; // Revalidar a cada 1 hora

interface WordPressPost {
  slug: string;
  modifiedGmt: string;
}

async function getAllPosts(): Promise<WordPressPost[]> {
  try {
    const { data } = await getApolloClient().query({
      query: gql`
        query GetAllPostsForSitemap {
          posts(first: 1000) {
            nodes {
              slug
              modifiedGmt
            }
          }
        }
      `,
    });

    return data.posts.nodes;
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
    return [];
  }
}

async function getAllPublicNannies(): Promise<Array<{ slug: string; city: string; updatedAt: Date }>> {
  try {
    // For now, return empty array
    // TODO: Add logic to fetch public nannies when needed
    return [];
  } catch (error) {
    console.error('Error fetching nannies for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cuidly.com';
  const posts = await getAllPosts();
  const nannies = await getAllPublicNannies();

  // Páginas estáticas principais
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/seja-baba`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Posts do blog
  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.modifiedGmt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Perfis públicos de babás
  const nannyProfiles: MetadataRoute.Sitemap = nannies.map((nanny) => ({
    url: `${baseUrl}/baba/${nanny.city}/${nanny.slug}`,
    lastModified: nanny.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPosts, ...nannyProfiles];
}
