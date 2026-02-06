/**
 * Children Page - Server Component
 * Carrega dados das crianças no servidor
 */

import { PageTitle } from '@/components/PageTitle';
import { ChildrenManagement } from '@/components/children/children-management';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getFamilyChildren } from '@/lib/data/children';
import { redirect } from 'next/navigation';

export default async function FilhosPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Only families can access this page
  if (user.type !== 'family') {
    redirect('/app/dashboard');
  }

  const children = await getFamilyChildren(user.family.id);

  return (
    <>
      <PageTitle title="Meus Filhos - Cuidly" />
      <ChildrenManagement initialChildren={children} />
    </>
  );
}
