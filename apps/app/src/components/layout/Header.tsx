'use client';

import { PiArrowRight, PiList, PiX } from 'react-icons/pi';

import { Button } from '@/components/ui/shadcn/button';
import { pagesMenu } from '@/utils/pagesMenu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import LogoCuidly from '../LogoCuidly';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const linkClass: React.HTMLAttributes<HTMLElement>['className'] =
    'text-gray-600 hover:text-fuchsia-500 transition-colors duration-300';
  const activeLinkClass = 'text-fuchsia-500 font-medium';

  const isActive = (
    path: string,
    matchMode: 'exact' | 'startsWith' = 'exact',
  ) => {
    if (matchMode === 'startsWith') {
      return location.startsWith(path) ? activeLinkClass : linkClass;
    }
    return location === path ? activeLinkClass : linkClass;
  };

  return (
    <header className="sticky top-0 right-0 left-0 z-50 bg-white shadow-md/2 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <LogoCuidly />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-8 md:flex">
            {pagesMenu.map((page, index) => (
              <Link
                key={index}
                href={page.href}
                onClick={page.onClick && page.onClick}
                className={
                  page.href === '/blog'
                    ? isActive(page.href, 'startsWith')
                    : isActive(page.href)
                }
              >
                {page.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center space-x-4 md:flex">
            <Button asChild>
              <Link href="/#orcamento">
                Quero um Orçamento
                <PiArrowRight className="ms-1 size-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <PiX /> : <PiList />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-gray-200 md:hidden">
          <div className="container mx-auto space-y-1 px-4 py-3">
            {pagesMenu.map((page, index) => (
              <Link
                key={index}
                href={page.href}
                className="block rounded-md px-4 py-2 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                {page.name}
              </Link>
            ))}

            <div className="pt-2 pb-1">
              <Button className="w-full" asChild>
                <Link href="/#orcamento">
                  Quero um Orçamento
                  <PiArrowRight className="ms-1 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
