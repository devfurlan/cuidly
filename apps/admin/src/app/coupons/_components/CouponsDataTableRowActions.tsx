'use client';

import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DotsThreeIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { Coupon } from '../schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/hooks/useToast';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export default function CouponsDataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const coupon = row.original as Coupon;
  const router = useRouter();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  async function handleDelete() {
    try {
      const response = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir cupom');
      }

      toast({
        variant: 'success',
        title: 'Cupom excluído',
        description: `O cupom ${coupon.code} foi excluído com sucesso.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir cupom',
        description:
          error instanceof Error ? error.message : 'Por favor, tente novamente.',
      });
    }
    setConfirmDeleteId(null);
  }

  async function handleToggleActive() {
    setIsToggling(true);
    try {
      const response = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar cupom');
      }

      toast({
        variant: 'success',
        title: coupon.isActive ? 'Cupom desativado' : 'Cupom ativado',
        description: `O cupom ${coupon.code} foi ${coupon.isActive ? 'desativado' : 'ativado'} com sucesso.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar cupom',
        description:
          error instanceof Error ? error.message : 'Por favor, tente novamente.',
      });
    }
    setIsToggling(false);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <DotsThreeIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/coupons/${coupon.id}`}>Ver detalhes</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/coupons/${coupon.id}/edit`}>Editar</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleActive} disabled={isToggling}>
          {coupon.isActive ? 'Desativar' : 'Ativar'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            if (confirmDeleteId === coupon.id) {
              handleDelete();
            } else {
              setConfirmDeleteId(coupon.id);
            }
          }}
          className={confirmDeleteId === coupon.id ? 'text-red-500' : ''}
        >
          {confirmDeleteId === coupon.id ? 'Tem certeza?' : 'Excluir'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
