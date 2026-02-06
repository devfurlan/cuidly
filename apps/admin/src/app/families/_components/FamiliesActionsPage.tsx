'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon } from '@phosphor-icons/react';
import Link from 'next/link';

export default function FamiliesActionsPage() {
  return (
    <div className="flex gap-2">
      <Button asChild>
        <Link href="families/create">
          <PlusIcon /> Adicionar
        </Link>
      </Button>
    </div>
  );
}
