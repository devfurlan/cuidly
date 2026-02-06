'use client';

import { Progress } from '@/components/ui/shadcn/progress';

interface FlowProgressProps {
  currentGlobalQuestion: number;
  totalGlobalQuestions: number;
  className?: string;
}

export function FlowProgress({
  currentGlobalQuestion,
  totalGlobalQuestions,
  className,
}: FlowProgressProps) {
  const progress =
    totalGlobalQuestions > 0
      ? (currentGlobalQuestion / totalGlobalQuestions) * 100
      : 0;

  return (
    <div className={className}>
      <Progress
        value={progress}
        className="-mt-2 h-1.5 rounded-none bg-white/80"
      />
    </div>
  );
}
