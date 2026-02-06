/**
 * CSRF Protection Utilities
 *
 * Implementa proteção contra Cross-Site Request Forgery usando:
 * 1. Double Submit Cookie pattern (para APIs stateless)
 * 2. Verificação de Origin/Referer headers
 */

import { NextRequest, NextResponse } from 'next/server';

const CSRF_COOKIE_NAME = '__csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Gera um token CSRF criptograficamente seguro
 * Usa Web Crypto API para compatibilidade com Edge Runtime
 */
export function generateCsrfToken(): string {
  const bytes = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verifica se o Origin ou Referer da requisição é confiável
 */
function isOriginTrusted(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Lista de origens permitidas
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3300',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3300',
    'https://cuidly.com',
    'https://www.cuidly.com',
    'https://app.cuidly.com',
  ].filter(Boolean);

  // Verificar origin
  if (origin) {
    return allowedOrigins.some(allowed => origin.startsWith(allowed as string));
  }

  // Fallback para referer se origin não estiver presente
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return allowedOrigins.some(allowed => {
        if (!allowed) return false;
        const allowedUrl = new URL(allowed);
        return refererUrl.host === allowedUrl.host;
      });
    } catch {
      return false;
    }
  }

  // Requisições sem origin/referer (geralmente same-origin GET requests)
  // são permitidas apenas para métodos seguros
  return false;
}

/**
 * Comparação timing-safe de strings para Edge Runtime
 * Evita timing attacks comparando todos os caracteres
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verifica CSRF token usando Double Submit Cookie pattern
 */
function verifyCsrfToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  return timingSafeEqual(cookieToken, headerToken);
}

/**
 * Métodos HTTP que modificam estado e precisam de proteção CSRF
 */
const UNSAFE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Rotas que não precisam de proteção CSRF (webhooks, APIs internas, etc)
 */
const CSRF_EXEMPT_ROUTES = [
  '/api/webhooks/',
  '/api/cron/',
  '/api/auth/callback',
  '/api/auth/confirm',
  '/api/auth/exchange-reset-token', // Chamado internamente pelo reset-password
  '/api/auth/reset-password', // Formulário público de recuperação
  '/api/auth/signup', // Cadastro público (protegido pelo Supabase)
];

/**
 * Middleware de proteção CSRF
 * Use em middleware.ts ou em rotas de API individuais
 */
export function csrfProtection(request: NextRequest): { valid: boolean; error?: string } {
  const method = request.method.toUpperCase();
  const pathname = request.nextUrl.pathname;

  // Métodos seguros não precisam de verificação
  if (!UNSAFE_METHODS.includes(method)) {
    return { valid: true };
  }

  // Rotas isentas de CSRF
  if (CSRF_EXEMPT_ROUTES.some(route => pathname.startsWith(route))) {
    return { valid: true };
  }

  // Verificar Origin/Referer primeiro (defesa primária)
  if (!isOriginTrusted(request)) {
    // Se não há origin confiável, verificar token CSRF (defesa secundária)
    if (!verifyCsrfToken(request)) {
      return {
        valid: false,
        error: 'Requisição inválida: origem não confiável ou token CSRF ausente/inválido'
      };
    }
  }

  return { valid: true };
}

/**
 * Cria uma resposta com o cookie CSRF definido
 */
export function setCsrfCookie(response: NextResponse, token?: string): NextResponse {
  const csrfToken = token || generateCsrfToken();

  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Precisa ser acessível pelo JavaScript para enviar no header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 horas
  });

  return response;
}

/**
 * Helper para obter o token CSRF do cookie (uso no cliente)
 */
export function getCsrfTokenFromCookie(): string | null {
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

/**
 * Retorna uma resposta de erro CSRF
 */
export function csrfErrorResponse(message?: string): NextResponse {
  return NextResponse.json(
    { error: message || 'Requisição inválida' },
    { status: 403 }
  );
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
