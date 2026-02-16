import { getPaginatedPosts } from '@/lib/wordpress';
import { Metadata } from 'next';
import ListPostsCard from './_components/ListPostsCard';
import ListPostsPagination from './_components/ListPostsPagination';
import { BlogStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Blog da Cuidly | Cuidado Infantil e Dicas para Babás',
  description:
    'Dicas sobre cuidado infantil, rotina de babás e orientações para famílias. Artigos práticos sobre desenvolvimento infantil e contratação de babás.',
  alternates: {
    canonical: 'https://cuidly.com/blog',
  },
  openGraph: {
    title: 'Blog da Cuidly',
    description:
      'Conteúdos sobre cuidado infantil, rotina das babás e dicas para famílias que buscam apoio especializado.',
    url: 'https://cuidly.com/blog',
    siteName: 'Cuidly',
    type: 'website',
    images: [
      {
        url: 'https://cuidly.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Blog da Cuidly - Conteúdos sobre cuidado infantil',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog da Cuidly',
    description:
      'Conteúdos sobre cuidado infantil, rotina das babás e dicas para famílias que buscam apoio especializado.',
    images: ['https://cuidly.com/og-image.png'],
  },
};

export const revalidate = 1800; // Revalidar a cada 30 minutos (ISR)

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = parseInt(page || '1');
  const { posts, totalPages } = await getPaginatedPosts(currentPage);

  return (
    <>
      <BlogStructuredData />

      <div className="bg-white pt-20 pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-tight text-pretty text-gray-950 sm:text-5xl">
              Blog da Cuidly
            </h1>
            <p className="mt-2 text-lg/8 text-gray-600">
              Conteúdos sobre cuidado infantil, rotina das babás e dicas
              para famílias que buscam apoio especializado.
            </p>
            <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-20">
              {posts.map((post) => (
                <ListPostsCard key={post.databaseId} post={post} />
              ))}
            </div>

            <ListPostsPagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        </div>
      </div>
    </>
  );
}
