'use client';

import LogoCuidly from '@/components/LogoCuidly';
import { Button } from '@/components/ui/shadcn/button';
import { useTopBanner } from '@/contexts/TopBannerContext';
import { cn } from '@cuidly/shared';
import Link from 'next/link';
import { useState } from 'react';
import { PiList, PiX } from 'react-icons/pi';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isBannerVisible } = useTopBanner();

  return (
    <header
      className={cn(
        'fixed right-0 left-0 z-40 border-b border-blue-100 bg-white/95 px-6 backdrop-blur-sm',
        isBannerVisible ? 'top-12' : 'top-0',
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <LogoCuidly />
            </Link>
          </div>

          <nav className="hidden items-center space-x-8 md:flex">
            <Link
              href="/para-familias"
              className="text-gray-700 transition-colors hover:text-fuchsia-600"
            >
              Para Famílias
            </Link>
            <Link
              href="/para-babas"
              className="text-gray-700 transition-colors hover:text-fuchsia-600"
            >
              Para Babás
            </Link>
            <Link
              href="/como-funciona"
              className="text-gray-700 transition-colors hover:text-fuchsia-600"
            >
              Como Funciona
            </Link>
            <Link
              href="/quem-somos"
              className="text-gray-700 transition-colors hover:text-fuchsia-600"
            >
              Quem Somos
            </Link>
          </nav>

          <div className="hidden items-center space-x-4 md:flex">
            <Button size={'lg'} variant={'outline'} asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button size={'lg'} asChild>
              <Link href="/cadastro">Cadastrar</Link>
            </Button>
          </div>

          <button
            className="p-2 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <PiX className="h-6 w-6" />
            ) : (
              <PiList className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="space-y-3 px-4 py-4">
            <Link
              href="/para-familias"
              className="block text-gray-700 transition-colors hover:text-fuchsia-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Para Famílias
            </Link>
            <Link
              href="/para-babas"
              className="block text-gray-700 transition-colors hover:text-fuchsia-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Para Babás
            </Link>
            <Link
              href="/como-funciona"
              className="block text-gray-700 transition-colors hover:text-fuchsia-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Como Funciona
            </Link>
            <Link
              href="/quem-somos"
              className="block text-gray-700 transition-colors hover:text-fuchsia-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Quem Somos
            </Link>
            <div className="space-y-2 pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/cadastro">Cadastrar</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
