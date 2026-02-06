import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getProfileViewUsage } from '@/services/subscription';

/**
 * GET /api/profile-views - Retorna o status de visualizações do usuário
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const lookup = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    const usage = await getProfileViewUsage(lookup);

    return NextResponse.json({
      success: true,
      ...usage,
    });
  } catch (error) {
    console.error('Error getting profile view usage:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
