'use client';

import BadgeStatus from '@/components/BadgeStatus';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { publicPhotoUrl } from '@/constants/publicFilesUrl';
import abbreviateName from '@/utils/abbreviateName';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber';
import getInitials from '@/utils/getInitials';
import getOnlyNumbers from '@/utils/getOnlyNumbers';
import removeAccents from '@/utils/removeAccents';
import { getExperienceYearsLabel } from '@/utils/getExperienceYearsLabel';
import { SidebarIcon } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { DataTableColumnHeader } from '../../components/DataTable/DataTableColumnHeader';
import { Nanny } from '../../schemas/nannySchemas';
import { NanniesDataTableRowActions } from './_components/NanniesDataTableRowActions';

export const columns: ColumnDef<Nanny>[] = [
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
    cell: ({ row }) => {
      const name = row.getValue('name') as string | null;
      return (
        <div className="group flex min-w-[350px] items-center justify-between gap-2 text-nowrap font-medium">
          <div className="flex items-center gap-2">
            <Avatar className="size-9 rounded-lg">
              <AvatarImage
                src={`${publicPhotoUrl(row.original.photoUrl as string, 36, 36)}`}
                alt={`Foto: ${name ?? 'Sem nome'}`}
              />
              <AvatarFallback className="rounded-lg bg-fuchsia-200 text-fuchsia-600">
                {getInitials(name ?? '')}
              </AvatarFallback>
            </Avatar>
            <span className="text-nowrap">
              {abbreviateName(name ?? 'Sem nome')}{' '}
            </span>
          </div>
        <Button
          variant="ghost"
          size="sm"
          className="invisible border border-gray-200 group-hover:visible data-[state=open]:bg-accent"
          asChild
        >
          <Link href={`/nannies/${row.original.slug}`} scroll={false}>
            <SidebarIcon className="size-2.5" />
            Abrir
          </Link>
        </Button>
      </div>
      );
    },
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
      if (!phone) return <div className="w-[110px] text-gray-400">-</div>;
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
    accessorKey: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cidade/UF" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[200px] items-center text-nowrap">
          {row.original.city && row.original.state
            ? `${row.original.city}/${row.original.state.toUpperCase()}`
            : '-'}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'experienceYears',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Experiência" />
    ),
    cell: ({ row }) => {
      const years = row.getValue('experienceYears') as number | null;
      return (
        <div className="flex w-[100px] items-center justify-center">
          {getExperienceYearsLabel(years)}
        </div>
      );
    },
  },
  {
    accessorKey: 'hourlyRate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor/hora" />
    ),
    cell: ({ row }) => {
      const rate = row.getValue('hourlyRate') as number | null;
      return (
        <div className="flex w-[80px] items-center justify-center">
          {rate
            ? rate.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'viewsCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Views" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[60px] items-center justify-center">
          {row.getValue('viewsCount')}
        </div>
      );
    },
  },
  {
    accessorKey: 'hireClicksCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliques" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[60px] items-center justify-center">
          {row.getValue('hireClicksCount')}
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
      const status: string = row.getValue('status') || 'pending';

      return (
        <div className="flex w-[100px] items-center">
          <BadgeStatus status={status} size={'sm'} />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    id: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cadastrada em" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      const formattedDate = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return (
        <div className="flex w-[100px] items-center">
          <Tooltip
            content={date.toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          >
            <span className="capitalize">{formattedDate}</span>
          </Tooltip>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowDate = new Date(row.getValue(id));
      const [startDate, endDate] = value;
      return rowDate >= startDate && rowDate <= endDate;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex w-[32px] items-center">
        <NanniesDataTableRowActions row={row} />
      </div>
    ),
  },
];
