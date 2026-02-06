import { NextResponse } from 'next/server';
import { getCurrentUserOrUntyped } from '@/lib/auth/getCurrentUser';

/**
 * GET /api/user/me
 * Returns the current authenticated user's data for client-side components.
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUserOrUntyped();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.type === 'untyped') {
      return NextResponse.json({
        authId: currentUser.authId,
        role: 'UNTYPED',
        onboardingCompleted: false,
      });
    }

    if (currentUser.type === 'nanny') {
      const nanny = currentUser.nanny;
      return NextResponse.json({
        id: nanny.id,
        authId: currentUser.authId,
        name: nanny.name,
        email: nanny.emailAddress,
        role: 'NANNY',
        photoUrl: nanny.photoUrl,
        onboardingCompleted: nanny.onboardingCompleted,
        emailVerified: nanny.emailVerified,
        nannyId: nanny.id,
      });
    }

    if (currentUser.type === 'family') {
      const family = currentUser.family;
      return NextResponse.json({
        id: family.id,
        authId: currentUser.authId,
        name: family.name,
        email: family.emailAddress,
        role: 'FAMILY',
        photoUrl: family.photoUrl,
        onboardingCompleted: family.onboardingCompleted,
        emailVerified: family.emailVerified,
        familyId: family.id,
      });
    }

    return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
