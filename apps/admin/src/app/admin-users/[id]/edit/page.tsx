import PageContent from '@/components/layout/PageContent';
import { AdminUserForm } from '../../_components/AdminUserForm';
import { requirePermission } from '@/lib/auth/checkPermission';
import { getAdminUserById } from '@/services/adminUserService';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Editar Usuário Administrador',
  description: 'Edite um usuário administrador.',
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAdminUserPage({ params }: PageProps) {
  await requirePermission('ADMIN_USERS');

  const { id } = await params;
  const adminUser = await getAdminUserById(id);

  if (!adminUser) {
    notFound();
  }

  return (
    <PageContent title="Editar Usuário Administrador">
      <AdminUserForm
        mode="edit"
        adminUserId={adminUser.id}
        isSuperAdmin={adminUser.isSuperAdmin}
        defaultValues={{
          name: adminUser.name || '',
          email: adminUser.email,
          photoUrl: adminUser.photoUrl || '',
          permissions: adminUser.permissions,
          isSuperAdmin: adminUser.isSuperAdmin,
          status: adminUser.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
        }}
      />
    </PageContent>
  );
}
