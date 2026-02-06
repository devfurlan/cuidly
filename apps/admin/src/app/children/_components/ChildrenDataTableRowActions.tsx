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
import { useState } from 'react';
import { deleteChild } from '../../../services/childService';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

interface ChildListItem {
  id: number;
  name: string;
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function ChildrenDataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const child = row.original as ChildListItem;
  const router = useRouter();
  const { toast } = useToast();

  async function handleDeleteChild() {
    try {
      await deleteChild(child.id);
      setIsDeleteConfirmed(false);
      router.refresh();
      toast({
        variant: 'success',
        title: 'Criança excluída com sucesso',
        description: 'A criança foi excluída com sucesso.',
      });
      setDropdownOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir criança',
        description: 'Não foi possível excluir a criança. Tente novamente.',
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
          <Link href={`children/${child.id}`}>Visualizar</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`children/${child.id}/edit`}>Editar</Link>
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
              onClick={() => handleDeleteChild()}
            >
              Tem certeza?
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
