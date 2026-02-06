import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const whereClause = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    const subscription = await prisma.subscription.findFirst({
      where: whereClause,
    });

    // Fetch payments separately since they are now linked to nanny/family directly
    const paymentsWhereClause = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    const payments = await prisma.payment.findMany({
      where: paymentsWhereClause,
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Se não tem assinatura, retorna plano FREE
    if (!subscription) {
      return NextResponse.json({
        plan: 'FREE',
        status: 'ACTIVE',
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        payments: [],
      });
    }

    return NextResponse.json({
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      billingInterval: subscription.billingInterval,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt,
      discountAmount: subscription.discountAmount,
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt,
        paymentMethod: p.paymentMethod,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
