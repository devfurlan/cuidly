'use client';

import { Button } from '@/components/ui/button';
import { MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react';
import Link from 'next/link';

export default function NanniesActionsPage() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <Link href="nannies/find">
          <MagnifyingGlassIcon /> Buscar por CEP
        </Link>
      </Button>

      <Button asChild>
        <Link href="nannies/create">
          <PlusIcon /> Adicionar
        </Link>
      </Button>
    </div>
  );
}
