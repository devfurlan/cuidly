'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { columns } from '../columns';
import { FilterFnOption, Row } from '@tanstack/react-table';
import { DataTableToolbar } from './ChildrenDataTableToolbar';
import removeAccents from '@/utils/removeAccents';

interface ChildListItem {
  id: number;
  name: string;
  birthDate: string | null;
  gender: string | null;
  allergies: string | null;
  specialNeeds: string | null;
  status: string;
  createdAt: string;
  families: Array<{
    id: number;
    name: string;
    relationshipType: string | null;
    isMain: boolean;
  }>;
}

export function ChildrenDataTable({ data }: { data: ChildListItem[] }) {
  const globalFilterFn = useMemo<FilterFnOption<ChildListItem>>(() => {
    return (row: Row<ChildListItem>, _columnId: string, filterValue: unknown) => {
      const id = String(row.original.id ?? '').toLowerCase();
      const name = removeAccents(String(row.original.name ?? '')).toLowerCase();
      const search = removeAccents(String(filterValue)).toLowerCase();
      return id.includes(search) || name.includes(search);
    };
  }, []);

  return (
    <DataTable<ChildListItem, unknown>
      data={data}
      columns={columns}
      DataTableToolbar={DataTableToolbar}
      globalFilterFn={globalFilterFn}
    />
  );
}
