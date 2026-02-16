'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LogoCuidly from '@/components/LogoCuidly';
import { Button } from '@/components/ui/shadcn/button';
import { createClient } from '@/utils/supabase/client';

/**
 * Client component for the profile header with authentication-aware navigation
 */
export function ProfileHeader() {
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();
  }, [supabase]);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 px-6 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <LogoCuidly />
            </Link>
          </div>

          <nav className="hidden items-center space-x-8 md:flex">
            <Link
              href="/#como-funciona"
              className="text-gray-700 transition-colors hover:text-fuchsia-600"
            >
              Como Funciona
            </Link>
            <Link
              href="/app/assinatura"
              className="text-gray-700 transition-colors hover:text-fuchsia-600"
            >
              Planos
            </Link>
          </nav>

          <div className="hidden items-center space-x-4 md:flex">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link href="/app/dashboard">Minha Conta</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button size="lg" asChild>
                  <Link href="/cadastro">Cadastrar</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="p-2 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <span className="text-2xl">&times;</span>
            ) : (
              <span className="text-2xl">&#9776;</span>
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="space-y-3 px-4 py-4">
            <Link
              href="/#como-funciona"
              className="block text-gray-700 transition-colors hover:text-fuchsia-600"
            >
              Como Funciona
            </Link>
            <Link
              href="/app/assinatura"
              className="block text-gray-700 transition-colors hover:text-fuchsia-600"
            >
              Planos
            </Link>
            <div className="space-y-2 pt-4">
              {isAuthenticated ? (
                <Button className="w-full" asChild>
                  <Link href="/app/dashboard">Minha Conta</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">Entrar</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/cadastro">Cadastrar</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
