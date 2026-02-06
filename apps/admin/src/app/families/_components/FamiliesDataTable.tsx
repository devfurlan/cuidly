'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { columns } from '../columns';
import { FamilyListItem } from '@/schemas/familySchemas';
import { FilterFnOption, Row } from '@tanstack/react-table';
import { DataTableToolbar } from './FamiliesDataTableToolbar';
import removeAccents from '@/utils/removeAccents';

export function FamiliesDataTable({ families }: { families: FamilyListItem[] }) {
  const globalFilterFn = useMemo<FilterFnOption<FamilyListItem>>(() => {
    return (row: Row<FamilyListItem>, _columnId: string, filterValue: unknown) => {
      const id = String(row.original.id ?? '').toLowerCase();
      const name = removeAccents(String(row.original.name ?? '')).toLowerCase();
      const search = removeAccents(String(filterValue)).toLowerCase();
      return id.includes(search) || name.includes(search);
    };
  }, []);

  return (
    <DataTable
      data={families}
      columns={columns}
      DataTableToolbar={DataTableToolbar}
      globalFilterFn={globalFilterFn}
    />
  );
}
