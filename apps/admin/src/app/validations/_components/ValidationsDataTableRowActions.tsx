'use client';

import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsThreeIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { ValidationRequest } from '../schema';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export default function ValidationsDataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const validation = row.original as ValidationRequest;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <DotsThreeIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/validations/${validation.id}`}>Revisar</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/nannies/${validation.nanny.slug}`}>Ver perfil da baba</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
