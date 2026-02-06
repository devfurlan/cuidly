'use client';

import { DataTableFacetedFilter } from '@/components/DataTable/DataTableFacetedFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XIcon } from '@phosphor-icons/react';
import { Table } from '@tanstack/react-table';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function FamilySubscriptionsToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter;

  return (
    <div className="flex flex-wrap items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar por nome, ID ou plano"
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => {
            table.setGlobalFilter(event.target.value);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('plan') && (
          <DataTableFacetedFilter
            column={table.getColumn('plan')}
            title="Plano"
            options={Array.from(
              table.getColumn('plan')?.getFacetedUniqueValues() || [],
            ).map(([value]) => ({
              label: value,
              value: value,
            }))}
          />
        )}
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={[
              { label: 'Ativo', value: 'ACTIVE' },
              { label: 'Cancelado', value: 'CANCELLED' },
              { label: 'Expirado', value: 'EXPIRED' },
              { label: 'Pendente', value: 'PENDING' },
            ]}
          />
        )}
        {table.getColumn('billingInterval') && (
          <DataTableFacetedFilter
            column={table.getColumn('billingInterval')}
            title="Ciclo"
            options={[
              { label: 'Mensal', value: 'MONTHLY' },
              { label: 'Trimestral', value: 'QUARTERLY' },
              { label: 'Anual', value: 'YEARLY' },
              { label: 'Único', value: 'ONE_TIME' },
            ]}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter('');
            }}
            className="h-8 gap-1.5 px-2 lg:px-3"
          >
            <XIcon /> Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
