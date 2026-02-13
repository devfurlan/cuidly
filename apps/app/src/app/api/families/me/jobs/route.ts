import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * GET /api/families/me/jobs - List active jobs for the current family
 * Used by job selector in nanny search and profile pages
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'Usuário não é uma família' }, { status: 400 });
    }

    const jobs = await prisma.job.findMany({
      where: {
        familyId: currentUser.family.id,
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        childrenIds: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching family jobs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
