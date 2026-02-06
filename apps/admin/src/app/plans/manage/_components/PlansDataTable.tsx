'use client';

import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { DataTableColumnHeader } from '@/components/DataTable/DataTableColumnHeader';
import { PLAN_TYPE_LABELS, BILLING_CYCLE_LABELS } from '@/schemas/planSchemas';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface Plan {
  id: number;
  name: string;
  type: 'FAMILY' | 'NANNY';
  price: number;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  features: Record<string, unknown>;
  isActive: boolean;
  subscriptionsCount: number;
  createdAt: Date;
}

interface PlansDataTableProps {
  plans: Plan[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function PlansDataTable({ plans: initialPlans }: PlansDataTableProps) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleStatus = async (plan: Plan) => {
    try {
      const response = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao alterar status');
      }

      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p))
      );

      toast.success(
        plan.isActive ? 'Plano desativado com sucesso' : 'Plano ativado com sucesso'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao alterar status');
    }
  };

  const handleDelete = async () => {
    if (!planToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/plans/${planToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao desativar plano');
      }

      setPlans((prev) =>
        prev.map((p) =>
          p.id === planToDelete.id ? { ...p, isActive: false } : p
        )
      );

      toast.success('Plano desativado com sucesso');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao desativar plano');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  const columns: ColumnDef<Plan>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return (
          <Badge variant={type === 'FAMILY' ? 'default' : 'secondary'}>
            {PLAN_TYPE_LABELS[type] || type}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Preco" />
      ),
      cell: ({ row }) => formatCurrency(row.getValue('price')),
    },
    {
      accessorKey: 'billingCycle',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ciclo" />
      ),
      cell: ({ row }) => {
        const cycle = row.getValue('billingCycle') as string;
        return BILLING_CYCLE_LABELS[cycle] || cycle;
      },
    },
    {
      accessorKey: 'subscriptionsCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assinaturas" />
      ),
      cell: ({ row }) => row.getValue('subscriptionsCount'),
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge variant={isActive ? 'default' : 'outline'}>
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const plan = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <DotsThreeIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/plans/manage/${plan.id}/edit`)}
              >
                <PencilSimpleIcon className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(plan)}>
                {plan.isActive ? (
                  <>
                    <XCircleIcon className="mr-2 h-4 w-4" />
                    Desativar
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    Ativar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setPlanToDelete(plan);
                  setDeleteDialogOpen(true);
                }}
                disabled={plan.subscriptionsCount > 0}
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={plans} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Plano</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o plano &quot;{planToDelete?.name}&quot;?
              Esta ação não pode ser desfeita facilmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Desativando...' : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
