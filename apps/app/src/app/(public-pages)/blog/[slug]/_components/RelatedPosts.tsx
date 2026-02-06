import Link from 'next/link';
import { Fragment } from 'react';
import PostImage from '../../_components/PostImage';
import ReadMoreButton from '../../_components/ReadMoreButton';
import { BlogPosts } from '../../types';
import { sanitizeHtml } from '@/lib/sanitize-html';

export default function RelatedPosts({ posts }: { posts: BlogPosts }) {
  return (
    <div className="bg-white pb-24 sm:pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-fuchsia-600 sm:text-4xl">
            Leia também
          </h2>
          <p className="mt-2 text-lg/8 text-gray-600">
            Outros conteúdos que você pode gostar.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {posts.map((post) => (
            <Fragment key={post.slug}>
              <Link
                className="group flex flex-col items-start justify-between"
                href={`/blog/${post.slug}`}
              >
                <PostImage
                  mediaUrl={post.featuredImage?.node.sourceUrl || ''}
                  alt={post.title}
                  variant="related"
                />

                <div className="max-w-xl">
                  <div className="relative">
                    <h3 className="mt-3 text-lg/6 font-semibold text-gray-900">
                      <span className="absolute inset-0" />
                      {post.title}
                    </h3>
                    <div
                      className="mt-5 line-clamp-3 text-sm/6 text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(post.excerpt),
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
    </div>
  );
}
