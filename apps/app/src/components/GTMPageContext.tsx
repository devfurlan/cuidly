'use client';

import { useEffect } from 'react';

interface GTMPageContextProps {
  pageType: 'public' | 'lp' | 'terms' | 'auth' | 'dashboard' | 'onboarding';
  showCookieConsent: boolean;
}

/**
 * GTMPageContext - Envia informações de contexto para o Google Tag Manager
 *
 * Este componente envia dados para o dataLayer do GTM, permitindo que você
 * configure triggers condicionais no painel do GTM.
 *
 * Use showCookieConsent: true apenas para páginas onde o banner de cookies
 * deve aparecer (public-pages, lp, terms-pages).
 *
 * Exemplo de uso:
 * <GTMPageContext pageType="public" showCookieConsent={true} />
 */
export function GTMPageContext({ pageType, showCookieConsent }: GTMPageContextProps) {
  useEffect(() => {
    // Envia dados para o dataLayer do GTM
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'pageContext',
        pageType,
        showCookieConsent,
      });
    }
  }, [pageType, showCookieConsent]);

  return null;
}
