import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/payments/pending
 * Verifica se existe um pagamento pendente para o usuário logado
 * Retorna { hasPending: false } ou { hasPending: true, paymentId: "..." }
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Determinar campo de busca baseado no tipo de usuário
    const entityIdField = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    // Buscar pagamento pendente mais recente
    // Status que indicam pagamento pendente: PENDING, PROCESSING, AWAITING_RISK_ANALYSIS
    const pendingPayment = await prisma.payment.findFirst({
      where: {
        ...entityIdField,
        status: {
          in: ['PENDING', 'PROCESSING', 'AWAITING_RISK_ANALYSIS'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        paymentMethod: true,
        amount: true,
        createdAt: true,
      },
    });

    if (!pendingPayment) {
      return NextResponse.json({
        hasPending: false,
      });
    }

    return NextResponse.json({
      hasPending: true,
      paymentId: pendingPayment.id,
      status: pendingPayment.status,
      paymentMethod: pendingPayment.paymentMethod,
      amount: pendingPayment.amount,
      createdAt: pendingPayment.createdAt,
    });

  } catch (error) {
    console.error('Erro ao verificar pagamento pendente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
