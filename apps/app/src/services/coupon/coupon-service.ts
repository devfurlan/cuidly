import prisma from '@/lib/prisma';
import {
  getAvailableBillingIntervals as coreGetAvailableBillingIntervals,
  getPlanPrice as coreGetPlanPrice,
  isValidBillingInterval as coreIsValidBillingInterval,
  BillingInterval,
  SubscriptionPlan,
} from '@cuidly/core';
import { SubscriptionPlan as PrismaSubscriptionPlan, BillingInterval as PrismaBillingInterval } from '@prisma/client';

export type UserRole = 'NANNY' | 'FAMILY';

export interface ValidateCouponParams {
  code: string;
  plan: PrismaSubscriptionPlan;
  billingInterval: PrismaBillingInterval;
  userId?: string;
  userRole?: UserRole;
  userEmail?: string;
  purchaseAmount?: number;
}

export interface ValidateCouponResult {
  isValid: boolean;
  couponId?: string;
  discountAmount?: number;
  originalAmount?: number;
  finalAmount?: number;
  message?: string;
  errorCode?: CouponErrorCode;
  /** Number of free trial days (only set when discountType is FREE_TRIAL_DAYS) */
  trialDays?: number;
  /** Flag indicating this is a free trial coupon */
  isFreeTrial?: boolean;
}

export type CouponErrorCode =
  | 'COUPON_NOT_FOUND'
  | 'COUPON_INACTIVE'
  | 'COUPON_EXPIRED'
  | 'COUPON_NOT_STARTED'
  | 'COUPON_USAGE_LIMIT'
  | 'COUPON_NOT_APPLICABLE'
  | 'COUPON_MIN_PURCHASE'
  | 'COUPON_USER_NOT_ALLOWED';

const ERROR_MESSAGES: Record<CouponErrorCode, string> = {
  COUPON_NOT_FOUND: 'Cupom não encontrado',
  COUPON_INACTIVE: 'Este cupom está inativo',
  COUPON_EXPIRED: 'Este cupom expirou',
  COUPON_NOT_STARTED: 'Este cupom ainda não está válido',
  COUPON_USAGE_LIMIT: 'Limite de uso deste cupom foi atingido',
  COUPON_NOT_APPLICABLE: 'Este cupom não é válido para este plano',
  COUPON_MIN_PURCHASE: 'Valor mínimo de compra não atingido',
  COUPON_USER_NOT_ALLOWED: 'Este cupom não está disponível para sua conta',
};

/**
 * Get price for a plan and billing interval
 * Re-exported from @cuidly/core for backwards compatibility
 */
export function getPlanPrice(plan: PrismaSubscriptionPlan, billingInterval: PrismaBillingInterval): number {
  return coreGetPlanPrice(plan as SubscriptionPlan, billingInterval as BillingInterval) ?? 0;
}

/**
 * Get available billing intervals for a plan
 * Re-exported from @cuidly/core for backwards compatibility
 */
export function getAvailableBillingIntervals(plan: PrismaSubscriptionPlan): PrismaBillingInterval[] {
  return coreGetAvailableBillingIntervals(plan as SubscriptionPlan) as PrismaBillingInterval[];
}

/**
 * Check if a billing interval is valid for a plan
 * Re-exported from @cuidly/core for backwards compatibility
 */
export function isValidBillingInterval(plan: PrismaSubscriptionPlan, billingInterval: PrismaBillingInterval): boolean {
  return coreIsValidBillingInterval(plan as SubscriptionPlan, billingInterval as BillingInterval);
}

