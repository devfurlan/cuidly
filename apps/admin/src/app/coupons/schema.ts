export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscount: number | null;
  minPurchaseAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  applicableTo: 'ALL' | 'FAMILIES' | 'NANNIES' | 'SPECIFIC_PLAN';
  applicablePlanIds: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  _count?: {
    usages: number;
  };
};

export type CouponStatus = 'active' | 'inactive' | 'expired' | 'scheduled';

export function getCouponStatus(coupon: Coupon): CouponStatus {
  const now = new Date();

  if (!coupon.isActive) {
    return 'inactive';
  }

  if (new Date(coupon.endDate) < now) {
    return 'expired';
  }

  if (new Date(coupon.startDate) > now) {
    return 'scheduled';
  }

  return 'active';
}
