'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { familySubscriptionColumns } from './familySubscriptionColumns';
import { FamilySubscriptionListItem } from '@/schemas/subscriptionSchemas';
import { FilterFnOption, Row } from '@tanstack/react-table';
import { FamilySubscriptionsToolbar } from './FamilySubscriptionsToolbar';
import removeAccents from '@/utils/removeAccents';

export function FamilySubscriptionsDataTable({
  subscriptions,
}: {
  subscriptions: FamilySubscriptionListItem[];
}) {
  const globalFilterFn = useMemo<FilterFnOption<FamilySubscriptionListItem>>(() => {
    return (
      row: Row<FamilySubscriptionListItem>,
      _columnId: string,
      filterValue: unknown
    ) => {
      const id = String(row.original.id ?? '').toLowerCase();
      const familyId = String(row.original.familyId ?? '').toLowerCase();
      const name = removeAccents(String(row.original.familyName ?? '')).toLowerCase();
      const planName = removeAccents(String(row.original.plan ?? '')).toLowerCase();
      const search = removeAccents(String(filterValue)).toLowerCase();
      return (
        id.includes(search) ||
        familyId.includes(search) ||
        name.includes(search) ||
        planName.includes(search)
      );
    };
  }, []);

  return (
    <DataTable<FamilySubscriptionListItem, unknown>
      data={subscriptions}
      columns={familySubscriptionColumns}
      DataTableToolbar={FamilySubscriptionsToolbar}
      globalFilterFn={globalFilterFn}
    />
  );
}
