'use client';

import { PiArrowLeft } from 'react-icons/pi';

import LogoCuidly from '@/components/LogoCuidly';
import { useOnboardingBack } from '@/components/onboarding-flow/OnboardingBackContext';
import { Button } from '@/components/ui/shadcn/button';

export function OnboardingHeader() {
  const { onBack } = useOnboardingBack();

  return (
    <header className="border-b border-fuchsia-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center px-4 py-7 sm:px-6">
        <div className="w-10">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="size-10 text-gray-500 hover:text-gray-700"
            >
              <PiArrowLeft className="size-5" />
            </Button>
          )}
        </div>
        <div className="flex flex-1 justify-center">
          <LogoCuidly height={32} color="pink" />
        </div>
        <div className="w-10" />
      </div>
    </header>
  );
}
