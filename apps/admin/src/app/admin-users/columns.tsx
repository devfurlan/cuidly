'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/DataTable/DataTableColumnHeader';
import abbreviateName from '@/utils/abbreviateName';
import removeAccents from '@/utils/removeAccents';
import { AdminUser } from './schema';
import BadgeStatus from '@/components/BadgeStatus';
import { Badge } from '@/components/ui/Badge';
import { PERMISSION_LABELS } from '@/lib/permissions';
import AdminUsersDataTableRowActions from './_components/AdminUsersDataTableRowActions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import getInitials from '@/utils/getInitials';
import { ShieldCheckIcon } from '@phosphor-icons/react';
import { publicPhotoUrl } from '@/constants/publicFilesUrl';

export const columns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Administrador" />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string | null;
      const email = row.original.email;
      const displayName = name || email;

      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-9 rounded-lg">
            <AvatarImage
              src={`${publicPhotoUrl(row.original.photoUrl as string, 36, 36)}`}
              alt={`Foto: ${row.getValue('name')}`}
            />
            <AvatarFallback className="rounded-lg">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{abbreviateName(displayName)}</span>
            {row.original.isSuperAdmin && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <ShieldCheckIcon className="size-3" weight="fill" />
                <span>Superadmin</span>
              </div>
            )}
          </div>
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
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="E-mail" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[200px]">{row.getValue('email')}</div>
    ),
    filterFn: (row, columnId, value) => {
      const rowValue = removeAccents(String(row.getValue(columnId) ?? ''));
      const filterValue = removeAccents(String(value));
      return rowValue.includes(filterValue);
    },
  },
  {
    accessorKey: 'permissions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Permissões" />
    ),
    cell: ({ row }) => {
      const permissions = row.getValue('permissions') as string[];

      if (row.original.isSuperAdmin) {
        return (
          <div className="flex min-w-[200px] flex-wrap gap-1">
            <Badge variant="yellow">Todas as permissões</Badge>
          </div>
        );
      }

      return (
        <div className="flex min-w-[200px] flex-wrap gap-1">
          {permissions.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              Nenhuma permissão
            </span>
          ) : (
            permissions.slice(0, 2).map((permission) => (
              <Badge key={permission} variant="blue" className="text-xs">
                {
                  PERMISSION_LABELS[
                    permission as keyof typeof PERMISSION_LABELS
                  ]
                }
              </Badge>
            ))
          )}
          {permissions.length > 2 && (
            <Badge variant="muted" className="text-xs">
              +{permissions.length - 2}
            </Badge>
          )}
        </div>
      );
    },
    filterFn: (row, columnId, value) => {
      const permissions = row.getValue(columnId) as string[];
      return permissions.some((p) =>
        p.toLowerCase().includes(value.toLowerCase()),
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status: string = row.getValue('status') || 'ACTIVE';

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
    accessorKey: 'lastVisitAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Última visita em" />
    ),
    cell: ({ row }) => {
      const lastVisitAt = row.getValue('lastVisitAt');
      const formattedDate =
        lastVisitAt instanceof Date
          ? lastVisitAt.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-';

      return <div className="min-w-[140px] text-nowrap">{formattedDate}</div>;
    },
    filterFn: (row, columnId, value) => {
      const rowValue = removeAccents(String(row.getValue(columnId) ?? ''));
      const filterValue = removeAccents(String(value));
      return rowValue.includes(filterValue);
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Criado em" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt');
      const formattedDate =
        createdAt instanceof Date
          ? createdAt.toLocaleDateString('pt-BR')
          : String(createdAt || '');

      return <div className="min-w-[120px] text-nowrap">{formattedDate}</div>;
    },
    filterFn: (row, columnId, value) => {
      const rowValue = removeAccents(String(row.getValue(columnId) ?? ''));
      const filterValue = removeAccents(String(value));
      return rowValue.includes(filterValue);
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <AdminUsersDataTableRowActions row={row} />,
  },
];
