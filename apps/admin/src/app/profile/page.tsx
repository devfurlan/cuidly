import PageContent from '@/components/layout/PageContent';
import { ProfileForm } from './_components/ProfileForm';
import { ChangePasswordForm } from './_components/ChangePasswordForm';
import { getUser } from '@/lib/supabase/auth/getUser';
import { getCurrentUserWithPermissions } from '@/lib/auth/checkPermission';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Meu Perfil',
  description: 'Gerencie suas informações pessoais e senha',
};

export default async function ProfilePage() {
  const authUser = await getUser();
  const dbUser = await getCurrentUserWithPermissions();

  if (!dbUser) {
    redirect('/login');
  }

  return (
    <PageContent title="Meu Perfil">
      <div className="space-y-6">
        <ProfileForm
          defaultValues={{
            name: dbUser.name || authUser.user_metadata.full_name || '',
            email: dbUser.email,
            photoUrl: dbUser.photoUrl || undefined,
          }}
        />
        <ChangePasswordForm />
      </div>
    </PageContent>
  );
}
