/**
 * Cron Job: Expire Trials
 * GET /api/cron/expire-trials
 *
 * Runs daily to handle expired trial subscriptions
 * For trials that expire, the ASAAS gateway will automatically charge the card.
 * This cron job serves as a backup to:
 * 1. Log any trials that should have converted but didn't
 * 2. Mark trials as EXPIRED if they fail to convert after grace period
 *
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCronAuth } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max 60 seconds for cron job

interface ExpiredTrialResult {
  subscriptionId: string;
  userId: string;
  userType: 'nanny' | 'family';
  plan: string;
  trialEndDate: Date;
  action: 'expired' | 'grace_period' | 'waiting_payment';
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação com comparação timing-safe
    const auth = verifyCronAuth(request);
    if (!auth.isAuthorized) {
      return auth.errorResponse;
    }

    console.log('[CRON] Starting trial expiration check...');

    const now = new Date();
    const gracePeriodDays = 3; // 3 days grace period after trial ends
    const gracePeriodDate = new Date(now);
    gracePeriodDate.setDate(gracePeriodDate.getDate() - gracePeriodDays);

    // Find all subscriptions in TRIALING status with expired trial
    const expiredTrials = await prisma.subscription.findMany({
      where: {
        status: 'TRIALING',
        trialEndDate: {
          lt: now, // Trial has ended
        },
      },
      include: {
        nanny: {
          select: { id: true, name: true, emailAddress: true },
        },
        family: {
          select: { id: true, name: true, emailAddress: true },
        },
      },
    });

    console.log(`[CRON] Found ${expiredTrials.length} expired trials`);

    const results: ExpiredTrialResult[] = [];

    for (const subscription of expiredTrials) {
      const userType = subscription.nannyId ? 'nanny' : 'family';
      const userId = subscription.nannyId?.toString() ?? subscription.familyId?.toString() ?? '';
      const trialEndDate = subscription.trialEndDate!;
      const hasPaymentGateway = !!subscription.externalSubscriptionId;

      if (!hasPaymentGateway) {
        // Cardless trial (no Asaas subscription) - downgrade to free plan
        const freePlan = subscription.nannyId ? 'NANNY_FREE' : 'FAMILY_FREE';
        const farFuture = new Date();
        farFuture.setFullYear(farFuture.getFullYear() + 100);

        console.log(`[CRON] Cardless trial ${subscription.id} expired, downgrading to ${freePlan}`);

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            plan: freePlan,
            status: 'ACTIVE',
            trialEndDate: null,
            currentPeriodEnd: farFuture,
            paymentGateway: 'MANUAL',
          },
        });

        results.push({
          subscriptionId: subscription.id,
          userId,
          userType,
          plan: subscription.plan,
          trialEndDate,
          action: 'expired',
        });

        continue;
      }

      // Trial with Asaas subscription - check grace period
      const isPastGracePeriod = trialEndDate < gracePeriodDate;

      if (isPastGracePeriod) {
        // Trial is past grace period - mark as EXPIRED
        // This means the payment failed or was never processed
        console.log(`[CRON] Trial ${subscription.id} past grace period, marking as EXPIRED`);

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'EXPIRED' },
        });

        results.push({
          subscriptionId: subscription.id,
          userId,
          userType,
          plan: subscription.plan,
          trialEndDate,
          action: 'expired',
        });

        // TODO: Send notification email to user about expired trial
      } else {
        // Trial just ended - ASAAS should process payment automatically
        // Just log it for now, webhook will update status when payment is confirmed
        console.log(`[CRON] Trial ${subscription.id} ended, waiting for payment processing`);

        results.push({
          subscriptionId: subscription.id,
          userId,
          userType,
          plan: subscription.plan,
          trialEndDate,
          action: 'waiting_payment',
        });
      }
    }

    const stats = {
      totalExpiredTrials: expiredTrials.length,
      markedAsExpired: results.filter(r => r.action === 'expired').length,
      waitingPayment: results.filter(r => r.action === 'waiting_payment').length,
    };

    console.log('[CRON] Trial expiration check complete:', stats);

    return NextResponse.json({
      success: true,
      stats,
      results,
      message: `Processed ${expiredTrials.length} expired trials`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error processing expired trials:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process expired trials',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
