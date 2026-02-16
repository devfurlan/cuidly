'use client';

import { cn } from '@cuidly/shared';
import Image from 'next/image';

type Props = {
  mediaUrl: string;
  variant: 'list' | 'post' | 'related' | 'home';
  alt?: string;
};

export default function PostImage({ mediaUrl, alt = '', variant }: Props) {
  const divClass = cn('relative aspect-video overflow-hidden lg:shrink-0', {
    'rounded-xl sm:aspect-2/1 lg:aspect-square lg:w-64': variant === 'list',
    'w-full rounded-2xl sm:aspect-2/1': variant === 'post',
    'rounded-xl sm:aspect-2/1 lg:aspect-3/2 lg:w-64': variant === 'related',
    'relative w-full': variant === 'home',
  });

  const divImage = cn(
    'absolute inset-0 start-0 top-0 size-full bg-gray-50 object-cover',
    {
      'transition-transform duration-500 ease-in-out group-hover:scale-105 group-focus:scale-105':
        variant === 'list' || variant === 'related',
      'aspect-video w-full rounded-2xl sm:aspect-2/1 lg:aspect-3/2':
        variant === 'home',
    },
  );

  return (
    <div className={divClass}>
      <>
        <Image src={mediaUrl} alt={alt} fill className={divImage} />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-gray-900/10 ring-inset" />
      </>
    </div>
  );
}
