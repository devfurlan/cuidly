'use client';

import { useState } from 'react';
import {
  PiBaby,
  PiBriefcase,
  PiCaretDown,
  PiChatCircle,
  PiCreditCard,
  PiGear,
  PiHeart,
  PiHouse,
  PiList,
  PiMagnifyingGlass,
  PiSignOut,
  PiStar,
  PiUser,
  PiX,
} from 'react-icons/pi';

import LogoCuidly from '@/components/LogoCuidly';
import { NotificationBell } from '@/components/notifications';
import { CancellationRetentionBanner } from '@/components/subscription/cancellation-retention-banner';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/shadcn/avatar';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import {
  UnreadMessagesProvider,
  useUnreadMessages,
} from '@/contexts/UnreadMessagesContext';
import { UserProvider } from '@/contexts/UserContext';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@cuidly/shared';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type UserRole = 'NANNY' | 'FAMILY';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    weight?: 'regular' | 'bold' | 'fill';
  }>;
}

const nannyNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/app/dashboard', icon: PiHouse },
  { name: 'Explorar Vagas', href: '/app/vagas', icon: PiMagnifyingGlass },
  { name: 'Mensagens', href: '/app/mensagens', icon: PiChatCircle },
  { name: 'Meu Perfil', href: '/app/perfil', icon: PiUser },
  { name: 'Minhas Avaliações', href: '/app/minhas-avaliacoes', icon: PiStar },
];

const familyNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/app/dashboard', icon: PiHouse },
  { name: 'Minhas Vagas', href: '/app/vagas', icon: PiBriefcase },
  { name: 'Meus Filhos', href: '/app/filhos', icon: PiBaby },
  { name: 'Explorar Babás', href: '/app/babas', icon: PiMagnifyingGlass },
  { name: 'Mensagens', href: '/app/mensagens', icon: PiChatCircle },
  { name: 'Favoritas', href: '/app/favoritos', icon: PiHeart },
  { name: 'Minhas Avaliações', href: '/app/minhas-avaliacoes', icon: PiStar },
];

const colorScheme = {
  NANNY: {
    active: 'bg-fuchsia-100 text-fuchsia-700',
    hover: 'text-gray-600 hover:bg-fuchsia-50 hover:text-fuchsia-600',
    avatarBg: 'bg-fuchsia-100 text-fuchsia-600',
    border: 'border-fuchsia-100/50',
    iconActive: 'text-fuchsia-600',
    iconInactive: 'text-gray-400',
    mobileHover: 'hover:bg-fuchsia-50 hover:text-fuchsia-600',
  },
  FAMILY: {
    active: 'bg-blue-100 text-blue-700',
    hover: 'text-gray-600 hover:bg-blue-50 hover:text-blue-600',
    avatarBg: 'bg-blue-100 text-blue-600',
    border: 'border-blue-100/50',
    iconActive: 'text-blue-600',
    iconInactive: 'text-gray-400',
    mobileHover: 'hover:bg-blue-50 hover:text-blue-600',
  },
};

// Mapeamento de rotas para títulos (rotas que não estão na navegação principal)
const routeTitles: Record<string, string> = {
  '/app/configuracoes': 'Configurações',
  '/app/vagas/criar': 'Criar Vaga',
  '/app/assinatura': 'Assinatura',
  '/app/avaliacoes': 'Avaliações Pendentes',
  '/app/babas': 'Explorar Babás',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  nannyId?: number;
  familyId?: number;
  authId?: string;
}

