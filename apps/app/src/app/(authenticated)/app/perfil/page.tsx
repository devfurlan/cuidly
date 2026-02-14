/**
 * Profile Page - Server Component
 * Carrega dados do perfil no servidor e passa para o componente cliente
 */

import { ProfileClient } from '@/components/profile/profile-client';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getNannyProfile, getFamilyProfile } from '@/lib/data/profile';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.type === 'nanny') {
    const profile = await getNannyProfile(user.nanny.id);
    const hasActiveSubscription =
      (user.nanny.subscription?.status === 'ACTIVE' || user.nanny.subscription?.status === 'TRIALING') &&
      user.nanny.subscription?.plan === 'NANNY_PRO';

    return (
      <ProfileClient
        userRole="NANNY"
        nannyProfile={profile}
        hasActiveSubscription={hasActiveSubscription}
      />
    );
  }

  // Family
  const profile = await getFamilyProfile(user.family.id);
  const hasActiveSubscription =
    (user.family.subscription?.status === 'ACTIVE' || user.family.subscription?.status === 'TRIALING') &&
    user.family.subscription?.plan === 'FAMILY_PLUS';

  return (
    <ProfileClient
      userRole="FAMILY"
      familyProfile={profile}
      hasActiveSubscription={hasActiveSubscription}
    />
  );
}
