import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isPublicRoute =
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/reset-password') ||
    request.nextUrl.pathname.startsWith('/forgot-password');

  // Redireciona para login se for rota protegida e não estiver autenticado
  if (!isApiRoute && !isPublicRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // CRITICAL SECURITY CHECK: Verify user is ADMIN using user_metadata
  // This works in Edge Runtime (middleware) unlike Prisma which requires Node.js runtime
  if (!isApiRoute && !isPublicRoute && user) {
    const userRole = user.user_metadata?.role;

    // If user is not ADMIN, deny access and redirect to login with error
    if (userRole !== 'ADMIN') {
      // Clear the session and redirect to login with error
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      loginUrl.searchParams.set(
        'message',
        'Acesso negado. Apenas administradores podem acessar o Cuidly Admin.',
      );

      // Create a new response with redirect
      const redirectResponse = NextResponse.redirect(loginUrl);

      // Try to sign out the user to clear the session completely
      await supabase.auth.signOut();

      return redirectResponse;
    }
  }

  // Redireciona para a home se estiver autenticado e acessar uma rota pública
  if (isPublicRoute && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
};
