'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import {
  trackCookieConsentAccepted,
  trackCookieConsentDeclined,
} from '@/lib/gtm-events';

const COOKIE_NAME = 'cookieConsent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getCookieConsent(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookieConsent(value: 'accepted' | 'declined') {
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

export function CookieConsentBanner() {
  const [state, setState] = useState<'hidden' | 'show' | 'hide'>('hidden');

  useEffect(() => {
    const existing = getCookieConsent();
    if (existing) return;

    const timer = setTimeout(() => setState('show'), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setCookieConsent('accepted');
    trackCookieConsentAccepted();
    setState('hide');
  };

  const handleDecline = () => {
    setCookieConsent('declined');
    trackCookieConsentDeclined();
    setState('hide');
  };

  const handleAnimationEnd = () => {
    if (state === 'hide') setState('hidden');
  };

  if (state === 'hidden') return null;

  return (
    <Card
      data-state={state}
      onAnimationEnd={handleAnimationEnd}
      className="fixed bottom-4 left-4 z-50 w-[calc(100%-2rem)] max-w-3xl p-3 shadow-lg data-[state=hide]:animate-out data-[state=hide]:fade-out data-[state=hide]:slide-out-to-bottom-4 data-[state=hide]:duration-300 data-[state=show]:animate-in data-[state=show]:fade-in data-[state=show]:slide-in-from-bottom-4 data-[state=show]:duration-500 sm:left-4 sm:w-auto"
    >
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-gray-500 sm:flex-1 sm:text-sm">
          Utilizamos cookies para melhorar sua experiência.{' '}
          <Link
            href="/termos/politica-de-cookies"
            className="font-medium text-fuchsia-600 underline underline-offset-4 hover:text-fuchsia-700"
          >
            Saiba mais
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-4 text-xs"
            onClick={handleDecline}
          >
            Recusar
          </Button>
          <Button
            size="sm"
            className="h-8 px-4 text-xs"
            onClick={handleAccept}
          >
            Aceitar
          </Button>
        </div>
      </div>
    </Card>
  );
}
