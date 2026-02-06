'use client';

import { CalendarDatePicker } from '@/components/CalendarDatePicker';
import { DataTableFacetedFilter } from '@/components/DataTable/DataTableFacetedFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getOldestAndNewestDates } from '@/utils/getOldestAndNewestDates';
import { XIcon } from '@phosphor-icons/react';
import { Table } from '@tanstack/react-table';
import { useState } from 'react';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const { from, to } = getOldestAndNewestDates(table, 'createdAt');
    return { from, to };
  });

  const handleDateSelect = ({ from, to }: { from: Date; to: Date }) => {
    setDateRange({ from, to });
    table.getColumn('createdAt')?.setFilterValue([from, to]);
  };

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
            options={Array.from(
              table.getColumn('status')?.getFacetedUniqueValues() || [],
            ).map(([value]) => ({
              label: value.charAt(0).toUpperCase() + value.slice(1),
              value: value,
            }))}
          />
        )}
        {table.getColumn('createdAt') && (
          <CalendarDatePicker
            date={dateRange}
            onDateSelect={handleDateSelect}
            className="h-8 px-2 text-xs lg:px-3"
            variant="outline"
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
