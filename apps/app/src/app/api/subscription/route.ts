import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereClause = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    const subscription = await prisma.subscription.findFirst({
      where: whereClause,
    });

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        plan: 'FREE',
        status: 'ACTIVE',
      });
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        createdAt: subscription.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 },
    );
  }
}
