/**
 * Cron Job: Publish Reviews
 * GET /api/cron/publish-reviews
 *
 * Runs daily to:
 * 1. Send reminders for contacts that are 7 days old (users have 7 days left to review)
 * 2. Publish reviews that are older than 14 days
 *
 * This follows the Airbnb-style review system where reviews become public
 * after 14 days even if only one party has reviewed.
 *
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { notifyReviewPublished, notifyReviewReminder } from '@/lib/notifications/review-notifications';
import { verifyCronAuth } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação com comparação timing-safe
    const auth = verifyCronAuth(request);
    if (!auth.isAuthorized) {
      return auth.errorResponse;
    }

    console.log('[CRON] Starting review cron job...');

    // ===== STEP 1: Send reminders for 7-day old conversations =====
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStart = new Date(sevenDaysAgo);
    sevenDaysAgoStart.setHours(0, 0, 0, 0);
    const sevenDaysAgoEnd = new Date(sevenDaysAgo);
    sevenDaysAgoEnd.setHours(23, 59, 59, 999);

    // Find conversations that started 7 days ago (users have 7 more days to review)
    const conversationsForReminder = await prisma.conversation.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgoStart,
          lte: sevenDaysAgoEnd,
        },
      },
      select: {
        id: true,
      },
    });

    console.log(`[CRON] Found ${conversationsForReminder.length} conversations for 7-day reminder`);

    let remindersSent = 0;
    for (const conversation of conversationsForReminder) {
      try {
        await notifyReviewReminder(conversation.id);
        remindersSent++;
      } catch (reminderError) {
        console.error(`[CRON] Error sending reminder for conversation ${conversation.id}:`, reminderError);
      }
    }

    console.log(`[CRON] Sent ${remindersSent} reminders`);

    // ===== STEP 2: Publish reviews older than 14 days =====
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const unpublishedReviews = await prisma.review.findMany({
      where: {
        isPublished: false,
        createdAt: { lte: fourteenDaysAgo },
      },
      select: {
        id: true,
        familyId: true,
        nannyId: true,
        type: true,
        createdAt: true,
      },
    });

    console.log(`[CRON] Found ${unpublishedReviews.length} reviews to publish`);

    let publishedCount = 0;
    let notificationsSent = 0;

    if (unpublishedReviews.length > 0) {
      // Publish all reviews
      const result = await prisma.review.updateMany({
        where: {
          id: { in: unpublishedReviews.map(r => r.id) },
        },
        data: {
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      publishedCount = result.count;
      console.log(`[CRON] Published ${publishedCount} reviews`);

      // Send notifications for each published review
      for (const review of unpublishedReviews) {
        try {
          await notifyReviewPublished(review.id);
          notificationsSent++;
        } catch (notifyError) {
          console.error(`[CRON] Error sending notification for review ${review.id}:`, notifyError);
        }
      }

      console.log(`[CRON] Sent ${notificationsSent} publication notifications`);
    }

    return NextResponse.json({
      success: true,
      reminders: {
        conversationsChecked: conversationsForReminder.length,
        remindersSent,
      },
      publications: {
        published: publishedCount,
        notificationsSent,
        reviewIds: unpublishedReviews.map(r => r.id),
      },
      message: `Sent ${remindersSent} reminders, published ${publishedCount} reviews`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('[CRON] Error in review cron job:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to run review cron job';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
