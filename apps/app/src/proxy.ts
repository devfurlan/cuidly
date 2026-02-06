import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { csrfProtection, setCsrfCookie, csrfErrorResponse, generateCsrfToken } from '@/lib/csrf';

/**
 * Security headers para todas as respostas
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS Protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=()'
  );

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com https://api.stripe.com https://*.google-analytics.com",
    "frame-src 'self' https://js.stripe.com https://www.google.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ];
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  // HSTS - apenas em produção
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip proxy for static files and _next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // arquivos estáticos como .ico, .png, etc.
  ) {
    return NextResponse.next();
  }

  // CSRF Protection para rotas de API
  if (pathname.startsWith('/api')) {
    const csrfResult = csrfProtection(request);
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error);
    }
  }

  // Session update via Supabase
  let response = await updateSession(request);

  // Add security headers
  response = addSecurityHeaders(response);

  // Set CSRF cookie se não existir (para navegação inicial)
  const existingCsrfToken = request.cookies.get('__csrf_token')?.value;
  if (!existingCsrfToken && !pathname.startsWith('/api')) {
    const token = generateCsrfToken();
    response = setCsrfCookie(response, token);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
