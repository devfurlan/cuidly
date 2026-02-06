import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * GET /api/auth/me - Get current user info
 *
 * Returns the current authenticated user (Nanny or Family).
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (user.type === 'nanny') {
      return NextResponse.json({
        id: user.authId,
        email: user.nanny.emailAddress,
        name: user.nanny.name,
        role: 'NANNY',
        nannyId: user.nanny.id,
        familyId: null,
        photoUrl: user.nanny.photoUrl,
        onboardingCompleted: user.nanny.onboardingCompleted,
      });
    } else {
      return NextResponse.json({
        id: user.authId,
        email: user.family.emailAddress,
        name: user.family.name,
        role: 'FAMILY',
        nannyId: null,
        familyId: user.family.id,
        photoUrl: user.family.photoUrl,
        onboardingCompleted: user.family.onboardingCompleted,
      });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
