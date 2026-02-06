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
  EyeIcon,
  ArrowSquareOutIcon,
} from '@phosphor-icons/react';
import { DataTableColumnHeader } from '@/components/DataTable/DataTableColumnHeader';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SUBSCRIPTION_PLAN_LABELS } from '@/schemas/couponSchemas';

interface Subscription {
  id: string;
  plan: string;
  status: string;
}

interface Payment {
  id: string;
  nannyId: number | null;
  familyId: number | null;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  status: string;
  type: string;
  description: string | null;
  paymentGateway: string;
  externalPaymentId: string | null;
  externalInvoiceUrl: string | null;
  paymentMethod: string | null;
  paidAt: Date | null;
  createdAt: Date;
  nanny: {
    id: number;
    name: string | null;
    emailAddress: string | null;
    photoUrl: string | null;
  } | null;
  family: {
    id: number;
    name: string | null;
    emailAddress: string | null;
    photoUrl: string | null;
  } | null;
  subscription: Subscription | null;
}

interface PaymentsDataTableProps {
  payments: Payment[];
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendente', variant: 'outline' },
  PROCESSING: { label: 'Processando', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmado', variant: 'default' },
  PAID: { label: 'Pago', variant: 'default' },
  FAILED: { label: 'Falhou', variant: 'destructive' },
  CANCELED: { label: 'Cancelado', variant: 'outline' },
  REFUNDED: { label: 'Reembolsado', variant: 'secondary' },
  PARTIALLY_REFUNDED: { label: 'Reembolso Parcial', variant: 'secondary' },
  OVERDUE: { label: 'Vencido', variant: 'destructive' },
  CHARGEBACK: { label: 'Chargeback', variant: 'destructive' },
  AWAITING_RISK_ANALYSIS: { label: 'Analise de Risco', variant: 'outline' },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: 'Cartao de Credito',
  DEBIT_CARD: 'Cartao de Debito',
  PIX: 'PIX',
  BOLETO: 'Boleto',
  BANK_TRANSFER: 'Transferencia',
  PAYPAL: 'PayPal',
  WALLET: 'Carteira',
  MANUAL: 'Manual',
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  SUBSCRIPTION: 'Assinatura',
  ONE_TIME: 'Pagamento Único',
  REFUND: 'Reembolso',
  ADJUSTMENT: 'Ajuste',
};

function formatCurrency(value: number, currency: string = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

export function PaymentsDataTable({ payments }: PaymentsDataTableProps) {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const getGatewayUrl = (payment: Payment): string | null => {
    if (!payment.externalPaymentId) return null;

    if (payment.externalInvoiceUrl) {
      return payment.externalInvoiceUrl;
    }

    if (payment.paymentGateway === 'ASAAS') {
      return `https://www.asaas.com/i/${payment.externalPaymentId}`;
    }

    return null;
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'user',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usuario" />
      ),
      cell: ({ row }) => {
        const nanny = row.original.nanny;
        const family = row.original.family;
        const name = nanny?.name || family?.name || '-';
        const email = nanny?.emailAddress || family?.emailAddress || '-';
        const photoUrl = nanny?.photoUrl || family?.photoUrl;
        const userType = nanny ? 'Baba' : 'Familia';

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={photoUrl || undefined} alt={name} />
              <AvatarFallback>
                {(name || email).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{name}</span>
              <span className="text-xs text-muted-foreground">{userType}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Valor" />
      ),
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <span className="font-medium">
            {formatCurrency(payment.amount, payment.currency)}
          </span>
        );
      },
    },
    {
      accessorKey: 'subscription',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plano" />
      ),
      cell: ({ row }) => {
        const subscription = row.original.subscription;
        if (!subscription) return <span className="text-muted-foreground">-</span>;
        return (
          <Badge variant="outline">
            {SUBSCRIPTION_PLAN_LABELS[subscription.plan] || subscription.plan}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const config = STATUS_CONFIG[status] || { label: status, variant: 'outline' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data" />
      ),
      cell: ({ row }) =>
        format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    },
    {
      accessorKey: 'externalPaymentId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID Gateway" />
      ),
      cell: ({ row }) => {
        const id = row.getValue('externalPaymentId') as string | null;
        if (!id) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="font-mono text-xs">{id.slice(0, 12)}...</span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const payment = row.original;
        const gatewayUrl = getGatewayUrl(payment);

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
                  setSelectedPayment(payment);
                  setDetailsDialogOpen(true);
                }}
              >
                <EyeIcon className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
              {gatewayUrl && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href={gatewayUrl} target="_blank" rel="noopener noreferrer">
                      <ArrowSquareOutIcon className="mr-2 h-4 w-4" />
                      Ver no Gateway
                    </a>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={payments} />

      {/* Dialog de Detalhes */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
            <DialogDescription>
              Informações completas do pagamento
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              {/* Usuario */}
              <div>
                <h4 className="text-sm font-medium mb-2">Usuario</h4>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedPayment.nanny?.photoUrl || selectedPayment.family?.photoUrl || undefined}
                      alt={selectedPayment.nanny?.name || selectedPayment.family?.name || '-'}
                    />
                    <AvatarFallback>
                      {(selectedPayment.nanny?.name || selectedPayment.family?.name || selectedPayment.nanny?.emailAddress || selectedPayment.family?.emailAddress || '-')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedPayment.nanny?.name || selectedPayment.family?.name || '-'}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPayment.nanny?.emailAddress || selectedPayment.family?.emailAddress || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalhes do Pagamento */}
              <div>
                <h4 className="text-sm font-medium mb-2">Pagamento</h4>
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg border">
                  <div>
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="font-medium text-lg">
                      {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge
                      variant={STATUS_CONFIG[selectedPayment.status]?.variant || 'outline'}
                      className="mt-1"
                    >
                      {STATUS_CONFIG[selectedPayment.status]?.label || selectedPayment.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="font-medium">
                      {PAYMENT_TYPE_LABELS[selectedPayment.type] || selectedPayment.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Metodo</p>
                    <p className="font-medium">
                      {selectedPayment.paymentMethod
                        ? PAYMENT_METHOD_LABELS[selectedPayment.paymentMethod] ||
                          selectedPayment.paymentMethod
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Criado em</p>
                    <p className="font-medium">
                      {format(new Date(selectedPayment.createdAt), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pago em</p>
                    <p className="font-medium">
                      {selectedPayment.paidAt
                        ? format(new Date(selectedPayment.paidAt), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })
                        : '-'}
                    </p>
                  </div>
                  {selectedPayment.description && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Descrição</p>
                      <p className="font-medium">{selectedPayment.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gateway */}
              <div>
                <h4 className="text-sm font-medium mb-2">Gateway de Pagamento</h4>
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg border">
                  <div>
                    <p className="text-xs text-muted-foreground">Gateway</p>
                    <p className="font-medium">{selectedPayment.paymentGateway}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID no Gateway</p>
                    <p className="font-mono text-sm">
                      {selectedPayment.externalPaymentId || '-'}
                    </p>
                  </div>
                </div>
                {getGatewayUrl(selectedPayment) && (
                  <Button asChild variant="outline" className="mt-2 w-full">
                    <a
                      href={getGatewayUrl(selectedPayment)!}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ArrowSquareOutIcon className="mr-2 h-4 w-4" />
                      Abrir no {selectedPayment.paymentGateway}
                    </a>
                  </Button>
                )}
              </div>

              {/* Assinatura */}
              {selectedPayment.subscription && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Assinatura Vinculada</h4>
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline">
                          {SUBSCRIPTION_PLAN_LABELS[selectedPayment.subscription.plan] ||
                            selectedPayment.subscription.plan}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {selectedPayment.subscription.id.slice(0, 16)}...
                        </p>
                      </div>
                      <Badge
                        variant={
                          selectedPayment.subscription.status === 'ACTIVE'
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {selectedPayment.subscription.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
