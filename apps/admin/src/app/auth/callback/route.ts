import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const redirectTo = searchParams.get('redirect_to')?.toString();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error(
          'Error fetching user data: ',
          userError.message || 'Unknown error',
        );
        return NextResponse.redirect(`${origin}/error`);
      }

      // Buscar admin user pelo email
      const existingAdmin = await prisma.adminUser.findUnique({
        where: {
          email: data?.user?.email,
        },
        select: { id: true, email: true, status: true },
      });

      if (!existingAdmin) {
        // Não permitir criação automática de usuários no ops via OAuth
        // Apenas administradores previamente cadastrados podem acessar
        console.error('OAuth login attempt by non-admin user:', data?.user?.email);
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=Acesso negado. Apenas administradores podem acessar este sistema.`);
      }

      // Verificar status do usuário
      if (existingAdmin.status !== 'ACTIVE') {
        console.error('OAuth login attempt by inactive user:', data?.user?.email, 'status:', existingAdmin.status);
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=Usuário inativo ou pendente. Entre em contato com o administrador.`);
      }

      // Usar redirectTo se disponível, caso contrário usar next
      const destination = redirectTo || next;

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${destination}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${destination}`);
      } else {
        return NextResponse.redirect(`${origin}${destination}`);
      }
    }
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // // URL to redirect to after sign up process completes
  // return NextResponse.redirect(`${origin}/`);

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
