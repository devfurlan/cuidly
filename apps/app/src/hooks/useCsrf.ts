'use client';

import { useCallback, useEffect, useState } from 'react';

const CSRF_COOKIE_NAME = '__csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Hook para gerenciar CSRF token no cliente
 */
export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // Obter token do cookie
    const token = getCsrfTokenFromCookie();
    setCsrfToken(token);
  }, []);

  /**
   * Retorna headers com CSRF token para usar em fetch requests
   */
  const getCsrfHeaders = useCallback((): HeadersInit => {
    if (!csrfToken) return {};
    return {
      [CSRF_HEADER_NAME]: csrfToken,
    };
  }, [csrfToken]);

  /**
   * Wrapper para fetch que inclui automaticamente o CSRF token
   */
  const secureFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = getCsrfTokenFromCookie();

      const headers = new Headers(options.headers);
      if (token) {
        headers.set(CSRF_HEADER_NAME, token);
      }

      return fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Importante para enviar cookies
      });
    },
    []
  );

  return {
    csrfToken,
    getCsrfHeaders,
    secureFetch,
  };
}

/**
 * Obtém o CSRF token do cookie
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
