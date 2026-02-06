import { getPostBySlug, getRelatedPosts, getAllPostSlugs } from '@/lib/wordpress';
import { convertToBrasiliaDateTime } from '@cuidly/shared';
import { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import ButtonSharePost from '../_components/ButtonSharePost';
import CategoriesList from '../_components/CategoriesList';
import PostImage from '../_components/PostImage';
import TagsList from '../_components/TagsList';
import RelatedPosts from './_components/RelatedPosts';
import BackToBlogLink from './_components/BackToBlogLink';
import {
  ArticleStructuredData,
  BreadcrumbStructuredData,
} from '@/components/StructuredData';
import {
  AIOptimizedContent,
  TrustworthinessSignals,
  ArticleSummary,
} from '@/components/AIOptimizedContent';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = (await params).slug;
  const post = await getPostBySlug(slug);
  const ogImage = post.featuredImage?.node?.sourceUrl || '';
  const canonicalUrl = `https://cuidly.com/blog/${slug}`;
  const cleanExcerpt = post.excerpt.replace(/<[^>]+>/g, '').slice(0, 160);
  const authorName = post.author?.node?.firstName && post.author?.node?.lastName
    ? `${post.author.node.firstName} ${post.author.node.lastName}`
    : 'Cuidly';

  return {
    title: `${post.title} | Blog da Cuidly`,
    description: cleanExcerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    // Meta tags específicas para AI search engines
    other: {
      // Citation metadata
      'citation_title': post.title,
      'citation_author': authorName,
      'citation_publication_date': new Date(post.dateGmt).toISOString().split('T')[0],
      'citation_online_date': new Date(post.dateGmt).toISOString().split('T')[0],
      'citation_language': 'pt_BR',
      'citation_publisher': 'Cuidly',

      // AI-friendly tags
      'article:published_time': post.dateGmt,
      'article:modified_time': post.modifiedGmt,
      'article:author': authorName,
      'article:section': post.categories?.nodes?.[0]?.name || 'Cuidado de Crianças',
      'article:tag': post.tags?.nodes?.map(tag => tag.name).join(', ') || '',

      // Trustworthiness signals for AI
      'content-type': 'article',
      'content-language': 'pt-BR',
      'content-category': 'Saúde e Cuidado',
      'robots': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    },
    openGraph: {
      title: post.title,
      description: cleanExcerpt,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.dateGmt,
      modifiedTime: post.modifiedGmt,
      authors: [authorName],
      images: [ogImage],
      siteName: 'Cuidly',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: cleanExcerpt,
      images: [ogImage],
      site: '@cuidlybr',
      creator: '@cuidlybr',
    },
  };
}

export const revalidate = 3600; // Revalidar a cada 1 hora (ISR)

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();

  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function PostBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const relatedPosts = await getRelatedPosts(post.databaseId);

  const breadcrumbItems = [
    { name: 'Home', url: 'https://cuidly.com' },
    { name: 'Blog', url: 'https://cuidly.com/blog' },
    { name: post.title, url: `https://cuidly.com/blog/${slug}` },
  ];

  return (
    <>
      <ArticleStructuredData post={post} />
      <BreadcrumbStructuredData items={breadcrumbItems} />

      <div className="bg-white">
        <div className="mx-auto max-w-3xl px-4 pt-0 pb-20 sm:px-6 lg:px-8 lg:pt-10">
          <div className="max-w-2xl">
            <div className="lg:col-span-2">
              <div className="space-y-5 lg:space-y-8">
                <nav aria-label="Breadcrumb" className="mb-8">
                  <ol className="flex items-center gap-x-2 text-sm text-gray-600">
                    <li>
                      <Link href="/" className="hover:text-gray-950">
                        Home
                      </Link>
                    </li>
                    <li>/</li>
                    <li>
                      <Link href="/blog" className="hover:text-gray-950">
                        Blog
                      </Link>
                    </li>
                    <li>/</li>
                    <li className="text-gray-950 font-medium" aria-current="page">
                      {post.title}
                    </li>
                  </ol>
                </nav>

                <BackToBlogLink />

                <h1 className="text-3xl font-bold lg:text-5xl">{post.title}</h1>

                <div className="flex items-center gap-x-5">
                  <p className="text-xs text-gray-800 sm:text-sm">
                    {convertToBrasiliaDateTime(post.dateGmt, 'longDate')}
                  </p>
                </div>

                {/* Trustworthiness signals for AI */}
                <TrustworthinessSignals
                  publishDate={post.dateGmt}
                  modifiedDate={post.modifiedGmt}
                  author={
                    post.author?.node?.firstName && post.author?.node?.lastName
                      ? `${post.author.node.firstName} ${post.author.node.lastName}`
                      : 'Cuidly'
                  }
                />

                {!!post.featuredImage?.node.sourceUrl && (
                  <PostImage
                    mediaUrl={post.featuredImage?.node.sourceUrl}
                    alt={post.title}
                    variant="post"
                  />
                )}

                {/* AI-friendly summary */}
                <ArticleSummary excerpt={post.excerpt} />

                {/* AI-optimized content */}
                <AIOptimizedContent
                  content={post.content}
                  title={post.title}
                  category={post.categories?.nodes?.[0]?.name}
                  excerpt={post.excerpt.replace(/<[^>]+>/g, '').slice(0, 160)}
                />

                <div className="flex flex-col gap-y-5 lg:flex-row lg:items-center lg:justify-between lg:gap-y-0">
                  {post.tags && <TagsList tags={post.tags.nodes} />}
                  {post.categories && <CategoriesList categories={post.categories.nodes} />}

                  <div className="flex items-center justify-end gap-x-1.5">
                    <ButtonSharePost />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RelatedPosts posts={relatedPosts} />
      </div>
    </>
  );
}
