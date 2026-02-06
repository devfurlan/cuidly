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
import { AdminUser } from '../schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/hooks/useToast';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export default function AdminUsersDataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const adminUser = row.original as AdminUser;
  const router = useRouter();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    try {
      const response = await fetch(`/api/admin-users/${adminUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir usuário');
      }

      toast({
        variant: 'success',
        title: 'Usuário excluído',
        description: 'O administrador foi excluído com sucesso.',
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir usuário',
        description:
          error instanceof Error ? error.message : 'Por favor, tente novamente.',
      });
    }
    setConfirmDeleteId(null);
  }

  // Superadmin não pode ser deletado
  const canDelete = !adminUser.isSuperAdmin;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <DotsThreeIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`admin-users/${adminUser.id}/edit`}>Editar</Link>
        </DropdownMenuItem>
        {canDelete && (
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              if (confirmDeleteId === adminUser.id) {
                handleDelete();
              } else {
                setConfirmDeleteId(adminUser.id);
              }
            }}
            className={confirmDeleteId === adminUser.id ? 'text-red-500' : ''}
          >
            {confirmDeleteId === adminUser.id ? 'Tem certeza?' : 'Excluir'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
