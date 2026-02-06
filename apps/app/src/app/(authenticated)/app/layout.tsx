/**
 * Unified App Layout - Server Component
 * Carrega dados do usuário no servidor e passa para o DashboardLayout
 */

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ProfileSetupWidget } from '@/components/profile-setup-widget';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  // Check if nanny needs onboarding
  if (user.type === 'nanny' && !user.nanny.onboardingCompleted) {
    redirect('/app/onboarding/nanny');
  }

  // Prepare user data for the layout
  const userData = {
    role: user.type === 'nanny' ? ('NANNY' as const) : ('FAMILY' as const),
    name: user.type === 'nanny' ? user.nanny.name : user.family.name,
    email:
      user.type === 'nanny'
        ? user.nanny.emailAddress
        : user.family.emailAddress,
    photoUrl:
      user.type === 'nanny' ? user.nanny.photoUrl : user.family.photoUrl,
    nannyId: user.type === 'nanny' ? user.nanny.id : undefined,
    familyId: user.type === 'family' ? user.family.id : undefined,
    authId: user.authId,
  };

  return (
    <DashboardLayout
      role={userData.role}
      userName={userData.name}
      userEmail={userData.email}
      userImage={userData.photoUrl}
      nannyId={userData.nannyId}
      familyId={userData.familyId}
      authId={userData.authId}
    >
      {children}
      <ProfileSetupWidget />
    </DashboardLayout>
  );
}
