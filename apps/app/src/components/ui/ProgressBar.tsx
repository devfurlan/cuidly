'use client';

import { Progress } from '@/components/ui/shadcn/progress';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  className,
}: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={className}>
      {/* <div className="mb-2 flex items-center justify-center gap-1">
        <span className="text-xs text-gray-600">
          Etapa {currentStep} de {totalSteps}
        </span>
      </div> */}
      <Progress value={progress} className="h-2" />
    </div>
  );
}
