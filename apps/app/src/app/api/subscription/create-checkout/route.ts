import { PaymentGatewayFactory } from '@/lib/payment/gateway-factory';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { PaymentGateway, SubscriptionPlan, BillingInterval } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon, applyCoupon, getPlanPrice, isValidBillingInterval } from '@/services/coupon';
import { decrypt, isEncrypted } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    // 1. Obter usuario logado
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const { plan, billingInterval, couponCode } = await req.json();

    // Validate plan and billing interval
    const planValue = plan as SubscriptionPlan;
    const intervalValue = (billingInterval || 'MONTH') as BillingInterval;

    if (!isValidBillingInterval(planValue, intervalValue)) {
      return NextResponse.json(
        { error: 'Combinacao de plano e intervalo de cobranca invalida' },
        { status: 400 },
      );
    }

    // 2. Calcular valor do plano
    let finalValue = getPlanPrice(planValue, intervalValue);

    // 3. Validar e calcular desconto do cupom (se fornecido)
    let discountAmount = 0;
    let appliedCouponId: string | undefined;

    if (couponCode) {
      const couponValidation = await validateCoupon({
        code: couponCode,
        plan: planValue,
        billingInterval: intervalValue,
        userId: currentUser.authId,
        userRole: currentUser.type === 'nanny' ? 'NANNY' : 'FAMILY',
        purchaseAmount: finalValue,
      });

      if (!couponValidation.isValid) {
        return NextResponse.json(
          { error: couponValidation.message },
          { status: 400 },
        );
      }

      discountAmount = couponValidation.discountAmount ?? 0;
      appliedCouponId = couponValidation.couponId;
      finalValue = couponValidation.finalAmount ?? finalValue;
    }

    // 4. Obter o gateway de pagamento configurado
    const gatewayType: PaymentGateway = 'ASAAS';
    const gateway = PaymentGatewayFactory.create(gatewayType);

    // 5. Criar/recuperar customer no gateway
    const subscription = currentUser.type === 'nanny'
      ? currentUser.nanny.subscription
      : currentUser.family.subscription;
    let externalCustomerId = subscription?.externalCustomerId ?? null;

    // Obter CPF, telefone e nome do perfil (Nanny ou Family)
    // Descriptografar CPF se necessário
    let cpfCnpj = currentUser.type === 'nanny' ? currentUser.nanny.cpf : undefined;
    if (cpfCnpj && isEncrypted(cpfCnpj)) {
      cpfCnpj = decrypt(cpfCnpj);
    }
    const phone = currentUser.type === 'nanny'
      ? currentUser.nanny.phoneNumber
      : currentUser.family.phoneNumber;
    const customerName = currentUser.type === 'nanny'
      ? currentUser.nanny.name
      : currentUser.family.name;
    const email = currentUser.type === 'nanny'
      ? currentUser.nanny.emailAddress
      : currentUser.family.emailAddress;

    if (!customerName) {
      return NextResponse.json(
        { error: 'Complete seu perfil antes de assinar. O nome é obrigatório.' },
        { status: 400 },
      );
    }

    if (!externalCustomerId) {
      const customerResult = await gateway.createCustomer({
        userId: currentUser.authId,
        name: customerName,
        email: email ?? '',
        cpfCnpj: cpfCnpj ?? undefined,
        phone: phone ?? undefined,
        userType: currentUser.type,
      });

      if (!customerResult.success || !customerResult.data) {
        return NextResponse.json(
          { error: customerResult.error || 'Erro ao criar customer' },
          { status: 400 },
        );
      }

      externalCustomerId = customerResult.data.externalCustomerId;
    }

    // 6. Criar subscription no gateway
    if (!externalCustomerId) {
      return NextResponse.json(
        { error: 'Erro ao criar customer no gateway' },
        { status: 500 },
      );
    }

    const subscriptionResult = await gateway.createSubscription({
      customerId: externalCustomerId,
      plan: planValue,
      billingInterval: intervalValue,
      billingType: 'CREDIT_CARD',
      value: finalValue,
    });

    if (!subscriptionResult.success || !subscriptionResult.data) {
      return NextResponse.json(
        { error: subscriptionResult.error || 'Erro ao criar subscription' },
        { status: 400 },
      );
    }

    const externalSubscriptionId = subscriptionResult.data.externalSubscriptionId;

    // 7. Criar/atualizar subscription no banco de dados
    const entityIdField = currentUser.type === 'nanny' ? { nannyId: currentUser.nanny.id } : { familyId: currentUser.family.id };
    const newSubscription = await prisma.subscription.upsert({
      where: entityIdField,
      create: {
        ...entityIdField,
        plan: planValue,
        billingInterval: intervalValue,
        status: 'INCOMPLETE',
        paymentGateway: gatewayType,
        externalCustomerId,
        externalSubscriptionId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: calculatePeriodEnd(intervalValue),
        appliedCouponId,
        discountAmount: discountAmount > 0 ? discountAmount : null,
      },
      update: {
        plan: planValue,
        billingInterval: intervalValue,
        status: 'INCOMPLETE',
        externalSubscriptionId,
        currentPeriodEnd: calculatePeriodEnd(intervalValue),
        appliedCouponId,
        discountAmount: discountAmount > 0 ? discountAmount : null,
      },
    });

    // 8. Registrar uso do cupom (se aplicado)
    if (appliedCouponId && discountAmount > 0) {
      await applyCoupon(appliedCouponId, currentUser.authId, newSubscription.id, discountAmount);
    }

    // 9. Gerar link de pagamento
    const paymentLinkResult = await gateway.createPaymentLink({
      subscriptionId: externalSubscriptionId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/assinatura/sucesso?plan=${plan}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/assinatura/cancelar`,
    });

    if (!paymentLinkResult.success || !paymentLinkResult.data) {
      return NextResponse.json(
        { error: paymentLinkResult.error || 'Erro ao criar link de pagamento' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      checkoutUrl: paymentLinkResult.data.checkoutUrl,
      discountApplied: discountAmount > 0,
      discountAmount,
      finalValue,
    });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

function calculatePeriodEnd(billingInterval: BillingInterval): Date {
  const now = new Date();

  switch (billingInterval) {
    case 'MONTH':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'QUARTER':
      return new Date(now.setMonth(now.getMonth() + 3));
    case 'YEAR':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      return new Date(now.setMonth(now.getMonth() + 1));
  }
}
