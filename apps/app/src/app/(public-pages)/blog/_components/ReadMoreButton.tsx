'use client';

import { PiArrowRight } from 'react-icons/pi';

export default function ReadMoreButton() {
  return (
    <p className="mt-6 inline-flex items-center gap-x-1 text-sm font-medium text-fuchsia-600 group-hover:text-fuchsia-700 group-hover:underline group-focus:text-fuchsia-700 group-focus:underline">
      Leia mais
      <PiArrowRight className="size-4 shrink-0 text-fuchsia-600 group-hover:text-fuchsia-700 group-focus:text-fuchsia-700" />
    </p>
  );
}
