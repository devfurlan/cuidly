'use client';

/**
 * Blur Paywall Component
 *
 * Wraps content with a blur effect and shows a CTA
 * Used to hide premium content from non-paying users
 */

import { PiCrown, PiLock, PiUserPlus } from 'react-icons/pi';

import { Button } from '@/components/ui/shadcn/button';
import { cn } from '@cuidly/shared';
import Link from 'next/link';
import { ReactNode } from 'react';

interface BlurPaywallProps {
  children: ReactNode;
  isLocked: boolean;
  isLoggedIn: boolean;
  feature?: 'contact' | 'reviews' | 'references' | 'price' | 'details' | 'schedule';
  onUnlock?: () => void;
  className?: string;
  blurIntensity?: 'light' | 'medium' | 'heavy';
  showIcon?: boolean;
  ctaSize?: 'sm' | 'md' | 'lg';
}

const FEATURE_LABELS: Record<string, { locked: string; cta: string }> = {
  contact: {
    locked: 'Contato bloqueado',
    cta: 'Assine para ver',
  },
  reviews: {
    locked: 'Avaliações bloqueadas',
    cta: 'Assine para ver',
  },
  references: {
    locked: 'Referências bloqueadas',
    cta: 'Assine para ver',
  },
  price: {
    locked: 'Valores bloqueados',
    cta: 'Assine para ver',
  },
  details: {
    locked: 'Detalhes bloqueados',
    cta: 'Assine para ver',
  },
  schedule: {
    locked: 'Horários bloqueados',
    cta: 'Assine para ver',
  },
};

const BLUR_CLASSES = {
  light: 'blur-[2px]',
  medium: 'blur-[4px]',
  heavy: 'blur-[8px]',
};

export function BlurPaywall({
  children,
  isLocked,
  isLoggedIn,
  feature = 'details',
  onUnlock,
  className,
  blurIntensity = 'medium',
  showIcon = true,
  ctaSize = 'md',
}: BlurPaywallProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  const labels = FEATURE_LABELS[feature] || FEATURE_LABELS.details;

  return (
    <div className={cn('relative', className)}>
      {/* Blurred Content */}
      <div
        className={cn(
          BLUR_CLASSES[blurIntensity],
          'select-none pointer-events-none'
        )}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay with CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
        {showIcon && (
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-gray-100">
            <PiLock className="size-5 text-gray-500" />
          </div>
        )}

        <p className="mb-3 text-sm font-medium text-gray-600">
          {labels.locked}
        </p>

        {onUnlock ? (
          <Button
            size={ctaSize === 'sm' ? 'sm' : ctaSize === 'lg' ? 'lg' : 'default'}
            onClick={onUnlock}
            className="bg-fuchsia-600 hover:bg-fuchsia-700"
          >
            {isLoggedIn ? (
              <>
                <PiCrown className="mr-1.5 size-4" />
                {labels.cta}
              </>
            ) : (
              <>
                <PiUserPlus className="mr-1.5 size-4" />
                Cadastre-se Grátis
              </>
            )}
          </Button>
        ) : (
          <Button
            size={ctaSize === 'sm' ? 'sm' : ctaSize === 'lg' ? 'lg' : 'default'}
            className="bg-fuchsia-600 hover:bg-fuchsia-700"
            asChild
          >
            <Link href={isLoggedIn ? '/app/assinatura' : '/cadastro'}>
              {isLoggedIn ? (
                <>
                  <PiCrown className="mr-1.5 size-4" />
                  {labels.cta}
                </>
              ) : (
                <>
                  <PiUserPlus className="mr-1.5 size-4" />
                  Cadastre-se Grátis
                </>
              )}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline blur component for text content
 */
interface InlineBlurProps {
  children: ReactNode;
  isLocked: boolean;
  placeholder?: string;
}

export function InlineBlur({ children, isLocked, placeholder }: InlineBlurProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <span className="relative inline-block">
      <span className="pointer-events-none select-none blur-[4px]" aria-hidden="true">
        {children}
      </span>
      {placeholder && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {placeholder}
          </span>
        </span>
      )}
    </span>
  );
}

/**
 * Phone number blur component
 */
interface PhoneBlurProps {
  phone: string;
  isLocked: boolean;
  onUnlock?: () => void;
}

export function PhoneBlur({ phone, isLocked, onUnlock }: PhoneBlurProps) {
  if (!isLocked) {
    return <span>{phone}</span>;
  }

  // Show first 2 digits and mask the rest
  const maskedPhone = phone.replace(/(\d{2})(\d+)(\d{4})/, '$1 ****-$3');

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-gray-400">{maskedPhone}</span>
      {onUnlock && (
        <button
          onClick={onUnlock}
          className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs font-medium text-fuchsia-600 hover:bg-fuchsia-200"
        >
          Ver
        </button>
      )}
    </span>
  );
}
