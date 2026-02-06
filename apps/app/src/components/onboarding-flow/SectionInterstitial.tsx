'use client';

import { Button } from '@/components/ui/shadcn/button';
import type { FlowSection } from '@/lib/onboarding-flow/family-questions';
import { motion } from 'framer-motion';
import { PiArrowRight, PiHandHeartDuotone } from 'react-icons/pi';

interface SectionInterstitialProps {
  section: FlowSection;
  totalSections?: number;
  onContinue: () => void;
}

export function SectionInterstitial({
  section,
  onContinue,
}: SectionInterstitialProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-fuchsia-100">
          <PiHandHeartDuotone className="size-8 text-fuchsia-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900">{section.label}</h2>

        <p className="text-base text-gray-500">{section.description}</p>

        <Button onClick={onContinue} size="lg" className="mt-4 w-full">
          Continuar
          <PiArrowRight className="ml-2 size-4" />
        </Button>
      </motion.div>
    </div>
  );
}
