import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import prisma from '@/lib/prisma';

/**
 * POST /api/email/verify-after-password-reset
 *
 * Marca o email como verificado após o usuário definir a senha
 * Usado durante a migração de partners do Google Forms
 */
export async function POST(request: NextRequest) {
  try {
    const { authId } = await request.json();

    if (!authId) {
      return NextResponse.json(
        { error: 'authId é obrigatório' },
        { status: 400 },
      );
    }

    // Verificar autenticação
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.authId !== authId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Get entity based on user type
    const entity = currentUser.type === 'nanny' ? currentUser.nanny : currentUser.family;

    // Marcar email como verificado baseado no tipo de usuário
    if (currentUser.type === 'nanny') {
      await prisma.nanny.update({
        where: { id: entity.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    } else {
      await prisma.family.update({
        where: { id: entity.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    }

    console.log(`✅ Email verificado para ${currentUser.type} ${entity.id} (authId: ${authId})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 },
    );
  }
}
