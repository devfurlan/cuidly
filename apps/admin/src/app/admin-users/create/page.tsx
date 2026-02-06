import PageContent from '@/components/layout/PageContent';
import { AdminUserForm } from '../_components/AdminUserForm';
import { requirePermission } from '@/lib/auth/checkPermission';

export const metadata = {
  title: 'Criar Usuário Administrador',
  description: 'Crie um novo usuário administrador.',
};

export default async function CreateAdminUserPage() {
  await requirePermission('ADMIN_USERS');
  return (
    <PageContent title="Criar Usuário Administrador">
      <AdminUserForm mode="create" />
    </PageContent>
  );
}
