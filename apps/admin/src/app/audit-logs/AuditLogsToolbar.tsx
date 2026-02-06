'use client';

import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableFacetedFilter } from '@/components/DataTable/DataTableFacetedFilter';
import { DataTableViewOptions } from '@/components/DataTable/DataTableViewOptions';
import { AuditLog, ACTION_LABELS, TABLE_LABELS } from './schema';

interface AuditLogsToolbarProps {
  table: Table<AuditLog>;
}

const actionOptions = Object.entries(ACTION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const tableOptions = Object.entries(TABLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function AuditLogsToolbar({ table }: AuditLogsToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filtrar por ID do registro..."
          value={(table.getColumn('recordId')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('recordId')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[200px] lg:w-[250px]"
        />
        {table.getColumn('action') && (
          <DataTableFacetedFilter
            column={table.getColumn('action')}
            title="Acao"
            options={actionOptions}
          />
        )}
        {table.getColumn('table') && (
          <DataTableFacetedFilter
            column={table.getColumn('table')}
            title="Entidade"
            options={tableOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Limpar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
