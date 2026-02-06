import prisma from '@/lib/prisma';
import { SubscriptionPlan } from '@prisma/client';

// Re-export pure functions and types from core
export {
  PLAN_FEATURES,
  getPlanFeaturesConfig,
  getPlanTier,
  getReviewLimit,
  getJobLimit,
  getMaxConversations,
  getJobExpirationDays,
  hasMatchingFeature,
  hasUnlimitedMessaging as hasUnlimitedMessagingFeature,
  getPlanDisplayName,
  getBillingIntervalDisplayName,
  isFamilyPlan,
  isNannyPlan,
  type SubscriptionPlanFeatures,
} from '@cuidly/core/subscriptions';

import {
  PLAN_FEATURES,
  isFamilyPlan,
  isNannyPlan,
  getJobExpirationDays,
  getMaxConversations,
  type SubscriptionPlanFeatures,
} from '@cuidly/core/subscriptions';

/**
 * Subscription lookup params - use either nannyId or familyId
 */
export type SubscriptionLookup = {
  nannyId?: number;
  familyId?: number;
};

/**
 * Helper to check if subscription status is considered active
 * ACTIVE and TRIALING are both considered active (user has full access)
 */
function isActiveStatus(status: string | null | undefined): boolean {
  return status === 'ACTIVE' || status === 'TRIALING';
}

export async function hasActiveSubscription(lookup: SubscriptionLookup): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        lookup.nannyId ? { nannyId: lookup.nannyId } : {},
        lookup.familyId ? { familyId: lookup.familyId } : {},
      ].filter(o => Object.keys(o).length > 0),
    },
  });

  // Verifica se tem assinatura paga ativa (ACTIVE ou TRIALING com plano pago)
  return (
    (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING') &&
    (subscription?.plan === 'NANNY_PRO' || subscription?.plan === 'FAMILY_PLUS')
  );
}

export async function getSubscription(lookup: SubscriptionLookup) {
  return await prisma.subscription.findFirst({
    where: {
      OR: [
        lookup.nannyId ? { nannyId: lookup.nannyId } : {},
        lookup.familyId ? { familyId: lookup.familyId } : {},
      ].filter(o => Object.keys(o).length > 0),
    },
  });
}

/**
 * Retorna a subscription do usuario
 * Nota: O campo 'plan' e um enum (SubscriptionPlan), nao uma relacao
 */
export async function getSubscriptionWithPlan(lookup: SubscriptionLookup) {
  return await getSubscription(lookup);
}

// Note: PLAN_FEATURES, getPlanTier, isFamilyPlan, isNannyPlan are now imported from @cuidly/core/subscriptions

/**
 * Returns plan features for a user (async version that looks up subscription)
 * TRIALING subscriptions get full plan features (same as ACTIVE)
 */
export async function getPlanFeatures(lookup: SubscriptionLookup): Promise<SubscriptionPlanFeatures | null> {
  const subscription = await getSubscription(lookup);

  if (!subscription || (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING')) {
    return null;
  }

  return PLAN_FEATURES[subscription.plan] || null;
}

// Note: getReviewLimit and getJobLimit are now imported from @cuidly/core/subscriptions
// Import them locally for use in async functions below
import { getReviewLimit, getJobLimit } from '@cuidly/core/subscriptions';

/**
 * Check if user can see unlimited reviews
 */
export async function canSeeReviews(lookup: SubscriptionLookup): Promise<boolean> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    return false;
  }

  const features = PLAN_FEATURES[subscription.plan];
  // Can see reviews if limit is not 0
  return (features?.seeReviews ?? 0) !== 0;
}

/**
 * Get review limit for a user
 */
export async function getUserReviewLimit(lookup: SubscriptionLookup): Promise<number> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    return 0;
  }

  return getReviewLimit(subscription.plan);
}

/**
 * Check if user can favorite nannies
 * Now available for both FREE and PLUS family plans
 */
export async function canFavorite(lookup: SubscriptionLookup): Promise<boolean> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    return false;
  }

  const features = PLAN_FEATURES[subscription.plan];
  return features?.favorite === true;
}

/**
 * Check if nanny can apply to jobs
 */
export async function canApplyToJobs(lookup: SubscriptionLookup): Promise<boolean> {
  const features = await getPlanFeatures(lookup);
  return features?.applyToJobs === true;
}

