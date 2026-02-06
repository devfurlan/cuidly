'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import {
  getSealColorClass,
  getSealDescription,
  getSealDisplayName,
  type NannySeal,
} from '@/lib/seals';
import { cn } from '@cuidly/shared';
import { PiMedal, PiShieldCheck, PiStar } from 'react-icons/pi';

interface SealBadgeProps {
  seal: NannySeal;
  /** Variant for different display contexts */
  variant?: 'default' | 'compact' | 'card';
  /** Additional className */
  className?: string;
  /** Show tooltip with seal description */
  showTooltip?: boolean;
}

function SealIcon({
  seal,
  className,
}: {
  seal: NannySeal;
  className?: string;
}) {
  switch (seal) {
    case 'IDENTIFICADA':
      return <PiStar className={className} />;
    case 'VERIFICADA':
      return <PiShieldCheck className={className} />;
    case 'CONFIAVEL':
      return <PiMedal className={className} />;
    default:
      return null;
  }
}

/**
 * SealBadge component displays the nanny seal with optional tooltip
 */
export function SealBadge({
  seal,
  variant = 'default',
  className,
  showTooltip = true,
}: SealBadgeProps) {
  if (!seal) return null;

  const colorClass = getSealColorClass(seal);
  const displayName = getSealDisplayName(seal).replace('Selo ', '');
  const description = getSealDescription(seal);

  const iconClass = cn('h-3.5 w-3.5', variant === 'compact' && 'h-3 w-3');

  const baseClasses = cn(
    'inline-flex items-center gap-1 rounded-full font-medium text-white shadow-md',
    colorClass,
    {
      'px-3 py-1 text-xs': variant === 'default',
      'px-2 py-0.5 text-2xs': variant === 'compact',
      'px-2 py-1 text-xs': variant === 'card',
    },
    className,
  );

  const badge = (
    <div className={baseClasses}>
      <SealIcon seal={seal} className={iconClass} />
      {displayName}
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
}
