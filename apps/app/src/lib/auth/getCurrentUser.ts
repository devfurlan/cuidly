import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import type { Nanny, Family, Subscription } from '@prisma/client';

export type NannyWithSubscription = Nanny & { subscription: Subscription | null };
export type FamilyWithSubscription = Family & { subscription: Subscription | null };

export type CurrentUser =
  | { type: 'nanny'; nanny: NannyWithSubscription; authId: string }
  | { type: 'family'; family: FamilyWithSubscription; authId: string }
  | null;

export type CurrentUserOrUntyped =
  | { type: 'nanny'; nanny: NannyWithSubscription; authId: string }
  | { type: 'family'; family: FamilyWithSubscription; authId: string }
  | { type: 'untyped'; authId: string }
  | null;

export type CurrentUserType = 'nanny' | 'family';

/**
 * Gets the current authenticated user from the database.
 * Returns either a Nanny or Family based on which table has the authId.
 * Returns null if not authenticated OR if no Nanny/Family record exists.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Try to find as Nanny
  const nanny = await prisma.nanny.findUnique({
    where: { authId: user.id },
    include: { subscription: true },
  });
  if (nanny && nanny.status !== 'DELETED') return { type: 'nanny', nanny, authId: user.id };

  // Try to find as Family
  const family = await prisma.family.findUnique({
    where: { authId: user.id },
    include: { subscription: true },
  });
  if (family && family.status !== 'DELETED') return { type: 'family', family, authId: user.id };

  return null;
}

/**
 * Gets the current user, distinguishing between unauthenticated (null)
 * and authenticated-but-no-record ('untyped').
 * Use this only in routes that need to handle untyped users (e.g., /api/user/me, /api/auth/me).
 */
export async function getCurrentUserOrUntyped(): Promise<CurrentUserOrUntyped> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Try to find as Nanny
  const nanny = await prisma.nanny.findUnique({
    where: { authId: user.id },
    include: { subscription: true },
  });
  if (nanny && nanny.status !== 'DELETED') return { type: 'nanny', nanny, authId: user.id };

  // Try to find as Family
  const family = await prisma.family.findUnique({
    where: { authId: user.id },
    include: { subscription: true },
  });
  if (family && family.status !== 'DELETED') return { type: 'family', family, authId: user.id };

  // Authenticated but no record yet
  return { type: 'untyped', authId: user.id };
}

/**
 * Gets subscription lookup params based on current user type.
 * Use this to pass to subscription service functions.
 */
export function getSubscriptionParams(
  user: CurrentUser
): { nannyId?: number; familyId?: number } {
  if (!user) return {};
  if (user.type === 'nanny') return { nannyId: user.nanny.id };
  return { familyId: user.family.id };
}

/**
 * Gets the ID for the current user (nannyId or familyId).
 */
export function getCurrentEntityId(user: CurrentUser): number | null {
  if (!user) return null;
  if (user.type === 'nanny') return user.nanny.id;
  return user.family.id;
}

/**
 * Gets the name for the current user.
 */
export function getCurrentUserName(user: CurrentUser): string | null {
  if (!user) return null;
  if (user.type === 'nanny') return user.nanny.name;
  return user.family.name;
}

/**
 * Gets the email for the current user.
 */
export function getCurrentUserEmail(user: CurrentUser): string | null {
  if (!user) return null;
  if (user.type === 'nanny') return user.nanny.emailAddress;
  return user.family.emailAddress;
}

/**
 * Gets the photo URL for the current user.
 */
export function getCurrentUserPhoto(user: CurrentUser): string | null {
  if (!user) return null;
  if (user.type === 'nanny') return user.nanny.photoUrl;
  return user.family.photoUrl;
}

/**
 * Check if user has completed onboarding.
 */
export function hasCompletedOnboarding(user: CurrentUser): boolean {
  if (!user) return false;
  if (user.type === 'nanny') return user.nanny.onboardingCompleted;
  return user.family.onboardingCompleted;
}

/**
 * Check if user has an active PRO subscription (not free plan).
 * Both ACTIVE and TRIALING subscriptions are considered active.
 */
export function hasActiveSubscription(user: CurrentUser): boolean {
  if (!user) return false;
  const subscription =
    user.type === 'nanny' ? user.nanny.subscription : user.family.subscription;
  if (subscription?.status !== 'ACTIVE' && subscription?.status !== 'TRIALING') return false;
  // Verificar se é plano pago (Pro/Plus), não free
  return subscription.plan === 'NANNY_PRO' || subscription.plan === 'FAMILY_PLUS';
}

/**
 * Get the subscription plan for the current user.
 */
export function getSubscriptionPlan(user: CurrentUser): string | null {
  if (!user) return null;
  const subscription =
    user.type === 'nanny' ? user.nanny.subscription : user.family.subscription;
  return subscription?.plan || null;
}
