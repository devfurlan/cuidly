import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import prisma from '@/lib/prisma';
import { validateCoupon, applyCoupon } from '@/services/coupon';
import { SubscriptionPlan, BillingInterval } from '@prisma/client';
import { PLAN_LABELS } from '@cuidly/core';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/sendEmail';
import { getTrialWelcomeEmailTemplate } from '@/lib/email/react-templates';
import { config } from '@/config';

const ActivateTrialSchema = z.object({
  plan: z.nativeEnum(SubscriptionPlan),
  billingInterval: z.nativeEnum(BillingInterval),
  couponCode: z.string().min(1, 'Codigo do cupom e obrigatorio'),
});

/**
 * POST /api/subscription/activate-trial
 * Ativa um periodo de teste gratuito sem cartao de credito
 */
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const validation = ActivateTrialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: validation.error.errors },
        { status: 400 },
      );
    }

    const { plan, billingInterval, couponCode } = validation.data;

    // Validate coupon
    const couponValidation = await validateCoupon({
      code: couponCode,
      plan,
      billingInterval,
      userId: currentUser.authId,
      userRole: currentUser.type === 'nanny' ? 'NANNY' : 'FAMILY',
      userEmail: currentUser.type === 'nanny'
        ? currentUser.nanny.emailAddress ?? undefined
        : currentUser.family.emailAddress ?? undefined,
    });

    if (!couponValidation.isValid) {
      return NextResponse.json(
        { error: couponValidation.message },
        { status: 400 },
      );
    }

    // Must be a free trial coupon that does NOT require credit card
    if (!couponValidation.isFreeTrial) {
      return NextResponse.json(
        { error: 'Este cupom nao e um cupom de teste gratuito' },
        { status: 400 },
      );
    }

    if (couponValidation.requiresCreditCard) {
      return NextResponse.json(
        { error: 'Este cupom exige cartao de credito. Use o checkout normal.' },
        { status: 400 },
      );
    }

    // Check if user already has a paid active subscription
    const entityIdField = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    const existingPaidSubscription = await prisma.subscription.findFirst({
      where: {
        ...entityIdField,
        status: { in: ['ACTIVE', 'TRIALING'] },
        plan: { notIn: ['NANNY_FREE', 'FAMILY_FREE'] },
      },
    });

    if (existingPaidSubscription) {
      return NextResponse.json(
        { error: 'Voce ja possui uma assinatura ativa' },
        { status: 400 },
      );
    }

    // Calculate trial end date
    const trialDays = couponValidation.trialDays ?? 0;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    // Create subscription without Asaas (no payment gateway)
    const newSubscription = await prisma.subscription.upsert({
      where: entityIdField,
      create: {
        ...entityIdField,
        plan,
        billingInterval,
        status: 'TRIALING',
        paymentGateway: 'ASAAS',
        externalCustomerId: null,
        externalSubscriptionId: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndDate,
        trialEndDate,
        appliedCouponId: couponValidation.couponId,
        discountAmount: couponValidation.discountAmount ?? null,
      },
      update: {
        plan,
        billingInterval,
        status: 'TRIALING',
        externalCustomerId: null,
        externalSubscriptionId: null,
        currentPeriodEnd: trialEndDate,
        trialEndDate,
        appliedCouponId: couponValidation.couponId,
        discountAmount: couponValidation.discountAmount ?? null,
      },
    });

    // Record coupon usage
    if (couponValidation.couponId) {
      await applyCoupon(
        couponValidation.couponId,
        currentUser.authId,
        newSubscription.id,
        couponValidation.discountAmount ?? 0,
      );
    }

    // Send trial welcome email
    const email = currentUser.type === 'nanny'
      ? currentUser.nanny.emailAddress
      : currentUser.family.emailAddress;
    const customerName = currentUser.type === 'nanny'
      ? currentUser.nanny.name
      : currentUser.family.name;

    if (email && customerName) {
      const planLabel = PLAN_LABELS[plan as keyof typeof PLAN_LABELS] || plan;
      const trialEmailTemplate = await getTrialWelcomeEmailTemplate({
        name: customerName.split(' ')[0],
        userType: currentUser.type === 'nanny' ? 'nanny' : 'family',
        planName: planLabel,
        trialDays,
        trialEndDate: trialEndDate.toLocaleDateString('pt-BR'),
        dashboardUrl: `${config.site.url}/app`,
      });

      sendEmail({
        to: email,
        subject: trialEmailTemplate.subject,
        html: trialEmailTemplate.html,
        text: trialEmailTemplate.text,
      }).catch((err) => console.error('Erro ao enviar e-mail de trial:', err));
    }

    return NextResponse.json({
      success: true,
      subscriptionId: newSubscription.id,
      status: 'TRIALING',
      trialEndDate: trialEndDate.toISOString(),
      trialDays,
      message: `Periodo de teste de ${trialDays} dias ativado! Aproveite todos os recursos do plano.`,
    });
  } catch (error) {
    console.error('Erro ao ativar trial:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
