import { Suspense } from 'react';
import PageContent from '@/components/layout/PageContent';
import { requireSuperAdmin } from '@/lib/auth/checkPermission';
import { auditService } from '@/services/auditService';
import { AuditLogsClient } from './AuditLogsClient';
import { AuditLog } from './schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

async function fetchAuditLogs(): Promise<AuditLog[]> {
  const { logs } = await auditService.getAuditLogs({
    page: 1,
    limit: 100, // Fetch more for client-side filtering
  });

  return logs.map((log) => ({
    ...log,
    createdAt: new Date(log.createdAt),
  }));
}

function AuditLogsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="rounded-md border">
        <div className="p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-3">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function AuditLogsTable() {
  const data = await fetchAuditLogs();
  return <AuditLogsClient data={data} />;
}

export const metadata = {
  title: 'Logs de Auditoria',
  description: 'Visualize o histórico de ações realizadas no sistema.',
};

export default async function AuditLogsPage() {
  // Apenas super admins podem acessar
  await requireSuperAdmin();

  return (
    <PageContent title="Logs de Auditoria">
      <Alert variant="warning" className="mb-4">
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Esta página registra todas as ações críticas realizadas no painel
          administrativo. Os logs são usados para fins de segurança, auditoria e
          rastreabilidade. Acesse com responsabilidade.
        </AlertDescription>
      </Alert>
      <Suspense fallback={<AuditLogsTableSkeleton />}>
        <AuditLogsTable />
      </Suspense>
    </PageContent>
  );
}
