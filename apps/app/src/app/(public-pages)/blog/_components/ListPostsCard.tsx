'use client';

import Link from 'next/link';
import { BlogPost } from '../types';
import PostImage from './PostImage';
import ReadMoreButton from './ReadMoreButton';

export default function ListPostsCard({ post }: { post: BlogPost }) {
  return (
    <Link
      className="group relative isolate flex flex-col gap-8 lg:flex-row"
      href={`/blog/${post.slug}`}
    >
      <PostImage
        mediaUrl={post.featuredImage?.node.sourceUrl || ''}
        alt={post.title}
        variant="list"
      />
      <div className="relative max-w-xl">
        <h3 className="mb-4 text-2xl font-semibold text-gray-950">
          {post.title}
        </h3>
        <div
          className="text-base text-gray-600"
          dangerouslySetInnerHTML={{
            __html: post.excerpt,
          }}
        />
        <ReadMoreButton />
      </div>
    </Link>
  );
}
