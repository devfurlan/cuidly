'use client';

import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsThreeIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { FamilyListItemSchema } from '../../../schemas/familySchemas';
import { useState } from 'react';
import { deleteFamily } from '../../../services/familyService';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function FamiliesDataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const family = FamilyListItemSchema.safeParse(row.original);
  const router = useRouter();
  const { toast } = useToast();

  if (!family.success) {
    console.error('Invalid family data:', family.error);
    return null;
  }

  const familyData = family.data;

  async function handleDeleteFamily() {
    try {
      await deleteFamily(familyData.id);
      setIsDeleteConfirmed(false);
      router.refresh();
      toast({
        variant: 'success',
        title: 'Família excluída com sucesso',
        description: 'A família foi excluída com sucesso.',
      });
      setDropdownOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir família',
        description: 'Não foi possível excluir a família. Tente novamente.',
      });
    }
  }

  return (
    <DropdownMenu
      open={isDropdownOpen}
      onOpenChange={(isOpen) => {
        setDropdownOpen(isOpen);
        if (!isOpen) {
          setIsDeleteConfirmed(false);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsThreeIcon className="size-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <Link href={`families/${familyData.id}`}>Visualizar</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`families/${familyData.id}/edit`}>Editar</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(event) => {
            event.preventDefault();
            setIsDeleteConfirmed(true);
          }}
        >
          {!isDeleteConfirmed ? (
            'Deletar'
          ) : (
            <span
              className="w-full text-red-500"
              role="presentation"
              onClick={() => handleDeleteFamily()}
            >
              Tem certeza?
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