// Componente interno que usa o context de mensagens não lidas
function NavigationWithBadge({
  navigation,
  pathname,
  colors,
}: {
  navigation: NavigationItem[];
  pathname: string | null;
  colors: typeof colorScheme.NANNY;
}) {
  const { unreadCount } = useUnreadMessages();

  return (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        const isMessagesItem = item.href === '/app/mensagens';

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              isActive ? colors.active : colors.hover,
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isMessagesItem && 'inline-flex items-center gap-1.5',
            )}
          >
            {item.name}
            {isMessagesItem && unreadCount > 0 && (
              <Badge
                variant="destructive-solid"
                className="flex size-4 items-center justify-center p-0 text-2xs font-normal -tracking-widest"
              >
                {unreadCount > 9 ? '+9' : unreadCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </>
  );
}

// Componente interno para menu mobile que usa o context
function MobileNavigationWithBadge({
  navigation,
  pathname,
  colors,
  onItemClick,
}: {
  navigation: NavigationItem[];
  pathname: string | null;
  colors: typeof colorScheme.NANNY;
  onItemClick: () => void;
}) {
  const { unreadCount } = useUnreadMessages();

  return (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        const isMessagesItem = item.href === '/app/mensagens';

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              isActive ? colors.active : colors.hover,
              'block rounded-md px-3 py-2 text-base font-medium',
            )}
          >
            <item.icon
              className={cn(
                'mr-3 inline-block size-5',
                isActive ? colors.iconActive : colors.iconInactive,
              )}
            />
            {item.name}
            {isMessagesItem && unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 min-w-5 px-1.5 text-xs"
              >
                {unreadCount > 9 ? '+9' : unreadCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </>
  );
}

export default function DashboardLayout({
  children,
  role,
  userName = 'Usuário',
  userEmail = '',
  userImage,
  nannyId,
  familyId,
  authId,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navigation = role === 'FAMILY' ? familyNavigation : nannyNavigation;
  const colors = colorScheme[role];

  // Track user activity for online status
  useActivityTracker();

  // Dados do usuário para o contexto
  const userData = {
    role,
    name: userName,
    email: userEmail,
    photoUrl: userImage,
    nannyId,
    familyId,
  };

  // Determina o título da página baseado no pathname
  const getPageTitle = (): string | undefined => {
    // Primeiro, verifica se é uma rota na navegação principal
    const navItem = navigation.find((item) => pathname === item.href);
    if (navItem) return navItem.name;

    // Depois, verifica rotas extras mapeadas
    const exactMatch = routeTitles[pathname ?? ''];
    if (exactMatch) return exactMatch;

    // Por último, verifica rotas dinâmicas (ex: /app/vagas/123)
    if (
      pathname?.startsWith('/app/vagas/') &&
      pathname !== '/app/vagas/criar'
    ) {
      if (pathname?.endsWith('/editar')) {
        return 'Editar Vaga';
      }
      return 'Detalhes da Vaga';
    }
    if (pathname?.startsWith('/app/mensagens/')) {
      return 'Conversa';
    }
    if (pathname?.startsWith('/app/assinatura/')) {
      return 'Assinatura';
    }

    return undefined;
  };

  const pageTitle = getPageTitle();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getFirstAndLastName = (name: string | null | undefined) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  };

  return (
    <UserProvider initialUser={userData}>
      <NotificationsProvider nannyId={nannyId} familyId={familyId}>
        <UnreadMessagesProvider authId={authId ?? null}>
          <div className="min-h-full">
            {/* Header com degradê */}
            <div className="bg-linear-to-r from-fuchsia-50 to-blue-50 pb-32">
              <nav>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-16 items-center justify-between">
                    {/* Logo + Nav desktop */}
                    <div className="flex items-center">
                      <Link href="/app/dashboard" className="shrink-0">
                        <LogoCuidly height={28} />
                      </Link>
                      <div className="hidden md:ml-10 md:flex md:items-baseline md:space-x-1">
                        <NavigationWithBadge
                          navigation={navigation}
                          pathname={pathname}
                          colors={colors}
                        />
                      </div>
                    </div>

                    {/* Right side: bell + avatar (desktop) */}
                    <div className="hidden md:flex md:items-center md:gap-x-4">
                      <NotificationBell />

                      {/* Profile dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="relative flex items-center gap-x-2 p-1.5"
                          >
                            <span className="sr-only">
                              Abrir menu do usuário
                            </span>
                            <Avatar className="size-8">
                              {userImage && (
                                <AvatarImage
                                  src={userImage}
                                  alt={userName ?? ''}
                                />
                              )}
                              <AvatarFallback
                                className={cn(
                                  'text-xs font-semibold',
                                  colors.avatarBg,
                                )}
                              >
                                {getUserInitials(userName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="hidden lg:flex lg:items-center">
                              <span
                                className="ml-2 text-sm leading-6 font-semibold text-gray-900"
                                aria-hidden="true"
                              >
                                {getFirstAndLastName(userName)}
                              </span>
                              <PiCaretDown className="ml-2 size-5 text-gray-400" />
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <div className="px-2 py-1.5">
                            <p className="text-sm font-medium text-gray-900">
                              {getFirstAndLastName(userName)}
                            </p>
                            {userEmail && (
                              <p className="text-sm text-gray-500">
                                {userEmail}
                              </p>
                            )}
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/app/perfil">
                              <PiUser className="mr-2 size-4" />
                              Meu Perfil
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/app/assinatura">
                              <PiCreditCard className="mr-2 size-4" />
                              Assinatura
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/app/configuracoes">
                              <PiGear className="mr-2 size-4" />
                              Configurações
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                          >
                            <PiSignOut className="mr-2 size-4" />
                            Sair
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Mobile: bell + menu button */}
                    <div className="flex items-center gap-x-2 md:hidden">
                      <NotificationBell />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="relative"
                      >
                        <span className="sr-only">Abrir menu principal</span>
                        {mobileMenuOpen ? (
                          <PiX className="size-6" />
                        ) : (
                          <PiList className="size-6" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Mobile menu panel */}
                {mobileMenuOpen && (
                  <div className={cn('border-t md:hidden', colors.border)}>
                    <div className="space-y-1 px-2 py-3 sm:px-3">
                      <MobileNavigationWithBadge
                        navigation={navigation}
                        pathname={pathname}
                        colors={colors}
                        onItemClick={() => setMobileMenuOpen(false)}
                      />
                    </div>
                    <div className={cn('border-t pt-4 pb-3', colors.border)}>
                      <div className="flex items-center px-5">
                        <Avatar className="size-10">
                          {userImage && (
                            <AvatarImage src={userImage} alt={userName ?? ''} />
                          )}
                          <AvatarFallback
                            className={cn(
                              'text-sm font-semibold',
                              colors.avatarBg,
                            )}
                          >
                            {getUserInitials(userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <div className="text-base font-medium text-gray-800">
                            {getFirstAndLastName(userName)}
                          </div>
                          {userEmail && (
                            <div className="text-sm font-medium text-gray-500">
                              {userEmail}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 space-y-1 px-2">
                        <Link
                          href="/app/perfil"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'block rounded-md px-3 py-2 text-base font-medium text-gray-600',
                            colors.mobileHover,
                          )}
                        >
                          Meu Perfil
                        </Link>
                        <Link
                          href="/app/assinatura"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'block rounded-md px-3 py-2 text-base font-medium text-gray-600',
                            colors.mobileHover,
                          )}
                        >
                          Assinatura
                        </Link>
                        <Link
                          href="/app/configuracoes"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'block rounded-md px-3 py-2 text-base font-medium text-gray-600',
                            colors.mobileHover,
                          )}
                        >
                          Configurações
                        </Link>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleLogout();
                          }}
                          className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-600 hover:bg-red-50"
                        >
                          Sair
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </nav>

              {/* Cancellation Retention Banner */}
              <CancellationRetentionBanner />

              {/* Page header */}
              <header className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  {pageTitle && (
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                      {pageTitle}
                    </h1>
                  )}
                </div>
              </header>
            </div>

            {/* Main content com overlap */}
            <main className="relative -mt-32">
              <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </UnreadMessagesProvider>
      </NotificationsProvider>
    </UserProvider>
  );
}
