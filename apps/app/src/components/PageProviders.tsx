'use client';

import { Analytics } from '@vercel/analytics/react';
import LogRocket from 'logrocket';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { useEffect } from 'react';

export default function PageProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    LogRocket.init('ia0iip/cuidly');
  }, []);

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
