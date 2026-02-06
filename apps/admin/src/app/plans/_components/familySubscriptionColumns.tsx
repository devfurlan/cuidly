'use client';

import BadgeStatus from '@/components/BadgeStatus';
import { Button } from '@/components/ui/button';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber';
import getOnlyNumbers from '@/utils/getOnlyNumbers';
import { SidebarIcon } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { DataTableColumnHeader } from '@/components/DataTable/DataTableColumnHeader';
import { FamilySubscriptionListItem } from '@/schemas/subscriptionSchemas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const billingIntervalLabels: Record<string, string> = {
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  YEARLY: 'Anual',
};

const subscriptionStatusColors: Record<string, string> = {
  ACTIVE: 'active',
  CANCELLED: 'inactive',
  CANCELED: 'inactive',
  EXPIRED: 'suspended',
  PENDING: 'pending',
  PAST_DUE: 'suspended',
};

const planLabels: Record<string, string> = {
  // Current plans
  FAMILY_FREE: 'Cuidly Free',
  FAMILY_PLUS: 'Cuidly Plus',
  NANNY_FREE: 'Básico',
  NANNY_PRO: 'Pro',
  // Legacy plans
  FREE: 'Grátis',
  BASIC: 'Básico',
  PREMIUM: 'Premium',
  PROFESSIONAL: 'Profissional',
};

export const familySubscriptionColumns: ColumnDef<FamilySubscriptionListItem>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[50px] text-nowrap text-gray-400">
        {String(row.getValue('id')).slice(0, 8)}
      </div>
    ),
  },
  {
    accessorKey: 'familyName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Família" />
    ),
    cell: ({ row }) => (
      <div className="group flex min-w-[200px] items-center justify-between gap-2 text-nowrap font-medium">
        <span className="text-nowrap">{row.getValue('familyName')}</span>
        <Button
          variant="ghost"
          size="sm"
          className="invisible border border-gray-200 group-hover:visible data-[state=open]:bg-accent"
          asChild
        >
          <Link href={`/families/${row.original.familyId}`} scroll={false}>
            <SidebarIcon className="size-2.5" />
            Abrir
          </Link>
        </Button>
      </div>
    ),
  },
  {
    accessorKey: 'familyPhone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="WhatsApp" />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('familyPhone') as string | null;
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
    accessorKey: 'plan',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plano" />
    ),
    cell: ({ row }) => (
      <div className="flex w-[100px] items-center font-medium text-indigo-600">
        {planLabels[row.getValue('plan') as string] || row.getValue('plan')}
      </div>
    ),
  },
  {
    accessorKey: 'billingInterval',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ciclo" />
    ),
    cell: ({ row }) => (
      <div className="flex w-[80px] items-center text-gray-600">
        {billingIntervalLabels[row.getValue('billingInterval') as string] || row.getValue('billingInterval') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'currentPeriodStart',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Início" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('currentPeriodStart') as Date;
      return (
        <div className="flex w-[100px] items-center text-gray-600">
          {format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      );
    },
  },
  {
    accessorKey: 'currentPeriodEnd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fim" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('currentPeriodEnd') as Date | null;
      return (
        <div className="flex w-[100px] items-center text-gray-600">
          {date ? format(new Date(date), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
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
      const status = row.getValue('status') as string;
      return (
        <div className="flex w-[100px] items-center">
          <BadgeStatus
            status={subscriptionStatusColors[status] || 'pending'}
            size="sm"
          />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes((row.getValue(id) as string)?.toLowerCase());
    },
  },
];
