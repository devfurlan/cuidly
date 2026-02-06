'use client';

import { DataTableFacetedFilter } from '@/components/DataTable/DataTableFacetedFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XIcon } from '@phosphor-icons/react';
import { Table } from '@tanstack/react-table';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar por nome ou ID"
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => {
            table.setGlobalFilter(event.target.value);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('city') && (
          <DataTableFacetedFilter
            column={table.getColumn('city')}
            title="Cidade/UF"
            options={Array.from(
              table.getColumn('city')?.getFacetedUniqueValues() || [],
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
              { label: 'Ativo', value: 'active' },
              { label: 'Inativo', value: 'inactive' },
              { label: 'Pendente', value: 'pending' },
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
