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
import { Job } from '../schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/hooks/useToast';
import DeactivateJobDialog from './DeactivateJobDialog';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export default function JobsDataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const job = row.original as Job;
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  async function handleToggleStatus(newStatus: 'ACTIVE' | 'PAUSED') {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar vaga');
      }

      toast({
        variant: 'success',
        title: newStatus === 'ACTIVE' ? 'Vaga ativada' : 'Vaga pausada',
        description: `A vaga "${job.title}" foi ${newStatus === 'ACTIVE' ? 'ativada' : 'pausada'} com sucesso.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar vaga',
        description:
          error instanceof Error ? error.message : 'Por favor, tente novamente.',
      });
    }
    setIsUpdating(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <DotsThreeIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/jobs/${job.id}`}>Ver detalhes</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/jobs/${job.id}/edit`}>Editar</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {job.status === 'ACTIVE' && (
            <DropdownMenuItem
              onClick={() => handleToggleStatus('PAUSED')}
              disabled={isUpdating}
            >
              Pausar vaga
            </DropdownMenuItem>
          )}
          {job.status === 'PAUSED' && (
            <DropdownMenuItem
              onClick={() => handleToggleStatus('ACTIVE')}
              disabled={isUpdating}
            >
              Reativar vaga
            </DropdownMenuItem>
          )}
          {job.status !== 'CLOSED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeactivateDialog(true)}
                className="text-red-500"
              >
                Desativar vaga
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeactivateJobDialog
        job={job}
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      />
    </>
  );
}
