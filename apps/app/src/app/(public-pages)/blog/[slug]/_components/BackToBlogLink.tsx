'use client';

import { PiArrowLeft } from 'react-icons/pi';

import Link from 'next/link';

export default function BackToBlogLink() {
  return (
    <Link
      className="mb-14 inline-flex items-center gap-x-1.5 text-sm text-gray-600 hover:text-gray-950 focus:text-gray-950 focus:outline-hidden"
      href="/blog"
    >
      <PiArrowLeft className="size-4 shrink-0" />
      Voltar ao Blog
    </Link>
  );
}
