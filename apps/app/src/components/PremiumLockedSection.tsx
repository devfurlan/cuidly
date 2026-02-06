'use client';

import { PiCrown, PiLock, PiSparkle } from 'react-icons/pi';

import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { cn } from '@cuidly/shared';

interface PremiumLockedSectionProps {
  children: React.ReactNode;
  onUnlock: () => void;
  title?: string;
  description?: string;
  className?: string;
  blurIntensity?: 'light' | 'medium' | 'heavy';
}

export function PremiumLockedSection({
  children,
  onUnlock,
  title = 'Conteúdo Exclusivo',
  description = 'Assine para desbloquear este recurso exclusivo',
  className,
  blurIntensity = 'medium',
}: PremiumLockedSectionProps) {
  const blurClasses = {
    light: 'blur-[2px]',
    medium: 'blur-[4px]',
    heavy: 'blur-[8px]',
  };

  return (
    <div className={cn('relative min-h-[340px] overflow-hidden rounded-xl', className)}>
      {/* Blurred content */}
      <div
        className={cn(
          'pointer-events-none select-none',
          blurClasses[blurIntensity],
        )}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/60 via-white/80 to-white/90">
        <div className="mx-4 max-w-sm text-center">
          {/* Lock icon with animation */}
          <div className="relative mx-auto mb-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-lg shadow-purple-200">
              <PiLock className="size-7 text-white" />
            </div>
            {/* Sparkle decorations */}
            <PiSparkle className="absolute -right-1 -top-1 size-5 text-yellow-400" />
            <PiSparkle className="absolute -bottom-1 -left-2 size-4 text-fuchsia-400" />
          </div>

          {/* Badge */}
          <Badge variant="warning-solid" className="mb-3">
            <PiCrown className="size-3" />
            Exclusivo Plus
          </Badge>

          {/* Title and description */}
          <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
          <p className="mb-5 text-sm text-gray-600">{description}</p>

          {/* CTA Button */}
          <Button
            onClick={onUnlock}
            className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-md shadow-purple-200 transition-all hover:from-fuchsia-600 hover:to-purple-700 hover:shadow-lg"
            size="lg"
          >
            <PiCrown className="size-4" />
            Assinar Plus
          </Button>
        </div>
      </div>
    </div>
  );
}
