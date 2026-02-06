'use client';

import { PiGear, PiHouse, PiList, PiSignOut, PiUser, PiX } from 'react-icons/pi';

import LogoCuidly from '@/components/LogoCuidly';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/shadcn/avatar';
import { Button } from '@/components/ui/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  photoUrl: string | null;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          // Buscar dados adicionais do usuário
          const response = await fetch('/api/user/me');
          if (response.ok) {
            const userData = await response.json();
            setUser({
              id: authUser.id,
              name: userData.name || authUser.user_metadata?.name || null,
              email: authUser.email || '',
              photoUrl: userData.photoUrl || authUser.user_metadata?.avatar_url || null,
            });
          } else {
            setUser({
              id: authUser.id,
              name: authUser.user_metadata?.name || null,
              email: authUser.email || '',
              photoUrl: authUser.user_metadata?.avatar_url || null,
            });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const getUserInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <LogoCuidly />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/babas" className="text-gray-700 hover:text-pink transition">
              Para Babás
            </Link>
            <Link href="/como-funciona" className="text-gray-700 hover:text-pink transition">
              Como Funciona
            </Link>
            <Link href="/seguranca" className="text-gray-700 hover:text-pink transition">
              Segurança
            </Link>
            <Link href="/quem-somos" className="text-gray-700 hover:text-pink transition">
              Quem Somos
            </Link>
          </div>

          {/* CTA Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-pink focus:ring-offset-2">
                    <Avatar className="size-10 border-2 border-pink/20">
                      <AvatarImage src={user.photoUrl || undefined} alt={user.name || 'Usuário'} />
                      <AvatarFallback className="bg-pink/10 text-pink font-medium">
                        {getUserInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name || 'Usuário'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/app/dashboard" className="cursor-pointer">
                      <PiHouse className="mr-2 size-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/perfil" className="cursor-pointer">
                      <PiUser className="mr-2 size-4" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/assinatura" className="cursor-pointer">
                      <PiGear className="mr-2 size-4" />
                      Minha Assinatura
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <PiSignOut className="mr-2 size-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Entrar</Button>
                </Link>
                <Link href="/cadastro">
                  <Button>Cadastrar Grátis</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <PiX size={24} /> : <PiList size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link
              href="/babas"
              className="block text-gray-700 hover:text-pink transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Para Babás
            </Link>
            <Link
              href="/como-funciona"
              className="block text-gray-700 hover:text-pink transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Como Funciona
            </Link>
            <Link
              href="/seguranca"
              className="block text-gray-700 hover:text-pink transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Segurança
            </Link>
            <Link
              href="/quem-somos"
              className="block text-gray-700 hover:text-pink transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Quem Somos
            </Link>
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <Avatar className="size-10 border-2 border-pink/20">
                      <AvatarImage src={user.photoUrl || undefined} alt={user.name || 'Usuário'} />
                      <AvatarFallback className="bg-pink/10 text-pink font-medium">
                        {getUserInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name || 'Usuário'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/app/dashboard" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <PiHouse className="mr-2 size-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/app/perfil" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <PiUser className="mr-2 size-4" />
                      Meu Perfil
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <PiSignOut className="mr-2 size-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Entrar</Button>
                  </Link>
                  <Link href="/cadastro" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Cadastrar Grátis</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
