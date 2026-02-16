import PostImage from '@/app/(public)/(shell)/blog/_components/PostImage';
import ReadMoreButton from '@/app/(public)/(shell)/blog/_components/ReadMoreButton';
import { getLatestPosts } from '@/lib/wordpress';
import Link from 'next/link';
import { Fragment } from 'react';

export default async function BlogSection() {
  const posts = await getLatestPosts(3);
  return (
    <section id="blog" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
            Blog da Cuidly
          </h2>
          <p className="mt-2 text-lg/8 text-gray-600">
            Dicas, histórias e orientações para quem cuida e para quem precisa
            de cuidado. Tudo feito para apoiar você e sua família.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <Fragment key={post.slug}>
              <Link
                className="group flex flex-col items-start justify-between"
                href={`/blog/${post.slug}`}
              >
                <PostImage
                  mediaUrl={post.featuredImage?.node.sourceUrl || ''}
                  alt={post.title}
                  variant="home"
                />

                <div className="max-w-xl">
                  <div className="relative">
                    <h3 className="mt-3 text-lg/6 font-semibold text-gray-900">
                      <span className="absolute inset-0" />
                      {post.title}
                    </h3>
                    <div
                      className="mt-5 line-clamp-3 text-base/6 text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: post.excerpt,
                      }}
                    />
                    <ReadMoreButton />
                  </div>
                </div>
              </Link>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
