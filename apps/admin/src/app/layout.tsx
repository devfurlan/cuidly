import { Calistoga, Inter } from 'next/font/google';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PageProviders from '@/components/PageProviders';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/layout/Header';
import { cookies } from 'next/headers';
import { getCurrentUserWithPermissions } from '@/lib/auth/checkPermission';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import './globals.css';

export const dynamic = 'force-dynamic';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const calistoga = Calistoga({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-calistoga',
});

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Cuidly Ops - Painel Administrativo',
  icons: {
    icon: [
      {
        url: '/assets/img/favicons/favicon-16.png',
        sizes: '16x16',
      },
      {
        url: '/assets/img/favicons/favicon-32.png',
        sizes: '32x32',
      },
      {
        url: '/assets/img/favicons/favicon-96.png',
        sizes: '96x96',
      },
      {
        url: '/assets/img/favicons/favicon-180.png',
        sizes: '180x180',
      },
      {
        url: '/assets/img/favicons/favicon-512.png',
        sizes: '512x512',
      },
    ],
  },
  robots: 'noindex, nofollow',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  let userWithPermissions = null;
  let defaultOpen = false;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;

    // Buscar permissões do usuário
    userWithPermissions = user ? await getCurrentUserWithPermissions() : null;

    // Se usuário está autenticado mas não tem permissões (status inativo ou não existe no BD)
    // redirecionar para login
    if (user && !userWithPermissions) {
      await supabase.auth.signOut();
      const { redirect } = await import('next/navigation');
      redirect('/login?error=Usuário não encontrado ou inativo. Entre em contato com o administrador.');
    }

    const cookieStore = await cookies();
    defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';
  } catch (error) {
    // Silently fail during pre-render
    console.error('Layout error:', error);
  }

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${calistoga.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-gray-50 text-gray-700">
        <PageProviders>
          {!user ? (
            <>{children}</>
          ) : (
            <PermissionsProvider
              permissions={userWithPermissions?.permissions || []}
              isSuperAdmin={userWithPermissions?.isSuperAdmin || false}
              role={userWithPermissions?.role || 'CUSTOMER'}
            >
              <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <SidebarInset>
                  <Header />
                  <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                  </div>
                </SidebarInset>
              </SidebarProvider>
            </PermissionsProvider>
          )}
        </PageProviders>
      </body>
    </html>
  );
}
