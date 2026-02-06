/**
 * API Route: Get Nanny by Auth ID
 * GET /api/nannies/by-user/[userId] (legacy - now uses authId)
 *
 * Requer autenticação - usuário só pode acessar seu próprio perfil de babá
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verificar autenticação
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // The userId param is actually the authId now (legacy naming)
    // Verificar se o usuário está acessando seus próprios dados
    if (currentUser.authId !== userId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Find nanny by authId
    const nanny = await prisma.nanny.findUnique({
      where: { authId: userId },
      include: {
        address: true,
      },
    });

    if (!nanny) {
      return NextResponse.json(
        { error: 'Babá não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(nanny);
  } catch (error) {
    console.error('Error fetching nanny:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
