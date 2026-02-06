'use client';

import BadgeStatus from '@/components/BadgeStatus';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import removeAccents from '@/utils/removeAccents';
import { SidebarIcon } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { DataTableColumnHeader } from '../../components/DataTable/DataTableColumnHeader';
import { ChildrenDataTableRowActions } from './_components/ChildrenDataTableRowActions';

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

function calculateAge(birthDate: string | null): string {
  if (!birthDate) return '-';
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();

  if (years < 1) {
    const totalMonths = years * 12 + months;
    return `${totalMonths} ${totalMonths === 1 ? 'mes' : 'meses'}`;
  }

  return `${years} ${years === 1 ? 'ano' : 'anos'}`;
}

export const columns: ColumnDef<ChildListItem>[] = [
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
      <div className="group flex min-w-[200px] items-center justify-between gap-2 text-nowrap font-medium">
        <span className="text-nowrap">{row.getValue('name')}</span>
        <Button
          variant="ghost"
          size="sm"
          className="invisible border border-gray-200 group-hover:visible data-[state=open]:bg-accent"
          asChild
        >
          <Link href={`/children/${row.original.id}`} scroll={false}>
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
    accessorKey: 'birthDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Idade" />
    ),
    cell: ({ row }) => {
      const birthDate = row.getValue('birthDate') as string | null;
      return (
        <div className="w-[80px]">
          {calculateAge(birthDate)}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Genero" />
    ),
    cell: ({ row }) => {
      const gender = row.getValue('gender') as string | null;
      const genderLabels: Record<string, string> = {
        MALE: 'Masculino',
        FEMALE: 'Feminino',
        OTHER: 'Outro',
      };
      return (
        <div className="w-[100px]">
          {gender ? genderLabels[gender] || gender : '-'}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'families',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Familias" />
    ),
    cell: ({ row }) => {
      const families = row.original.families;
      return (
        <div className="flex w-[150px] items-center">
          {families.length > 0 ? (
            <Tooltip content={families.map((f) => f.name).join(', ')}>
              <span>{families.length} familia(s)</span>
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
    accessorKey: 'allergies',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alergias" />
    ),
    cell: ({ row }) => {
      const allergies = row.getValue('allergies') as string | null;
      return (
        <div className="w-[120px] truncate">
          {allergies ? (
            <Tooltip content={allergies}>
              <span className="text-orange-600">{allergies}</span>
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
    accessorKey: 'specialNeeds',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Necessidades" />
    ),
    cell: ({ row }) => {
      const specialNeeds = row.getValue('specialNeeds') as string | null;
      return (
        <div className="w-[120px] truncate">
          {specialNeeds ? (
            <Tooltip content={specialNeeds}>
              <span className="text-blue-600">{specialNeeds}</span>
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
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex w-[32px] items-center">
        <ChildrenDataTableRowActions row={row} />
      </div>
    ),
  },
];