export async function validateCoupon(
  params: ValidateCouponParams,
): Promise<ValidateCouponResult> {
  const { code, plan, billingInterval, userRole, userEmail, purchaseAmount } =
    params;

  // 1. Find coupon by código (case insensitive)
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: code.toUpperCase(),
      deletedAt: null,
    },
  });

  // 2. Check if coupon exists
  if (!coupon) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.COUPON_NOT_FOUND,
      errorCode: 'COUPON_NOT_FOUND',
    };
  }

  // 3. Verifica se isActive é true
  if (!coupon.isActive) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.COUPON_INACTIVE,
      errorCode: 'COUPON_INACTIVE',
    };
  }

  const now = new Date();

  // 4. Verifica se já começou
  if (coupon.startDate > now) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.COUPON_NOT_STARTED,
      errorCode: 'COUPON_NOT_STARTED',
    };
  }

  // 5. Verifica se não expirou
  if (coupon.endDate < now) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.COUPON_EXPIRED,
      errorCode: 'COUPON_EXPIRED',
    };
  }

  // 6. Check usage limit
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.COUPON_USAGE_LIMIT,
      errorCode: 'COUPON_USAGE_LIMIT',
    };
  }

  // 7. Check applicability
  const isApplicable = checkApplicability(coupon, plan, userRole);
  if (!isApplicable) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.COUPON_NOT_APPLICABLE,
      errorCode: 'COUPON_NOT_APPLICABLE',
    };
  }

  // 8. Check user restriction
  if (coupon.hasUserRestriction && userEmail) {
    const isAllowed = await checkUserAllowedForCoupon(coupon.id, userEmail);
    if (!isAllowed) {
      return {
        isValid: false,
        message: ERROR_MESSAGES.COUPON_USER_NOT_ALLOWED,
        errorCode: 'COUPON_USER_NOT_ALLOWED',
      };
    }
  }

  // 9. Get purchase amount
  const originalAmount = purchaseAmount ?? getPlanPrice(plan, billingInterval);

  // 10. Check minimum purchase amount
  if (
    coupon.minPurchaseAmount !== null &&
    originalAmount < coupon.minPurchaseAmount
  ) {
    return {
      isValid: false,
      message: `${ERROR_MESSAGES.COUPON_MIN_PURCHASE}. Mínimo: R$ ${coupon.minPurchaseAmount.toFixed(2)}`,
      errorCode: 'COUPON_MIN_PURCHASE',
    };
  }

  // 11. Handle FREE_TRIAL_DAYS separately
  if (coupon.discountType === 'FREE_TRIAL_DAYS') {
    return {
      isValid: true,
      couponId: coupon.id,
      discountAmount: originalAmount, // 100% discount for the trial period
      originalAmount,
      finalAmount: 0, // No charge during trial
      trialDays: coupon.discountValue,
      isFreeTrial: true,
    };
  }

  // 12. Calculate discount (for PERCENTAGE and FIXED types)
  const discountAmount = calculateDiscount(
    coupon.discountType,
    coupon.discountValue,
    originalAmount,
    coupon.maxDiscount,
  );

  const finalAmount = Math.max(0, originalAmount - discountAmount);

  return {
    isValid: true,
    couponId: coupon.id,
    discountAmount,
    originalAmount,
    finalAmount,
  };
}

/**
 * Verifica se o e-mail do usuário está na lista de e-mails permitidos do cupom
 */
async function checkUserAllowedForCoupon(
  couponId: string,
  userEmail: string,
): Promise<boolean> {
  const normalizedEmail = userEmail.toLowerCase().trim();

  const allowedEmail = await prisma.couponAllowedEmail.findFirst({
    where: {
      couponId,
      email: normalizedEmail,
    },
  });

  return !!allowedEmail;
}

function checkApplicability(
  coupon: {
    applicableTo: string;
    applicablePlanIds: string[];
  },
  plan: SubscriptionPlan,
  userRole?: UserRole
): boolean {
  switch (coupon.applicableTo) {
    case 'ALL':
      return true;

    case 'FAMILIES':
      // Family plans or FAMILY role
      if (userRole === 'FAMILY') return true;
      return plan === 'FAMILY_FREE' || plan === 'FAMILY_PLUS';

    case 'NANNIES':
      // Nanny plans or NANNY role
      if (userRole === 'NANNY') return true;
      return plan === 'NANNY_FREE' || plan === 'NANNY_PRO';

    case 'SPECIFIC_PLAN':
      return coupon.applicablePlanIds.includes(plan);

    default:
      return false;
  }
}

export function calculateDiscount(
  discountType: string,
  discountValue: number,
  purchaseAmount: number,
  maxDiscount?: number | null
): number {
  let discount = 0;

  if (discountType === 'PERCENTAGE') {
    discount = (purchaseAmount * discountValue) / 100;
    if (maxDiscount !== null && maxDiscount !== undefined && discount > maxDiscount) {
      discount = maxDiscount;
    }
  } else {
    // FIXED
    discount = discountValue;
  }

  // Desconto não pode ser maior que o valor da compra
  return Math.min(discount, purchaseAmount);
}

export async function applyCoupon(
  couponId: string,
  authId: string,
  subscriptionId: string,
  discountAmount: number
): Promise<void> {
  // Find the nanny or family by authId
  const nanny = await prisma.nanny.findUnique({
    where: { authId },
    select: { id: true },
  });

  const family = nanny ? null : await prisma.family.findUnique({
    where: { authId },
    select: { id: true },
  });

  await prisma.$transaction([
    // Create usage record
    prisma.couponUsage.create({
      data: {
        couponId,
        nannyId: nanny?.id,
        familyId: family?.id,
        subscriptionId,
        discountAmount,
      },
    }),
    // Increment usage counter
    prisma.coupon.update({
      where: { id: couponId },
      data: { usageCount: { increment: 1 } },
    }),
  ]);
}