/**
 * Check if user has access to smart matching
 */
export async function hasMatching(lookup: SubscriptionLookup): Promise<boolean> {
  const features = await getPlanFeatures(lookup);
  return features?.matching === true || features?.priorityMatching === true;
}

/**
 * Check if family can create jobs
 */
export async function canCreateJob(lookup: SubscriptionLookup): Promise<boolean> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    return false;
  }

  // Both FAMILY_FREE and FAMILY_PLUS can create jobs (with different limits)
  return subscription.plan === 'FAMILY_FREE' || subscription.plan === 'FAMILY_PLUS';
}

/**
 * Get user's job creation limit
 */
export async function getUserJobLimit(lookup: SubscriptionLookup): Promise<number> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    return 0;
  }

  return getJobLimit(subscription.plan);
}

/**
 * Check if family can start conversations with nannies (chat)
 */
export async function canContactNanny(lookup: SubscriptionLookup): Promise<boolean> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    return false;
  }

  // Only FAMILY_PLUS can start conversations
  return subscription.plan === 'FAMILY_PLUS';
}

/**
 * Check if nanny has Pro subscription
 */
export async function hasNannyPremium(lookup: SubscriptionLookup): Promise<boolean> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    return false;
  }

  return subscription.plan === 'NANNY_PRO';
}

/**
 * Get profile view limit for user
 * @returns -1 for unlimited, or the number limit
 */
export async function getProfileViewLimit(lookup: SubscriptionLookup): Promise<number> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    // No subscription = no access (should create FAMILY_FREE subscription on signup)
    return 0;
  }

  const features = PLAN_FEATURES[subscription.plan];
  return features?.viewProfiles ?? 0;
}

/**
 * Count unique profiles a user has viewed
 */
export async function getProfileViewCount(lookup: SubscriptionLookup): Promise<number> {
  return await prisma.userProfileView.count({
    where: {
      OR: [
        lookup.nannyId ? { visitorNannyId: lookup.nannyId } : {},
        lookup.familyId ? { visitorFamilyId: lookup.familyId } : {},
      ].filter(o => Object.keys(o).length > 0),
    },
  });
}

/**
 * Check if user can view a specific profile
 * @returns { canView: boolean, reason?: string, viewsUsed: number, viewLimit: number }
 */
export async function canViewProfile(
  lookup: SubscriptionLookup,
  nannyId: number
): Promise<{
  canView: boolean;
  reason?: string;
  viewsUsed: number;
  viewLimit: number;
  alreadyViewed: boolean;
}> {
  const viewLimit = await getProfileViewLimit(lookup);

  // Unlimited plan
  if (viewLimit === -1) {
    return {
      canView: true,
      viewsUsed: 0,
      viewLimit: -1,
      alreadyViewed: false,
    };
  }

  // Check if already viewed this profile
  const existingView = await prisma.userProfileView.findFirst({
    where: {
      nannyId,
      OR: [
        lookup.nannyId ? { visitorNannyId: lookup.nannyId } : {},
        lookup.familyId ? { visitorFamilyId: lookup.familyId } : {},
      ].filter(o => Object.keys(o).length > 0),
    },
  });

  if (existingView) {
    // Already viewed, can view again without counting
    const viewsUsed = await getProfileViewCount(lookup);
    return {
      canView: true,
      viewsUsed,
      viewLimit,
      alreadyViewed: true,
    };
  }

  // Check if still has views available
  const viewsUsed = await getProfileViewCount(lookup);

  if (viewsUsed >= viewLimit) {
    return {
      canView: false,
      reason: `Você atingiu o limite de ${viewLimit} perfis. Assine o plano Plus para acesso ilimitado.`,
      viewsUsed,
      viewLimit,
      alreadyViewed: false,
    };
  }

  return {
    canView: true,
    viewsUsed,
    viewLimit,
    alreadyViewed: false,
  };
}

/**
 * Register a profile view
 * @returns true if new view registered, false if already existed
 */
export async function registerProfileView(
  lookup: SubscriptionLookup,
  nannyId: number
): Promise<boolean> {
  try {
    await prisma.userProfileView.create({
      data: {
        nannyId,
        visitorNannyId: lookup.nannyId,
        visitorFamilyId: lookup.familyId,
        viewerType: 'LOGGED_IN_FREE',
      },
    });
    return true;
  } catch {
    // Unique constraint violation - already exists
    return false;
  }
}

