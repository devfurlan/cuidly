'use client';

/**
 * Premium Gate Component
 *
 * A reusable component that blocks content for users without the required plan.
 * Shows a blurred overlay with a CTA to upgrade.
 */

import { PiCrown, PiLock } from 'react-icons/pi';

import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { ReactNode } from 'react';

interface PremiumGateProps {
  /** Whether the content is blocked */
  isBlocked: boolean;
  /** The content to display (will be blurred if blocked) */
  children: ReactNode;
  /** Title to show on the overlay */
  title?: string;
  /** Description to show on the overlay */
  description?: string;
  /** Text for the CTA button */
  ctaText?: string;
  /** Callback when CTA is clicked */
  onCtaClick?: () => void;
  /** Optional custom className */
  className?: string;
}

export function PremiumGate({
  isBlocked,
  children,
  title = 'Funcionalidade Exclusiva',
  description = 'Assine um plano para acessar esta funcionalidade.',
  ctaText = 'Fazer Upgrade',
  onCtaClick,
  className = '',
}: PremiumGateProps) {
  if (!isBlocked) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
        <Card className="p-6 max-w-md text-center shadow-lg">
          <PiLock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            {title}
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            {description}
          </p>
          {onCtaClick && (
            <Button onClick={onCtaClick} className="w-full">
              <PiCrown className="w-4 h-4" />
              {ctaText}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}

/**
 * Premium Tooltip Component
 *
 * A simple tooltip/badge to show on disabled buttons
 */
interface PremiumTooltipProps {
  /** Whether the feature is blocked */
  isBlocked: boolean;
  /** The button/element to wrap */
  children: ReactNode;
  /** Tooltip message */
  message?: string;
}

export function PremiumTooltip({
  isBlocked,
  children,
  message = 'Assine um plano para usar',
}: PremiumTooltipProps) {
  if (!isBlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      <div className="pointer-events-none opacity-50">
        {children}
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        {message}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}

/**
 * Profile Limit Banner Component
 *
 * Shows a banner when user is approaching or has reached profile view limit
 */
interface ProfileLimitBannerProps {
  viewsUsed: number;
  viewLimit: number;
  isUnlimited: boolean;
  onUpgradeClick?: () => void;
}

export function ProfileLimitBanner({
  viewsUsed,
  viewLimit,
  isUnlimited,
  onUpgradeClick,
}: ProfileLimitBannerProps) {
  if (isUnlimited) {
    return null;
  }

  const isAtLimit = viewsUsed >= viewLimit;
  const isNearLimit = viewsUsed >= viewLimit - 1;

  if (!isNearLimit && !isAtLimit) {
    return null;
  }

  return (
    <div className={`p-4 rounded-lg ${isAtLimit ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className={`font-medium ${isAtLimit ? 'text-red-800' : 'text-amber-800'}`}>
            {isAtLimit
              ? `Você atingiu o limite de ${viewLimit} perfis`
              : `Você visualizou ${viewsUsed} de ${viewLimit} perfis`}
          </p>
          <p className={`text-sm ${isAtLimit ? 'text-red-600' : 'text-amber-600'}`}>
            {isAtLimit
              ? 'Assine um plano para ver perfis ilimitados'
              : 'Assine um plano para ter acesso ilimitado'}
          </p>
        </div>
        {onUpgradeClick && (
          <Button onClick={onUpgradeClick} size="sm" variant={isAtLimit ? 'default' : 'outline'}>
            <PiCrown className="w-4 h-4" />
            Fazer Upgrade
          </Button>
        )}
      </div>
    </div>
  );
}
