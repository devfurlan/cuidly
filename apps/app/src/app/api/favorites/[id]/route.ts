import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * DELETE /api/favorites/[id] - Remover dos favoritos
 * O [id] aqui é o nannyId para facilitar o uso no frontend
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const nannyId = parseInt(id, 10);

    if (isNaN(nannyId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json(
        { error: 'Apenas famílias podem remover favoritos' },
        { status: 403 }
      );
    }

    // Verificar se o favorito existe
    const favorite = await prisma.favorite.findUnique({
      where: {
        familyId_nannyId: {
          familyId: currentUser.family.id,
          nannyId: nannyId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorito não encontrado' },
        { status: 404 }
      );
    }

    // Remover favorito
    await prisma.favorite.delete({
      where: {
        familyId_nannyId: {
          familyId: currentUser.family.id,
          nannyId: nannyId,
        },
      },
    });

    return NextResponse.json({ message: 'Babá removida dos favoritos' });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
