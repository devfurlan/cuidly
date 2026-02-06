'use client';

import { ColumnDef } from '@tanstack/react-table';
import { AuditLog, ACTION_LABELS, TABLE_LABELS, ACTION_SEVERITY } from './schema';
import { DataTableColumnHeader } from '@/components/DataTable/DataTableColumnHeader';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

const getSeverityVariant = (
  severity: 'low' | 'medium' | 'high'
): 'default' | 'secondary' | 'destructive' => {
  switch (severity) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    default:
      return 'default';
  }
};

export const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return (
        <div className="whitespace-nowrap">
          <div className="font-medium">
            {format(date, 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(date, 'HH:mm:ss', { locale: ptBR })}
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Administrador" />
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) {
        return <span className="text-muted-foreground">Sistema</span>;
      }
      return (
        <div>
          <div className="font-medium">{user.name || 'Sem nome'}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'action',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acao" />
    ),
    cell: ({ row }) => {
      const action = row.getValue('action') as string;
      const severity = ACTION_SEVERITY[action] || 'low';
      const label = ACTION_LABELS[action] || action;

      return (
        <Badge variant={getSeverityVariant(severity)}>{label}</Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'table',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Entidade" />
    ),
    cell: ({ row }) => {
      const table = row.getValue('table') as string;
      const label = TABLE_LABELS[table] || table;
      return <span>{label}</span>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'recordId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID do Registro" />
    ),
    cell: ({ row }) => {
      const recordId = row.getValue('recordId') as string;
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {recordId.length > 20 ? `${recordId.slice(0, 20)}...` : recordId}
        </code>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Dispatch custom event to open modal
            const event = new CustomEvent('openAuditLogDetails', {
              detail: row.original,
            });
            window.dispatchEvent(event);
          }}
        >
          <Eye className="h-4 w-4" />
          <span className="ml-1">Detalhes</span>
        </Button>
      );
    },
  },
];
