'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/DataTable/DataTableColumnHeader';
import { Job, JOB_TYPE_LABELS, CONTRACT_TYPE_LABELS } from './schema';
import { Badge } from '@/components/ui/Badge';
import JobsDataTableRowActions from './_components/JobsDataTableRowActions';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getStatusBadge(status: string) {
  const statusConfig = {
    ACTIVE: { label: 'Ativa', variant: 'teal' as const },
    PAUSED: { label: 'Pausada', variant: 'yellow' as const },
    CLOSED: { label: 'Encerrada', variant: 'muted' as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: 'muted' as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Título" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <div className="font-medium truncate">{row.getValue('title')}</div>
        <div className="text-xs text-muted-foreground">
          {JOB_TYPE_LABELS[row.original.jobType]} - {CONTRACT_TYPE_LABELS[row.original.contractType]}
        </div>
      </div>
    ),
    filterFn: (row, columnId, value) => {
      const rowValue = String(row.getValue(columnId) ?? '').toLowerCase();
      const filterValue = String(value).toLowerCase();
      return rowValue.includes(filterValue);
    },
  },
  {
    accessorKey: 'family',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Família" />
    ),
    cell: ({ row }) => {
      const family = row.original.family;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{family.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'budget',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Orcamento" />
    ),
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="text-sm">
          {formatCurrency(Number(job.budgetMin))} - {formatCurrency(Number(job.budgetMax))}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => getStatusBadge(row.getValue('status')),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: '_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Candidaturas" />
    ),
    cell: ({ row }) => {
      const count = row.original._count?.applications || 0;
      return (
        <span className="text-sm font-medium">
          {count}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Criada em" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt');
      return (
        <span className="text-sm text-muted-foreground">
          {formatDate(createdAt as Date)}
        </span>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <JobsDataTableRowActions row={row} />,
  },
];
