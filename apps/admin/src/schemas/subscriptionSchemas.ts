import { BillingInterval, CommonStatus, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export interface SubscriptionListItem {
  id: string;
  nannyId: number | null;
  familyId: number | null;
  // Nanny info (if applicable)
  nannyName: string | null;
  nannySlug: string | null;
  nannyEmail: string | null;
  nannyPhone: string | null;
  nannyStatus: CommonStatus | null;
  // Family info (if applicable)
  familyName: string | null;
  familyEmail: string | null;
  familyPhone: string | null;
  familyStatus: CommonStatus | null;
  // Subscription info
  plan: SubscriptionPlan;
  billingInterval: BillingInterval | null;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
}

// Legacy types for backwards compatibility
export type FamilySubscriptionListItem = SubscriptionListItem;
export type NannySubscriptionListItem = SubscriptionListItem;
