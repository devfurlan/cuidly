'use client';

import { DataTable } from '@/components/DataTable/DataTable';
import { columns } from './columns';
import { AuditLogsToolbar } from './AuditLogsToolbar';
import { AuditLogDetailsModal } from './AuditLogDetailsModal';
import { AuditLog } from './schema';

interface AuditLogsClientProps {
  data: AuditLog[];
}

export function AuditLogsClient({ data }: AuditLogsClientProps) {
  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        DataTableToolbar={AuditLogsToolbar}
        defaultSorting={[{ id: 'createdAt', desc: true }]}
      />
      <AuditLogDetailsModal />
    </>
  );
}
