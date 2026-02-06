'use client';

import LogoCuidly from '@/components/LogoCuidly';

export function OnboardingHeader() {
  return (
    <header className="border-b border-fuchsia-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-7 sm:px-6">
        <LogoCuidly height={32} color="pink" />
      </div>
    </header>
  );
}