/**
 * Get profile view usage info for user
 */
export async function getProfileViewUsage(lookup: SubscriptionLookup): Promise<{
  viewsUsed: number;
  viewLimit: number;
  remainingViews: number;
  isUnlimited: boolean;
}> {
  const viewLimit = await getProfileViewLimit(lookup);
  const viewsUsed = await getProfileViewCount(lookup);

  return {
    viewsUsed,
    viewLimit,
    remainingViews: viewLimit === -1 ? -1 : Math.max(0, viewLimit - viewsUsed),
    isUnlimited: viewLimit === -1,
  };
}

/**
 * Check if user can use a boost (job or profile)
 * For families: 1 boost per billing cycle
 * For nannies: 1 boost per week
 */
export async function canUseBoost(lookup: SubscriptionLookup): Promise<{
  canUse: boolean;
  reason?: string;
  nextAvailable?: Date;
}> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    return { canUse: false, reason: 'Assinatura inativa' };
  }

  const features = PLAN_FEATURES[subscription.plan];

  // Check if plan includes boosts
  if (isFamilyPlan(subscription.plan)) {
    if (!features?.boostPerCycle) {
      return { canUse: false, reason: 'Seu plano não inclui boosts' };
    }

    if (!lookup.familyId) {
      return { canUse: false, reason: 'Usuário não é uma família' };
    }

    const boostCount = await prisma.boost.count({
      where: {
        job: { familyId: lookup.familyId },
        type: 'JOB',
        createdAt: { gte: subscription.currentPeriodStart },
      },
    });

    if (boostCount >= features.boostPerCycle) {
      return {
        canUse: false,
        reason: 'Você já usou seu boost neste ciclo de cobrança',
        nextAvailable: subscription.currentPeriodEnd,
      };
    }

    return { canUse: true };
  }

  if (isNannyPlan(subscription.plan)) {
    if (!features?.weeklyBoost) {
      return { canUse: false, reason: 'Seu plano não inclui boosts' };
    }

    if (!lookup.nannyId) {
      return { canUse: false, reason: 'Usuário não é uma babá' };
    }

    // Check if used in last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentBoost = await prisma.boost.findFirst({
      where: {
        nannyId: lookup.nannyId,
        type: 'NANNY_PROFILE',
        createdAt: { gte: oneWeekAgo },
      },
    });

    if (recentBoost) {
      const nextAvailable = new Date(recentBoost.createdAt);
      nextAvailable.setDate(nextAvailable.getDate() + 7);
      return {
        canUse: false,
        reason: 'Você já usou seu boost esta semana',
        nextAvailable,
      };
    }

    return { canUse: true };
  }

  return { canUse: false, reason: 'Plano inválido' };
}

// Note: getPlanDisplayName, getBillingIntervalDisplayName, getMaxConversations
// are now imported from @cuidly/core/subscriptions

// ============================================
// CONVERSATION LIMITS (Family Free Plan)
// ============================================

/**
 * @deprecated Use getMaxConversations instead - limit is now total, not per job
 */
export function getMaxConversationsPerJob(plan: SubscriptionPlan): number {
  return getMaxConversations(plan);
}

/**
 * Count total conversations a family has started (as initiator)
 */
export async function getTotalConversationCount(lookup: SubscriptionLookup): Promise<number> {
  const count = await prisma.conversation.count({
    where: {
      participants: {
        some: {
          OR: [
            lookup.nannyId ? { nannyId: lookup.nannyId } : {},
            lookup.familyId ? { familyId: lookup.familyId } : {},
          ].filter(o => Object.keys(o).length > 0),
        },
      },
    },
  });
  return count;
}

/**
 * @deprecated Use getTotalConversationCount instead
 */
export async function getConversationCountForJob(jobId: number): Promise<number> {
  const count = await prisma.conversation.count({
    where: { jobId },
  });
  return count;
}

/**
 * Check if family can start a new conversation
 * Family Free: max 3 total conversations
 * Family Plus: unlimited
 */
