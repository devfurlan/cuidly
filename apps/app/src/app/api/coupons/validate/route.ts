import { validateCoupon, getPlanPrice } from '@/services/coupon';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { SubscriptionPlan, BillingInterval } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ValidateCouponSchema = z.object({
  code: z.string().min(1, 'Código do cupom é obrigatório'),
  planId: z.nativeEnum(SubscriptionPlan),
  billingInterval: z.nativeEnum(BillingInterval).optional().default('MONTH'),
});

/**
 * POST /api/coupons/validate
 * Valida um cupom de desconto para um plano especifico
 */
export async function POST(req: NextRequest) {
  try {
    // Obter usuario logado (opcional para validação)
    const currentUser = await getCurrentUser();

    const body = await req.json();
    const validation = ValidateCouponSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { code, planId, billingInterval } = validation.data;

    // Obter valor do plano para o billing interval
    const purchaseAmount = getPlanPrice(planId, billingInterval);

    // Validar cupom
    const result = await validateCoupon({
      code,
      plan: planId,
      billingInterval,
      userId: currentUser?.authId,
      userRole: currentUser ? (currentUser.type === 'nanny' ? 'NANNY' : 'FAMILY') : undefined,
      purchaseAmount,
    });

    if (!result.isValid) {
      return NextResponse.json(
        {
          isValid: false,
          message: result.message,
          errorCode: result.errorCode,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      isValid: true,
      discountAmount: result.discountAmount,
      originalAmount: result.originalAmount,
      finalAmount: result.finalAmount,
    });
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
