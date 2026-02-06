'use client';

import { cn } from '@/utils/cn';
import { formatNumberWithDots } from '@/utils/formatNumberWithDots';
import { Icon } from '@phosphor-icons/react';
import Image from 'next/image';

export default function CardNumber({
  title,
  number,
  color,
  icon: Icon,
  avatars,
}: {
  title: string;
  number: number;
  color:
    | 'pink'
    | 'green'
    | 'orange'
    | 'cyan'
    | 'blue'
    | 'purple'
    | 'violet'
    | 'red'
    | 'yellow'
    | 'gray'
    | 'slate'
    | 'zinc'
    | 'neutral'
    | 'stone'
    | 'amber'
    | 'lime'
    | 'emerald'
    | 'teal'
    | 'sky'
    | 'indigo'
    | 'fuchsia'
    | 'rose';
  icon?: Icon;
  avatars?: { src: string; alt: string }[];
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-gray-200 bg-white bg-linear-to-br from-15% to-white to-50% shadow-sm dark:border-neutral-700 dark:bg-neutral-800',
        `from-${color}-50`,
      )}
    >
      <div className="p-5">
        <div className="mb-3 flex justify-between gap-4">
          <div className="flex size-10 items-center justify-center rounded-md border border-gray-200 bg-white shadow">
            {Icon && <Icon size={20} className={`text-${color}-600`} />}
          </div>
        </div>
        <h2 className="flex-1 text-base font-normal text-gray-700">{title}</h2>
        <div className="flex items-center justify-between">
          <p className="flex-1 text-2xl font-bold text-gray-950">
            {formatNumberWithDots(number)}
          </p>
          {avatars && (
            <div className="flex -space-x-1">
              {avatars.map(({ src, alt }) => (
                <Image
                  key={src}
                  className="inline-block size-7 rounded-full ring-2 ring-white dark:ring-neutral-900"
                  src={src}
                  alt={alt}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