export async function canStartConversation(
  lookup: SubscriptionLookup,
  recipientLookup: SubscriptionLookup
): Promise<{
  canStart: boolean;
  reason?: string;
  conversationsUsed: number;
  conversationLimit: number;
  code?: string;
}> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    return {
      canStart: false,
      reason: 'Assinatura inativa',
      conversationsUsed: 0,
      conversationLimit: 0,
      code: 'NO_SUBSCRIPTION',
    };
  }

  const conversationLimit = getMaxConversations(subscription.plan);

  // Unlimited conversations (paid plan)
  if (conversationLimit === -1) {
    return {
      canStart: true,
      conversationsUsed: 0,
      conversationLimit: -1,
    };
  }

  // Check if conversation already exists between these users
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        {
          participants: {
            some: {
              OR: [
                lookup.nannyId ? { nannyId: lookup.nannyId } : {},
                lookup.familyId ? { familyId: lookup.familyId } : {},
              ].filter(o => Object.keys(o).length > 0),
            },
          },
        },
        {
          participants: {
            some: {
              OR: [
                recipientLookup.nannyId ? { nannyId: recipientLookup.nannyId } : {},
                recipientLookup.familyId ? { familyId: recipientLookup.familyId } : {},
              ].filter(o => Object.keys(o).length > 0),
            },
          },
        },
      ],
    },
  });

  const conversationsUsed = await getTotalConversationCount(lookup);

  if (existingConversation) {
    // Conversation already exists, allow continuing it
    return {
      canStart: true,
      conversationsUsed,
      conversationLimit,
    };
  }

  // Check current count for new conversation
  if (conversationsUsed >= conversationLimit) {
    return {
      canStart: false,
      reason: `Você atingiu o limite de ${conversationLimit} conversas. Assine o Plus para contato ilimitado.`,
      conversationsUsed,
      conversationLimit,
      code: 'CONVERSATION_LIMIT_REACHED',
    };
  }

  return {
    canStart: true,
    conversationsUsed,
    conversationLimit,
  };
}

/**
 * @deprecated Use canStartConversation instead - jobId is no longer required
 */
export async function canStartConversationForJob(
  lookup: SubscriptionLookup,
  jobId: number,
  recipientLookup: SubscriptionLookup
): Promise<{
  canStart: boolean;
  reason?: string;
  conversationsUsed: number;
  conversationLimit: number;
  code?: string;
}> {
  // Delegate to new function, ignoring jobId
  return canStartConversation(lookup, recipientLookup);
}

// ============================================
// JOB EXPIRATION (Family Free Plan)
// ============================================

// Note: getJobExpirationDays is now imported from @cuidly/core/subscriptions

/**
 * Check if a job is expired based on user's plan
 * Family Free: expires 7 days after creation
 * Family Plus: never expires
 */
export async function isJobExpired(
  lookup: SubscriptionLookup,
  jobId: number
): Promise<{
  isExpired: boolean;
  reason?: string;
  expiresAt?: Date;
  daysRemaining?: number;
}> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    return { isExpired: false }; // Let other checks handle inactive subscription
  }

  const expirationDays = getJobExpirationDays(subscription.plan);

  // Never expires
  if (expirationDays === -1) {
    return { isExpired: false };
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { createdAt: true, status: true },
  });

  if (!job) {
    return { isExpired: false };
  }

  const expiresAt = new Date(job.createdAt);
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  const now = new Date();
  const isExpired = now >= expiresAt;
  const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  if (isExpired) {
    return {
      isExpired: true,
      reason: `Esta vaga expirou. Vagas do plano gratuito duram ${expirationDays} dias. Assine o Plus para vagas sem expiração.`,
      expiresAt,
      daysRemaining: 0,
    };
  }

  return {
    isExpired: false,
    expiresAt,
    daysRemaining,
  };
}

/**
 * Get job expiration info for UI display
 */
export async function getJobExpirationInfo(
  lookup: SubscriptionLookup,
  jobId: number
): Promise<{
  expires: boolean;
  expiresAt?: Date;
  daysRemaining?: number;
  isExpired: boolean;
}> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    return { expires: false, isExpired: false };
  }

  const expirationDays = getJobExpirationDays(subscription.plan);

  if (expirationDays === -1) {
    return { expires: false, isExpired: false };
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { createdAt: true },
  });

  if (!job) {
    return { expires: false, isExpired: false };
  }

  const expiresAt = new Date(job.createdAt);
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  const now = new Date();
  const isExpired = now >= expiresAt;
  const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    expires: true,
    expiresAt,
    daysRemaining,
    isExpired,
  };
}

