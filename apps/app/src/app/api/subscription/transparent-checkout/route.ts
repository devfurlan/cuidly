import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { AsaasGateway } from '@/lib/payment/asaas-gateway';
import prisma from '@/lib/prisma';
import { validateCoupon, applyCoupon, getPlanPrice } from '@/services/coupon';
import { SubscriptionPlan, BillingInterval, PaymentGateway, PaymentStatus, Prisma } from '@prisma/client';
import { PLAN_LABELS } from '@cuidly/core';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { decrypt, isEncrypted } from '@/lib/encryption';
import { sendEmail } from '@/lib/email/sendEmail';
import {
  getWelcomeSubscriptionEmailTemplate,
  getTrialWelcomeEmailTemplate,
  getReactivationEmailTemplate,
} from '@/lib/email/react-templates';
import { config } from '@/config';

// Tipos para metadata do pagamento
interface PixMetadata {
  pixQrCode: string;
  pixCopyPaste: string;
  pixExpiresAt: string;
}

interface CardMetadata {
  cardLastDigits?: string;
  cardBrand?: string;
}

// Dados do cartao (numero, validade, cvv)
const CreditCardSchema = z.object({
  number: z.string().regex(/^\d{13,19}$/, 'Numero do cartao invalido'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Mes de validade invalido'),
  expiryYear: z.string().regex(/^\d{4}$/, 'Ano de validade invalido'),
  ccv: z.string().regex(/^\d{3,4}$/, 'CVV invalido'),
});

// Dados do titular do cartao (opcional - só quando cartão é de outra pessoa)
const CreditCardHolderInfoSchema = z.object({
  name: z.string().min(3, 'Nome obrigatorio'),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ obrigatorio'),
});

const TransparentCheckoutSchema = z.object({
  paymentMethod: z.enum(['CREDIT_CARD', 'PIX']),
  plan: z.nativeEnum(SubscriptionPlan),
  billingInterval: z.nativeEnum(BillingInterval),
  couponCode: z.string().optional(),
  // Dados do cartao (obrigatorio se paymentMethod = CREDIT_CARD)
  creditCard: CreditCardSchema.optional(),
  creditCardHolderInfo: CreditCardHolderInfoSchema.optional(),
});

/**
 * POST /api/subscription/transparent-checkout
 * Processa pagamento de assinatura via checkout transparente (sem redirecionamento)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Obter usuario logado
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    // 2. Validar dados da requisicao
    const body = await req.json();
    const validation = TransparentCheckoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: validation.error.errors },
        { status: 400 },
      );
    }

    const { paymentMethod, plan, billingInterval, couponCode, creditCard, creditCardHolderInfo } = validation.data;

    // 3. Validar se o método de pagamento tem os dados necessários
    if (paymentMethod === 'CREDIT_CARD' && !creditCard) {
      return NextResponse.json(
        { error: 'Dados do cartao de credito sao obrigatorios' },
        { status: 400 },
      );
    }

    // 4. Calcular valor do plano
    let finalValue = getPlanPrice(plan, billingInterval);
    let discountAmount = 0;
    let appliedCouponId: string | undefined;

    // 5. Validar e aplicar cupom (se fornecido)
    let isFreeTrial = false;
    let trialDays = 0;

    if (couponCode) {
      const couponValidation = await validateCoupon({
        code: couponCode,
        plan,
        billingInterval,
        userId: currentUser.authId,
        userRole: currentUser.type === 'nanny' ? 'NANNY' : 'FAMILY',
        userEmail: currentUser.type === 'nanny' ? currentUser.nanny.emailAddress ?? undefined : currentUser.family.emailAddress ?? undefined,
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
      isFreeTrial = couponValidation.isFreeTrial ?? false;
      trialDays = couponValidation.trialDays ?? 0;
    }

    // 5.1. Handle FREE_TRIAL_DAYS coupon - requires credit card
    if (isFreeTrial && paymentMethod !== 'CREDIT_CARD') {
      return NextResponse.json(
        { error: 'Cupons de teste gratuito exigem cartao de credito para cobranca futura' },
        { status: 400 },
      );
    }

    // 6. Obter gateway de pagamento
    const gateway = new AsaasGateway();

    // 7. Criar/recuperar customer no gateway
    const subscription = currentUser.type === 'nanny'
      ? currentUser.nanny.subscription
      : currentUser.family.subscription;
    let externalCustomerId = subscription?.externalCustomerId ?? null;

    // Detectar se é uma reativação (tinha assinatura cancelada ou plano free)
    const isReactivation = subscription?.status === 'CANCELED' ||
      subscription?.plan === 'FAMILY_FREE' ||
      subscription?.plan === 'NANNY_FREE';

    // Dados do usuario (CPF obrigatorio no onboarding, tanto para nanny quanto family)
    // Descriptografar CPF se necessário
    let userCpf = currentUser.type === 'nanny'
      ? currentUser.nanny.cpf
      : currentUser.family.cpf;
    if (userCpf && isEncrypted(userCpf)) {
      userCpf = decrypt(userCpf);
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
    const addressId = currentUser.type === 'nanny'
      ? currentUser.nanny.addressId
      : currentUser.family.addressId;

    if (!customerName) {
      return NextResponse.json(
        { error: 'Complete seu perfil antes de assinar. O nome e obrigatorio.' },
        { status: 400 },
      );
    }

    if (!userCpf) {
      return NextResponse.json(
        { error: 'Complete seu perfil antes de assinar. O CPF e obrigatorio.' },
        { status: 400 },
      );
    }

    // Buscar endereco do usuario (necessario para o gateway de pagamento)
    let userAddress = null;
    if (addressId) {
      userAddress = await prisma.address.findUnique({
        where: { id: addressId },
      });
    }

    if (!userAddress) {
      return NextResponse.json(
        { error: 'Complete seu perfil antes de assinar. O endereco e obrigatorio.' },
        { status: 400 },
      );
    }

    // Criar customer se nao existir
    if (!externalCustomerId) {
      const customerResult = await gateway.createCustomer({
        userId: currentUser.authId,
        name: customerName,
        email: email ?? '',
        cpfCnpj: userCpf,
        phone: phone ?? undefined,
        userType: currentUser.type,
      });

      if (!customerResult.success || !customerResult.data) {
        return NextResponse.json(
          { error: customerResult.error || 'Erro ao criar cliente no gateway' },
          { status: 400 },
        );
      }

      externalCustomerId = customerResult.data.externalCustomerId;
    }

    // 8. Processar pagamento baseado no método
    const entityIdField = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    if (paymentMethod === 'CREDIT_CARD') {
      // Determinar dados do titular do cartao:
      // - Se creditCardHolderInfo foi passado, cartao eh de outra pessoa
      // - Senao, usa os dados do perfil do usuario
      const holderName = creditCardHolderInfo?.name ?? customerName;
      const holderCpf = creditCardHolderInfo?.cpfCnpj ?? userCpf;

      // Calculate trial end date if this is a free trial coupon
      const trialEndDate = isFreeTrial ? calculateTrialEndDate(trialDays) : null;
      // For trials, set nextDueDate to the trial end date (first charge after trial)
      // For normal subscriptions, charge immediately (today)
      const nextDueDate = isFreeTrial
        ? trialEndDate!.toISOString().split('T')[0]
        : undefined;
      // For trials, use the original plan price (not discounted) for future charges
      const subscriptionValue = isFreeTrial ? getPlanPrice(plan, billingInterval) : finalValue;

      // Checkout com cartao de credito
      const planLabel = PLAN_LABELS[plan as keyof typeof PLAN_LABELS] || plan;
      const subscriptionResult = await gateway.createSubscriptionWithCard({
        customerId: externalCustomerId,
        plan,
        billingInterval,
        value: subscriptionValue,
        description: `Assinatura ${planLabel} - ${getPlanDescription(billingInterval)}`,
        creditCard: {
          ...creditCard!,
          holderName, // Nome do titular (do formulario ou do perfil)
        },
        creditCardHolderInfo: {
          name: holderName,
          email: email ?? '',
          cpfCnpj: holderCpf,
          postalCode: userAddress.zipCode,
          addressNumber: userAddress.number || 'S/N',
          addressComplement: userAddress.complement || undefined,
          phone: phone || '11999999999',
          mobilePhone: phone || '11999999999',
        },
        nextDueDate, // For trials: first charge after trial ends
      });

      if (!subscriptionResult.success || !subscriptionResult.data) {
        return NextResponse.json(
          { error: subscriptionResult.error || 'Erro ao processar pagamento' },
          { status: 400 },
        );
      }

      // Determine subscription status and period end based on trial
      const subscriptionStatus = isFreeTrial ? 'TRIALING' : 'ACTIVE';
      const periodEnd = isFreeTrial ? trialEndDate! : calculatePeriodEnd(billingInterval);

      // Criar/atualizar subscription no banco
      const newSubscription = await prisma.subscription.upsert({
        where: entityIdField,
        create: {
          ...entityIdField,
          plan,
          billingInterval,
          status: subscriptionStatus,
          paymentGateway: 'ASAAS' as PaymentGateway,
          externalCustomerId,
          externalSubscriptionId: subscriptionResult.data.externalSubscriptionId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
          trialEndDate: trialEndDate,
          appliedCouponId,
          discountAmount: discountAmount > 0 ? discountAmount : null,
        },
        update: {
          plan,
          billingInterval,
          status: subscriptionStatus,
          externalSubscriptionId: subscriptionResult.data.externalSubscriptionId,
          currentPeriodEnd: periodEnd,
          trialEndDate: trialEndDate,
          appliedCouponId,
          discountAmount: discountAmount > 0 ? discountAmount : null,
        },
      });

      // Registrar uso do cupom
      if (appliedCouponId && discountAmount > 0) {
        await applyCoupon(appliedCouponId, currentUser.authId, newSubscription.id, discountAmount);
      }

      // For trials, we don't create a payment record yet (no charge)
      if (isFreeTrial) {
        // Enviar e-mail de boas-vindas ao trial
        if (email) {
          const planLabel = PLAN_LABELS[plan as keyof typeof PLAN_LABELS] || plan;
          const trialEmailTemplate = await getTrialWelcomeEmailTemplate({
            name: customerName.split(' ')[0],
            userType: currentUser.type === 'nanny' ? 'nanny' : 'family',
            planName: planLabel,
            trialDays,
            trialEndDate: trialEndDate!.toLocaleDateString('pt-BR'),
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
          paymentMethod: 'CREDIT_CARD',
          subscriptionId: newSubscription.id,
          status: 'TRIALING',
          trialEndDate: trialEndDate!.toISOString(),
          trialDays,
          message: `Periodo de teste de ${trialDays} dias ativado! Sua assinatura sera cobrada automaticamente em ${trialEndDate!.toLocaleDateString('pt-BR')}.`,
        });
      }

      // Buscar o primeiro pagamento da assinatura no Asaas
      const paymentsResult = await gateway.getSubscriptionPayments(subscriptionResult.data.externalSubscriptionId);
      const firstPayment = paymentsResult.data?.[0];

      // Criar Payment no banco local
      const cardMetadata: CardMetadata = {
        cardLastDigits: creditCard!.number.slice(-4),
      };

      const payment = await prisma.payment.create({
        data: {
          ...entityIdField,
          subscriptionId: newSubscription.id,
          amount: finalValue,
          currency: 'BRL',
          status: 'CONFIRMED' as PaymentStatus, // Cartão aprovado
          type: 'SUBSCRIPTION',
          description: `Assinatura ${getPlanDescription(billingInterval)} - ${plan}`,
          paymentGateway: 'ASAAS' as PaymentGateway,
          externalPaymentId: firstPayment?.id ?? null,
          paymentMethod: 'CREDIT_CARD',
          paidAt: new Date(),
          metadata: cardMetadata as unknown as Prisma.JsonObject,
        },
      });

      // Enviar e-mail de boas-vindas ou reativação
      if (email) {
        const planLabel = PLAN_LABELS[plan as keyof typeof PLAN_LABELS] || plan;
        const billingIntervalLabel = getBillingIntervalLabel(billingInterval);
        const nextBillingDate = periodEnd.toLocaleDateString('pt-BR');
        const amountFormatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(finalValue);

        const emailTemplate = isReactivation
          ? await getReactivationEmailTemplate({
              name: customerName.split(' ')[0],
              userType: currentUser.type === 'nanny' ? 'nanny' : 'family',
              planName: planLabel,
              billingInterval: billingIntervalLabel,
              amount: amountFormatted,
              nextBillingDate,
              dashboardUrl: `${config.site.url}/app`,
            })
          : await getWelcomeSubscriptionEmailTemplate({
              name: customerName.split(' ')[0],
              userType: currentUser.type === 'nanny' ? 'nanny' : 'family',
              planName: planLabel,
              billingInterval: billingIntervalLabel,
              amount: amountFormatted,
              nextBillingDate,
              dashboardUrl: `${config.site.url}/app`,
            });

        sendEmail({
          to: email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        }).catch((err) => console.error('Erro ao enviar e-mail de assinatura:', err));
      }

      return NextResponse.json({
        success: true,
        paymentMethod: 'CREDIT_CARD',
        subscriptionId: newSubscription.id,
        paymentId: payment.id,
        status: 'ACTIVE',
        message: 'Assinatura ativada com sucesso!',
      });

    } else {
      // Checkout com PIX - Criar assinatura recorrente
      const pixResult = await gateway.createPixSubscription({
        customerId: externalCustomerId,
        value: finalValue,
        billingInterval,
        description: `Assinatura Cuidly Plus - ${getPlanDescription(billingInterval)}`,
      });

      if (!pixResult.success || !pixResult.data) {
        return NextResponse.json(
          { error: pixResult.error || 'Erro ao gerar cobranca PIX' },
          { status: 400 },
        );
      }

      // Criar/atualizar subscription como INCOMPLETE (sera ativada via webhook quando PIX for pago)
      const newSubscription = await prisma.subscription.upsert({
        where: entityIdField,
        create: {
          ...entityIdField,
          plan,
          billingInterval,
          status: 'INCOMPLETE', // Aguardando pagamento PIX
          paymentGateway: 'ASAAS' as PaymentGateway,
          externalCustomerId,
          externalSubscriptionId: pixResult.data.externalSubscriptionId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: calculatePeriodEnd(billingInterval),
          appliedCouponId,
          discountAmount: discountAmount > 0 ? discountAmount : null,
        },
        update: {
          plan,
          billingInterval,
          status: 'INCOMPLETE',
          externalSubscriptionId: pixResult.data.externalSubscriptionId,
          currentPeriodEnd: calculatePeriodEnd(billingInterval),
          appliedCouponId,
          discountAmount: discountAmount > 0 ? discountAmount : null,
        },
      });

      // Registrar uso do cupom (pendente confirmacao do pagamento)
      if (appliedCouponId && discountAmount > 0) {
        await applyCoupon(appliedCouponId, currentUser.authId, newSubscription.id, discountAmount);
      }

      // Criar Payment no banco local com status PENDING e dados do PIX
      const pixMetadata: PixMetadata = {
        pixQrCode: pixResult.data.pixQrCode.encodedImage,
        pixCopyPaste: pixResult.data.pixQrCode.payload,
        pixExpiresAt: pixResult.data.pixQrCode.expirationDate,
      };

      const payment = await prisma.payment.create({
        data: {
          ...entityIdField,
          subscriptionId: newSubscription.id,
          amount: finalValue,
          currency: 'BRL',
          status: 'PENDING' as PaymentStatus, // Aguardando pagamento PIX
          type: 'SUBSCRIPTION',
          description: `Assinatura ${getPlanDescription(billingInterval)} - ${plan}`,
          paymentGateway: 'ASAAS' as PaymentGateway,
          externalPaymentId: pixResult.data.externalPaymentId,
          paymentMethod: 'PIX',
          metadata: pixMetadata as unknown as Prisma.JsonObject,
        },
      });

      return NextResponse.json({
        success: true,
        paymentMethod: 'PIX',
        subscriptionId: newSubscription.id,
        paymentId: payment.id,
        status: 'PENDING',
        pixData: {
          qrCodeImage: pixResult.data.pixQrCode.encodedImage,
          copyPaste: pixResult.data.pixQrCode.payload,
          expiresAt: pixResult.data.pixQrCode.expirationDate,
        },
        message: 'QR Code PIX gerado! Escaneie para pagar.',
      });
    }
  } catch (error) {
    console.error('Erro no checkout transparente:', error);
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

function getPlanDescription(billingInterval: BillingInterval): string {
  switch (billingInterval) {
    case 'MONTH':
      return 'Mensal';
    case 'QUARTER':
      return 'Trimestral';
    case 'YEAR':
      return 'Anual';
    default:
      return 'Mensal';
  }
}

function calculateTrialEndDate(trialDays: number): Date {
  const now = new Date();
  now.setDate(now.getDate() + trialDays);
  return now;
}

function getBillingIntervalLabel(billingInterval: BillingInterval): string {
  switch (billingInterval) {
    case 'MONTH':
      return 'Mensal';
    case 'QUARTER':
      return 'Trimestral';
    case 'YEAR':
      return 'Anual';
    default:
      return 'Mensal';
  }
}
