'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { nannySubscriptionColumns } from './nannySubscriptionColumns';
import { NannySubscriptionListItem } from '@/schemas/subscriptionSchemas';
import { FilterFnOption, Row } from '@tanstack/react-table';
import { NannySubscriptionsToolbar } from './NannySubscriptionsToolbar';
import removeAccents from '@/utils/removeAccents';

export function NannySubscriptionsDataTable({
  subscriptions,
}: {
  subscriptions: NannySubscriptionListItem[];
}) {
  const globalFilterFn = useMemo<FilterFnOption<NannySubscriptionListItem>>(() => {
    return (
      row: Row<NannySubscriptionListItem>,
      _columnId: string,
      filterValue: unknown
    ) => {
      const id = String(row.original.id ?? '').toLowerCase();
      const nannyId = String(row.original.nannyId ?? '').toLowerCase();
      const name = removeAccents(String(row.original.nannyName ?? '')).toLowerCase();
      const planName = removeAccents(String(row.original.plan ?? '')).toLowerCase();
      const search = removeAccents(String(filterValue)).toLowerCase();
      return (
        id.includes(search) ||
        nannyId.includes(search) ||
        name.includes(search) ||
        planName.includes(search)
      );
    };
  }, []);

  return (
    <DataTable<NannySubscriptionListItem, unknown>
      data={subscriptions}
      columns={nannySubscriptionColumns}
      DataTableToolbar={NannySubscriptionsToolbar}
      globalFilterFn={globalFilterFn}
    />
  );
}
