'use client';

import { DataTable } from '@/components/DataTable/DataTable';
import { DataTableColumnHeader } from '@/components/DataTable/DataTableColumnHeader';
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
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SubscriptionListItem } from '@/schemas/subscriptionSchemas';
import { PLAN_LABELS } from '@cuidly/core';
import { DotsThreeIcon, EyeIcon, ProhibitIcon } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

interface SubscriptionsDataTableProps {
  subscriptions: SubscriptionListItem[];
}

const STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  ACTIVE: { label: 'Ativa', variant: 'default' },
  CANCELED: { label: 'Cancelada', variant: 'destructive' },
  PAST_DUE: { label: 'Em Atraso', variant: 'destructive' },
  TRIALING: { label: 'Período de Teste', variant: 'secondary' },
  INCOMPLETE: { label: 'Incompleta', variant: 'outline' },
  EXPIRED: { label: 'Expirada', variant: 'outline' },
};


function getUserDisplayInfo(subscription: SubscriptionListItem) {
  if (subscription.nannyId && subscription.nannyName) {
    return {
      name: subscription.nannyName,
      email: subscription.nannyEmail || '-',
      type: 'Babá',
    };
  }
  if (subscription.familyId && subscription.familyName) {
    return {
      name: subscription.familyName,
      email: subscription.familyEmail || '-',
      type: 'Família',
    };
  }
  return { name: '-', email: '-', type: '-' };
}

export function SubscriptionsDataTable({
  subscriptions: initialSubscriptions,
}: SubscriptionsDataTableProps) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionListItem | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancel = async () => {
    if (!selectedSubscription) return;

    setIsCanceling(true);
    try {
      const response = await fetch(
        `/api/admin/subscriptions/${selectedSubscription.id}/cancel`,
        { method: 'POST' },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao cancelar assinatura');
      }

      const data = await response.json();

      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === selectedSubscription.id
            ? { ...s, status: 'CANCELED' as const }
            : s,
        ),
      );

      toast.success('Assinatura cancelada com sucesso');
      if (data.warning) {
        toast.warning(data.warning);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao cancelar assinatura',
      );
    } finally {
      setIsCanceling(false);
      setCancelDialogOpen(false);
      setSelectedSubscription(null);
    }
  };

  const columns: ColumnDef<SubscriptionListItem>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs">
          {String(row.original.id).slice(0, 8)}
        </span>
      ),
    },
    {
      id: 'user',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usuário" />
      ),
      cell: ({ row }) => {
        const info = getUserDisplayInfo(row.original);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{info.name}</span>
            <span className="text-muted-foreground text-xs">{info.email}</span>
            <Badge variant="outline" className="mt-1 w-fit text-xs">
              {info.type}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'plan',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plano" />
      ),
      cell: ({ row }) => {
        const plan = row.getValue('plan') as string;
        return <Badge variant="outline">{PLAN_LABELS[plan] || plan}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const config = STATUS_LABELS[status] || {
          label: status,
          variant: 'outline' as const,
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      accessorKey: 'currentPeriodStart',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Início" />
      ),
      cell: ({ row }) =>
        format(new Date(row.getValue('currentPeriodStart')), 'dd/MM/yyyy', {
          locale: ptBR,
        }),
    },
    {
      accessorKey: 'currentPeriodEnd',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fim" />
      ),
      cell: ({ row }) => {
        const endDate = row.getValue('currentPeriodEnd') as Date | null;
        return endDate
          ? format(new Date(endDate), 'dd/MM/yyyy', { locale: ptBR })
          : '-';
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Criada em" />
      ),
      cell: ({ row }) =>
        format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy', {
          locale: ptBR,
        }),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const subscription = row.original;

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
                onClick={() => {
                  setSelectedSubscription(subscription);
                  setDetailsDialogOpen(true);
                }}
              >
                <EyeIcon className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setSelectedSubscription(subscription);
                  setCancelDialogOpen(true);
                }}
                disabled={subscription.status === 'CANCELED'}
              >
                <ProhibitIcon className="mr-2 h-4 w-4" />
                Cancelar Assinatura
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={subscriptions} />

      {/* Dialog de Cancelamento */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a assinatura de{' '}
              <strong>
                {selectedSubscription &&
                  getUserDisplayInfo(selectedSubscription).name}
              </strong>
              ? Esta ação cancelará a assinatura e não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCanceling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCanceling ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Detalhes */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Assinatura</DialogTitle>
            <DialogDescription>
              Informações completas da assinatura
            </DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <div className="space-y-6">
              {/* Usuário */}
              <div>
                <h4 className="mb-2 text-sm font-medium">Usuário</h4>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div>
                    <p className="font-medium">
                      {getUserDisplayInfo(selectedSubscription).name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {getUserDisplayInfo(selectedSubscription).email}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {getUserDisplayInfo(selectedSubscription).type}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Detalhes da Assinatura */}
              <div>
                <h4 className="mb-2 text-sm font-medium">Assinatura</h4>
                <div className="grid grid-cols-2 gap-4 rounded-lg border p-3">
                  <div>
                    <p className="text-muted-foreground text-xs">Plano</p>
                    <p className="font-medium">
                      {PLAN_LABELS[selectedSubscription.plan] ||
                        selectedSubscription.plan}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <Badge
                      variant={
                        STATUS_LABELS[selectedSubscription.status]?.variant ||
                        'outline'
                      }
                    >
                      {STATUS_LABELS[selectedSubscription.status]?.label ||
                        selectedSubscription.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Início do Período
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(selectedSubscription.currentPeriodStart),
                        'dd/MM/yyyy',
                        {
                          locale: ptBR,
                        },
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Fim do Período
                    </p>
                    <p className="font-medium">
                      {selectedSubscription.currentPeriodEnd
                        ? format(
                            new Date(selectedSubscription.currentPeriodEnd),
                            'dd/MM/yyyy',
                            {
                              locale: ptBR,
                            },
                          )
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Ciclo de Cobrança
                    </p>
                    <p className="font-medium">
                      {selectedSubscription.billingInterval || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Criada em</p>
                    <p className="font-medium">
                      {format(
                        new Date(selectedSubscription.createdAt),
                        'dd/MM/yyyy',
                        {
                          locale: ptBR,
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
