'use client';

import BadgeStatus from '@/components/BadgeStatus';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber';
import getOnlyNumbers from '@/utils/getOnlyNumbers';
import removeAccents from '@/utils/removeAccents';
import { SidebarIcon } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { DataTableColumnHeader } from '../../components/DataTable/DataTableColumnHeader';
import { FamilyListItem } from '../../schemas/familySchemas';
import { FamiliesDataTableRowActions } from './_components/FamiliesDataTableRowActions';

export const columns: ColumnDef<FamilyListItem>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[50px] text-nowrap text-gray-400">
        {row.getValue('id')}
      </div>
    ),
    filterFn: (row, columnId, value) => {
      const rowValue = removeAccents(String(row.getValue(columnId) ?? ''));
      const filterValue = removeAccents(String(value));
      return rowValue.includes(filterValue);
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    cell: ({ row }) => (
      <div className="group flex min-w-[250px] items-center justify-between gap-2 text-nowrap font-medium">
        <span className="text-nowrap">{row.getValue('name')}</span>
        <Button
          variant="ghost"
          size="sm"
          className="invisible border border-gray-200 group-hover:visible data-[state=open]:bg-accent"
          asChild
        >
          <Link href={`/families/${row.original.id}`} scroll={false}>
            <SidebarIcon className="size-2.5" />
            Abrir
          </Link>
        </Button>
      </div>
    ),
    filterFn: (row, columnId, value) => {
      const rowValue = removeAccents(String(row.getValue(columnId) ?? ''));
      const filterValue = removeAccents(String(value));
      return rowValue.includes(filterValue);
    },
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="WhatsApp" />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('phoneNumber') as string | null;
      if (!phone) return <div className="w-[110px]">-</div>;
      const formatted = formatPhoneNumber(phone);
      return (
        <div className="w-[110px]">
          <a
            href={`https://wa.me/55${getOnlyNumbers(formatted)}`}
            target="_blank"
            className="hover:underline"
          >
            {formatted}
          </a>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'emailAddress',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="E-mail" />
    ),
    cell: ({ row }) => {
      const email = row.getValue('emailAddress') as string | null;
      return (
        <div className="w-[200px] truncate">
          {email ? (
            <a href={`mailto:${email}`} className="hover:underline">
              {email}
            </a>
          ) : (
            '-'
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cidade/UF" />
    ),
    cell: ({ row }) => {
      const address = row.original.address;
      return (
        <div className="flex w-[150px] items-center text-nowrap">
          {address?.city && address?.state
            ? `${address.city}/${address.state.toUpperCase()}`
            : '-'}
        </div>
      );
    },
    accessorFn: (row) =>
      row.address?.city && row.address?.state
        ? `${row.address.city}/${row.address.state}`
        : '',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'children',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Criancas" />
    ),
    cell: ({ row }) => {
      const children = row.original.children;
      return (
        <div className="flex w-[150px] items-center">
          {children.length > 0 ? (
            <Tooltip
              content={children.map((c) => c.name).join(', ')}
            >
              <span>{children.length} crianca(s)</span>
            </Tooltip>
          ) : (
            '-'
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'subscription',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plano" />
    ),
    cell: ({ row }) => {
      const subscription = row.original.subscription;
      return (
        <div className="flex w-[100px] items-center">
          {subscription?.plan?.name || 'Explorar'}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status: string = (row.getValue('status') as string)?.toLowerCase() || 'pending';

      return (
        <div className="flex w-[100px] items-center">
          <BadgeStatus status={status} size={'sm'} />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes((row.getValue(id) as string)?.toLowerCase());
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex w-[32px] items-center">
        <FamiliesDataTableRowActions row={row} />
      </div>
    ),
  },
];