// ============================================
// NANNY MESSAGING LIMITS (Nanny Free Plan)
// ============================================

/**
 * Check if nanny has unlimited messaging (Pro plan)
 */
export async function hasUnlimitedMessaging(lookup: SubscriptionLookup): Promise<boolean> {
  const features = await getPlanFeatures(lookup);
  return features?.unlimitedMessaging === true;
}

/**
 * Check if nanny can send a message in a conversation
 * Nanny Free: Can send 1 message with application, then only reply to family messages
 * Nanny Pro: Can send messages freely
 */
export async function canNannySendMessage(
  lookup: SubscriptionLookup,
  conversationId: string
): Promise<{
  canSend: boolean;
  reason?: string;
  code?: string;
}> {
  const subscription = await getSubscription(lookup);

  if (!subscription || !isActiveStatus(subscription.status)) {
    return {
      canSend: false,
      reason: 'Assinatura inativa',
      code: 'NO_SUBSCRIPTION',
    };
  }

  // Pro plan - unlimited messaging
  if (subscription.plan === 'NANNY_PRO') {
    return { canSend: true };
  }

  // Nanny Free plan - check messaging rules
  if (subscription.plan !== 'NANNY_FREE') {
    return { canSend: true }; // Not a nanny plan, allow
  }

  if (!lookup.nannyId) {
    return { canSend: false, reason: 'Usuario nao e uma baba', code: 'NOT_NANNY' };
  }

  // Contar mensagens da babá nesta conversa (usa index em senderNannyId)
  const nannyMessageCount = await prisma.message.count({
    where: {
      conversationId,
      senderNannyId: lookup.nannyId,
      deletedAt: null,
    },
  });

  // Se a babá ainda não enviou nenhuma mensagem, permite a primeira
  if (nannyMessageCount === 0) {
    return { canSend: true };
  }

  // Verificar quem iniciou a conversa (quem enviou a primeira mensagem)
  const firstMessage = await prisma.message.findFirst({
    where: {
      conversationId,
      deletedAt: null,
    },
    orderBy: { seq: 'asc' },
    select: { senderFamilyId: true },
  });

  // Se a família enviou a primeira mensagem, ela iniciou a conversa
  // Nesse caso, a babá pode responder livremente (sem limite)
  if (firstMessage?.senderFamilyId) {
    return { canSend: true };
  }

  // A babá iniciou a conversa (caso futuro para plano Pro) - aplicar regra de "aguardar resposta"
  // Buscar a última mensagem da babá (usa index em [conversationId, seq])
  const lastNannyMessage = await prisma.message.findFirst({
    where: {
      conversationId,
      senderNannyId: lookup.nannyId,
      deletedAt: null,
    },
    orderBy: { seq: 'desc' },
    select: { seq: true },
  });

  if (!lastNannyMessage) {
    return { canSend: true }; // Fallback - não deveria acontecer
  }

  // Verificar se a família respondeu após a última mensagem da babá
  const familyResponseCount = await prisma.message.count({
    where: {
      conversationId,
      senderFamilyId: { not: null }, // Mensagem da família
      seq: { gt: lastNannyMessage.seq }, // Após a última da babá
      deletedAt: null,
    },
  });

  if (familyResponseCount > 0) {
    // Família respondeu, babá pode responder
    return { canSend: true };
  }

  // Babá enviou mensagem mas família ainda não respondeu
  return {
    canSend: false,
    reason: 'Aguarde a familia responder para enviar outra mensagem. Assine o Pro para mensagens ilimitadas.',
    code: 'WAITING_FAMILY_RESPONSE',
  };
}

// ============================================
// HELPER: Create free subscription on signup
// ============================================

/**
 * Create a free subscription for a new user
 */
export async function createFreeSubscription(lookup: SubscriptionLookup): Promise<void> {
  const now = new Date();
  const oneYearFromNow = new Date(now);
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 100); // Free plans don't expire

  const plan = lookup.nannyId ? 'NANNY_FREE' : 'FAMILY_FREE';

  await prisma.subscription.create({
    data: {
      nannyId: lookup.nannyId,
      familyId: lookup.familyId,
      plan,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: oneYearFromNow,
      paymentGateway: 'MANUAL',
    },
  });
}
