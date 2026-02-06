import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { NextResponse } from 'next/server';
import { PaymentGatewayFactory } from '@/lib/payment/gateway-factory';

export async function POST() {
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

    if (!subscription) {
      return NextResponse.json(
        { error: 'Você não possui uma assinatura' },
        { status: 404 },
      );
    }

    if (!subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: 'Sua assinatura não está agendada para cancelamento' },
        { status: 400 },
      );
    }

    // Check if user is on a free plan (shouldn't happen but just in case)
    const isFreePlan = subscription.plan === 'FAMILY_FREE' || subscription.plan === 'NANNY_FREE';
    if (isFreePlan) {
      return NextResponse.json(
        { error: 'Você não possui um plano pago' },
        { status: 400 },
      );
    }

    // Check if subscription still exists in Asaas
    let needsRecreation = false;
    let asaasError: string | null = null;

    if (subscription.externalSubscriptionId && subscription.paymentGateway !== 'MANUAL') {
      try {
        const gateway = PaymentGatewayFactory.create(subscription.paymentGateway);
        const checkResult = await gateway.getSubscription(subscription.externalSubscriptionId);

        if (!checkResult.success) {
          // Subscription was deleted in Asaas, needs recreation
          needsRecreation = true;
          console.log(
            `[REVERT_CANCEL] Subscription ${subscription.externalSubscriptionId} not found in Asaas, needs recreation`
          );
        } else {
          // Subscription exists, just clear cancellation flags
          console.log(
            `[REVERT_CANCEL] Subscription ${subscription.externalSubscriptionId} still exists in Asaas`
          );
        }
      } catch (error) {
        console.error('[REVERT_CANCEL] Error checking Asaas subscription:', error);
        asaasError = error instanceof Error ? error.message : 'Erro desconhecido';
        // If we can't check, assume it needs recreation to be safe
        needsRecreation = true;
      }
    }

    // If subscription was deleted in Asaas, we cannot recreate it automatically
    // because we don't have the payment method information stored
    // In this case, we'll just clear the cancellation flags and warn the user
    if (needsRecreation) {
      console.warn(
        `[REVERT_CANCEL] Cannot automatically recreate subscription ${subscription.externalSubscriptionId} - payment method info not stored`
      );

      // Just clear cancellation flags in DB
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: false,
          canceledAt: null,
          cancellationReason: null,
          cancellationFeedback: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Cancelamento revertido localmente. Sua assinatura foi deletada no gateway de pagamento e precisará ser recriada manualmente.',
        warning: 'A assinatura foi deletada no gateway de pagamento. Entre em contato com o suporte para reativar.',
        subscription: {
          id: updatedSubscription.id,
          plan: updatedSubscription.plan,
          currentPeriodEnd: updatedSubscription.currentPeriodEnd,
          cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
        },
      });
    }

    // Subscription still exists in Asaas, just clear cancellation flags
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
        cancellationReason: null,
        cancellationFeedback: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cancelamento revertido com sucesso! Seu plano continua ativo.',
      subscription: {
        id: updatedSubscription.id,
        plan: updatedSubscription.plan,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
      },
      warning: asaasError,
    });
  } catch (error) {
    console.error('Erro ao reverter cancelamento:', error);
    return NextResponse.json(
      { error: 'Erro ao reverter cancelamento' },
      { status: 500 },
    );
  }
}
