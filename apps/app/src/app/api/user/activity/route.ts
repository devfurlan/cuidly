import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * POST /api/user/activity
 * Atualiza o lastActivityAt do usuário atual
 * Usado para determinar status online/offline
 */
export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const now = new Date();

    if (currentUser.type === 'nanny') {
      await prisma.nanny.update({
        where: { id: currentUser.nanny.id },
        data: { lastActivityAt: now },
      });
    } else {
      await prisma.family.update({
        where: { id: currentUser.family.id },
        data: { lastActivityAt: now },
      });
    }

    return NextResponse.json({ success: true, lastActivityAt: now.toISOString() });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
