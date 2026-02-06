'use client';

import { Analytics } from '@vercel/analytics/react';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export default function PageProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Analytics />
      <ProgressBar
        height="2px"
        color="#d93275"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
}
