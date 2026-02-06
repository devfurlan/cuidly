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
import { NannySchema } from '../../../schemas/nannySchemas';
import { useState } from 'react';
import { deleteNanny } from '../../../services/nannyService';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function NanniesDataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const nanny = NannySchema.safeParse(row.original);
  const router = useRouter();
  const { toast } = useToast();

  if (!nanny.success) {
    console.error('Invalid nanny data:', nanny.error);
    return null;
  }

  const nannyData = nanny.data;
  const nannySlug = nannyData.slug || nannyData.id;

  async function handleDeleteNanny() {
    try {
      await deleteNanny(nannyData.id);
      setIsDeleteConfirmed(false);
      router.refresh();
      toast({
        variant: 'success',
        title: 'Babá excluída com sucesso',
        description: 'A babá foi excluída com sucesso e não encontra-se mais em nossa base.',
      });
      setDropdownOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir babá',
        description: 'Não foi possível excluir a babá. Tente novamente.',
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
          <Link href={`nannies/${nannySlug}`}>Visualizar</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`nannies/${nannySlug}/edit`}>Editar</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`nannies/${nannySlug}/edit?tab=documents`}>
            Documentos
          </Link>
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
              onClick={() => handleDeleteNanny()}
            >
              Tem certeza?
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
