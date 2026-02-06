'use client';

import { cn } from '@cuidly/shared';

interface ProfileSetupProgressProps {
  completedSegments: number;
  totalSegments: number;
  userType: 'nanny' | 'family';
}

export function ProfileSetupProgress({
  completedSegments,
  totalSegments,
  userType,
}: ProfileSetupProgressProps) {
  const filledSegments = completedSegments;
  const fillColor = userType === 'nanny' ? 'bg-fuchsia-500' : 'bg-green-500';

  return (
    <div className="flex gap-1">
      {Array.from({ length: totalSegments }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 flex-1 rounded-full transition-colors duration-300',
            i < filledSegments ? fillColor : 'bg-gray-200'
          )}
        />
      ))}
    </div>
  );
}
