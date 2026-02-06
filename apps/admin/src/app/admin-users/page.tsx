import { DataTable } from '@/components/DataTable/DataTable';
import PageContent from '@/components/layout/PageContent';
import { columns } from './columns';
import { AdminUser } from './schema';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { requirePermission } from '@/lib/auth/checkPermission';
import { getAdminUsers } from '@/services/adminUserService';

async function fetchAdminUsers(): Promise<AdminUser[]> {
  const users = await getAdminUsers();
  return users.map((user) => ({
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: user.updatedAt ? new Date(user.updatedAt) : null,
    lastVisitAt: user.lastVisitAt ? new Date(user.lastVisitAt) : null,
  }));
}

export const metadata = {
  title: 'Usuários Administradores',
  description: 'Gerencie os usuários administradores do sistema.',
};

export default async function AdminUsersPage() {
  // Verificar permissão
  await requirePermission('ADMIN_USERS');

  const adminUsersData = await fetchAdminUsers();

  return (
    <PageContent
      title="Usuários Administradores"
      actions={
        <Button asChild>
          <Link href="/admin-users/create">Adicionar</Link>
        </Button>
      }
    >
      <DataTable data={adminUsersData} columns={columns} />
    </PageContent>
  );
}
