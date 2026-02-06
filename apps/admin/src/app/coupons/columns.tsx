'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/DataTable/DataTableColumnHeader';
import { Coupon, getCouponStatus } from './schema';
import { Badge } from '@/components/ui/Badge';
import CouponsDataTableRowActions from './_components/CouponsDataTableRowActions';
import {
  DISCOUNT_TYPE_LABELS,
  APPLICABLE_TO_LABELS,
} from '@/schemas/couponSchemas';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getStatusBadge(coupon: Coupon) {
  const status = getCouponStatus(coupon);

  const statusConfig = {
    active: { label: 'Ativo', variant: 'teal' as const },
    inactive: { label: 'Inativo', variant: 'muted' as const },
    expired: { label: 'Expirado', variant: 'red' as const },
    scheduled: { label: 'Agendado', variant: 'blue' as const },
  };

  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export const columns: ColumnDef<Coupon>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
    cell: ({ row }) => (
      <div className="font-mono font-semibold">{row.getValue('code')}</div>
    ),
    filterFn: (row, columnId, value) => {
      const rowValue = String(row.getValue(columnId) ?? '').toLowerCase();
      const filterValue = String(value).toLowerCase();
      return rowValue.includes(filterValue);
    },
  },
  {
    accessorKey: 'discountType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Desconto" />
    ),
    cell: ({ row }) => {
      const coupon = row.original;
      const type = coupon.discountType;
      const value = coupon.discountValue;

      const displayValue =
        type === 'PERCENTAGE' ? `${value}%` : formatCurrency(value);

      return (
        <div className="flex flex-col">
          <span className="font-medium">{displayValue}</span>
          <span className="text-xs text-muted-foreground">
            {DISCOUNT_TYPE_LABELS[type]}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'applicableTo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aplicável a" />
    ),
    cell: ({ row }) => {
      const applicableTo = row.getValue('applicableTo') as string;
      return (
        <span className="text-sm">
          {APPLICABLE_TO_LABELS[applicableTo] || applicableTo}
        </span>
      );
    },
  },
  {
    accessorKey: 'usageCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usos" />
    ),
    cell: ({ row }) => {
      const coupon = row.original;
      const used = coupon.usageCount;
      const limit = coupon.usageLimit;

      return (
        <span className="text-sm">
          {used}
          {limit ? ` / ${limit}` : ''}
        </span>
      );
    },
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Período" />
    ),
    cell: ({ row }) => {
      const coupon = row.original;
      return (
        <div className="flex flex-col text-sm">
          <span>{formatDate(coupon.startDate)}</span>
          <span className="text-muted-foreground">
            ate {formatDate(coupon.endDate)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => getStatusBadge(row.original),
    filterFn: (row, _id, value) => {
      const status = getCouponStatus(row.original);
      return value.includes(status);
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Criado em" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt');
      return (
        <span className="text-sm text-muted-foreground">
          {formatDate(createdAt as Date)}
        </span>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <CouponsDataTableRowActions row={row} />,
  },
];
