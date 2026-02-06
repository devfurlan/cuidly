'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/DataTable/DataTableColumnHeader';
import { ValidationRequest } from './schema';
import { Badge } from '@/components/ui/Badge';
import ValidationsDataTableRowActions from './_components/ValidationsDataTableRowActions';
import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getStatusBadge(status: string) {
  const statusConfig = {
    PENDING: { label: 'Pendente', variant: 'yellow' as const },
    PROCESSING: { label: 'Processando', variant: 'blue' as const },
    COMPLETED: { label: 'Concluida', variant: 'teal' as const },
    FAILED: { label: 'Falhou', variant: 'red' as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: 'muted' as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function getLevelBadge(level: string) {
  const levelConfig = {
    BASIC: { label: 'Basica', variant: 'muted' as const },
    PREMIUM: { label: 'Premium', variant: 'blue' as const },
  };

  const config = levelConfig[level as keyof typeof levelConfig] || {
    label: level,
    variant: 'muted' as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export const columns: ColumnDef<ValidationRequest>[] = [
  {
    accessorKey: 'nanny',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Babá" />
    ),
    cell: ({ row }) => {
      const nanny = row.original.nanny;
      return (
        <div className="flex items-center gap-3">
          {nanny.photoUrl && (
            <img
              src={nanny.photoUrl}
              alt={nanny.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <div>
            <div className="font-medium">{nanny.name}</div>
            {nanny.emailAddress && (
              <div className="text-xs text-muted-foreground">
                {nanny.emailAddress}
              </div>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, _columnId, value) => {
      const nanny = row.original.nanny;
      const searchValue = String(value).toLowerCase();
      return (
        nanny.name.toLowerCase().includes(searchValue) ||
        (nanny.emailAddress?.toLowerCase() || '').includes(searchValue)
      );
    },
  },
  {
    accessorKey: 'level',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nivel" />
    ),
    cell: ({ row }) => getLevelBadge(row.getValue('level')),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
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
    accessorKey: 'validations',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Validacoes" />
    ),
    cell: ({ row }) => {
      const nanny = row.original.nanny;
      return (
        <div className="flex gap-2">
          <div className="flex items-center gap-1" title="Documento Validado">
            {nanny.documentValidated ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" weight="fill" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-500" weight="fill" />
            )}
            <span className="text-xs">Doc</span>
          </div>
          <div className="flex items-center gap-1" title="Antecedentes">
            {nanny.criminalBackgroundValidated ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" weight="fill" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-500" weight="fill" />
            )}
            <span className="text-xs">Crim</span>
          </div>
          <div className="flex items-center gap-1" title="Dados Pessoais">
            {nanny.personalDataValidated ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" weight="fill" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-500" weight="fill" />
            )}
            <span className="text-xs">Dados</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'facematchScore',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Facematch" />
    ),
    cell: ({ row }) => {
      const score = row.getValue('facematchScore') as number | null;
      if (score === null) return <span className="text-muted-foreground">-</span>;

      const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
      return <span className={`font-medium ${color}`}>{score.toFixed(0)}%</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data" />
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
    cell: ({ row }) => <ValidationsDataTableRowActions row={row} />,
  },
];
