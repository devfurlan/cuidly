import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  // Add pathname to headers for server components to use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
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
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
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
  const isPrivateRoute = request.nextUrl.pathname.startsWith('/app/private');
  // const isAuthRoute = request.nextUrl.pathname.startsWith('/app');

  // Redireciona para login se for rota protegida e não estiver autenticado
  if (!isApiRoute && isPrivateRoute && !user) {
    return NextResponse.redirect(new URL('/app/login', request.url));
  }

  // Redireciona para a home se estiver autenticado e acessar uma rota pública
  // if (isAuthRoute && user) {
  //   return NextResponse.redirect(new URL('/app/private/partner', request.url));
  // }

  return response;
};
