'use client';

import { Button } from '@/components/ui/shadcn/button';
import { useTopBanner } from '@/contexts/TopBannerContext';
import { PiArrowRight, PiX } from 'react-icons/pi';

export default function TopBanner() {
  const { isBannerVisible, closeBanner } = useTopBanner();

  if (!isBannerVisible) {
    return null;
  }

  return (
    <div className="sticky top-0 isolate z-50 flex items-center gap-x-6 overflow-hidden bg-fuchsia-50 px-6 py-2 sm:px-3.5 sm:before:flex-1">
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
          className="aspect-577/310 w-144.25 bg-linear-to-r from-[#CE93D8] to-[#5C6BC0] opacity-30"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-[max(45rem,calc(50%+8rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
          className="aspect-577/310 w-144.25 bg-linear-to-r from-[#CE93D8] to-[#5C6BC0] opacity-30"
        />
      </div>
      <p className="text-sm/6 text-blue-800">
        <a href="/promo/babas" className="flex items-center gap-x-2 hover:text-blue-600">
          <strong className="font-semibold">É babá?</strong>
          <span className="font-medium">1 mês Pro grátis!</span>
          <PiArrowRight className="size-4" />
        </a>
      </p>
      <div className="flex flex-1 justify-end">
        <Button variant={'ghost'} size={'sm'} onClick={closeBanner}>
          <span className="sr-only">Fechar</span>
          <PiX aria-hidden="true" className="size-5 text-gray-900" />
        </Button>
      </div>
    </div>
  );
}
