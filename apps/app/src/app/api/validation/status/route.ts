import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * GET /api/validation/status - Retorna o status da validação do usuario
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'Apenas babas podem acessar status de validação' }, { status: 403 });
    }

    const nannyId = currentUser.nanny.id;

    // Buscar validação
    const validation = await prisma.validationRequest.findUnique({
      where: { nannyId },
      select: {
        id: true,
        level: true,
        status: true,
        cpf: true,
        name: true,
        facematchScore: true,
        livenessScore: true,
        bigidValid: true,
        reportUrl: true,
        createdAt: true,
        completedAt: true,
      },
    });

    // Buscar dados da baba para verificar selos
    const nanny = await prisma.nanny.findUnique({
      where: { id: nannyId },
      select: {
        documentValidated: true,
        documentExpirationDate: true,
        criminalBackgroundValidated: true,
        subscription: {
          select: {
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      validation,
      badges: {
        isVerified: nanny?.documentValidated ?? false,
        isPremium: validation?.level === 'PREMIUM' && validation?.status === 'COMPLETED',
        hasCriminalCheck: nanny?.criminalBackgroundValidated ?? false,
      },
      hasActivePlan:
        nanny?.subscription?.status === 'ACTIVE' &&
        nanny?.subscription?.plan === 'NANNY_PRO',
    });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
