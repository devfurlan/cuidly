'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { columns } from '../columns';
import { Nanny } from '@/schemas/nannySchemas';
import { FilterFnOption, Row } from '@tanstack/react-table';
import { DataTableToolbar } from './NanniesDataTableToolbar';
import removeAccents from '@/utils/removeAccents';

export function NanniesDataTable({ nannies }: { nannies: Nanny[] }) {
  const globalFilterFn = useMemo<FilterFnOption<Nanny>>(() => {
    return (row: Row<Nanny>, _columnId: string, filterValue: unknown) => {
      const id = String(row.original.id ?? '').toLowerCase();
      const name = removeAccents(String(row.original.name ?? '')).toLowerCase();
      const search = removeAccents(String(filterValue)).toLowerCase();
      return id.includes(search) || name.includes(search);
    };
  }, []);

  return (
    <DataTable
      data={nannies}
      columns={columns}
      DataTableToolbar={DataTableToolbar}
      defaultSorting={[{ id: 'createdAt', desc: true }]}
      globalFilterFn={globalFilterFn}
    />
  );
}
