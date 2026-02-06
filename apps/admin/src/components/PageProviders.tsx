'use client';

import NextTopLoader from 'nextjs-toploader';
import { Toaster } from './ui/toaster';

export default function PageProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NextTopLoader
        color="#d93275"
        height={2}
        showSpinner={false}
        shadow="0 0 10px #d93275,0 0 5px #d93275"
      />
      {children}
      <Toaster />
    </>
  );
}
