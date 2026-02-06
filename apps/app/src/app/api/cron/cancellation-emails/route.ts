/**
 * Cron Job: Cancellation Emails
 * GET /api/cron/cancellation-emails
 *
 * Runs daily to send scheduled cancellation reminder emails:
 * - 5 days before: Reminder email
 * - 1 day before: Urgency email
 * - On cancellation day: Canceled + win-back email with coupon (if coupon is active)
 *
 * Win-back coupons must be created in admin with codes:
 * - VOLTE-FAMILIA (for families)
 * - VOLTE-BABA (for nannies)
 *
 * This endpoint should be called by Vercel Cron at 10:00 BRT (13:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCronAuth } from '@/lib/cron-auth';
import { sendEmail } from '@/lib/email/sendEmail';
import {
  getReminder5DaysEmailTemplate,
  getReminder1DayEmailTemplate,
  getCanceledWithWinbackEmailTemplate,
  getCanceledEmailTemplate,
} from '@/lib/email/react-templates';
import { CancellationEmailType } from '@prisma/client';
import { config } from '@/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Max 2 minutes for cron job

interface EmailResult {
  subscriptionId: string;
  userEmail: string;
  userName: string;
  emailType: CancellationEmailType;
  success: boolean;
  error?: string;
}

interface WinbackCouponInfo {
  code: string;
  discountPercent: number;
  expirationDate: string;
}

/**
 * Gets the win-back coupon for a user type and adds the user to allowed emails
 * Returns null if the coupon doesn't exist or is inactive
 */
async function getWinbackCoupon(
  userType: 'nanny' | 'family',
  userEmail: string,
  nannyId?: number | null,
  familyId?: number | null
): Promise<WinbackCouponInfo | null> {
  const couponCode = userType === 'nanny'
    ? config.winback.nannyCouponCode
    : config.winback.familyCouponCode;

  // Find the coupon
  const coupon = await prisma.coupon.findUnique({
    where: { code: couponCode },
  });

  // If coupon doesn't exist or is inactive, return null
  if (!coupon || !coupon.isActive) {
    console.log(`[CRON] Win-back coupon ${couponCode} not found or inactive`);
    return null;
  }

  // Check if coupon is within valid date range
  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    console.log(`[CRON] Win-back coupon ${couponCode} is outside valid date range`);
    return null;
  }

  // Check if user already has access to this coupon
  const existingAccess = await prisma.couponAllowedEmail.findUnique({
    where: {
      couponId_email: {
        couponId: coupon.id,
        email: userEmail,
      },
    },
  });

  // If user doesn't have access yet, add them
  if (!existingAccess) {
    await prisma.couponAllowedEmail.create({
      data: {
        couponId: coupon.id,
        email: userEmail,
        nannyId: nannyId ?? undefined,
        familyId: familyId ?? undefined,
      },
    });
    console.log(`[CRON] Added ${userEmail} to allowed users for coupon ${couponCode}`);
  }

  // Calculate discount display
  const discountPercent = coupon.discountType === 'PERCENTAGE'
    ? coupon.discountValue
    : 0; // For fixed discount, we'd handle differently

  return {
    code: coupon.code,
    discountPercent,
    expirationDate: formatDatePtBr(coupon.endDate),
  };
}

/**
 * Formats a date for display in Portuguese
 */
function formatDatePtBr(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Gets the plan display name
 */
function getPlanDisplayName(plan: string): string {
  const planNames: Record<string, string> = {
    FAMILY_PLUS: 'Cuidly Plus',
    NANNY_PRO: 'Cuidly Pro',
  };
  return planNames[plan] || plan;
}

/**
 * Calculates the difference in days between two dates (ignoring time)
 */
function differenceInDays(dateA: Date, dateB: Date): number {
  const a = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const b = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  const diffTime = a.getTime() - b.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron authentication
    const auth = verifyCronAuth(request);
    if (!auth.isAuthorized) {
      return auth.errorResponse;
    }

    console.log('[CRON] Starting cancellation emails check...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const siteUrl = config.site.url;

    // Find all subscriptions with pending cancellation
    const pendingCancellations = await prisma.subscription.findMany({
      where: {
        cancelAtPeriodEnd: true,
        status: 'ACTIVE',
      },
      include: {
        nanny: {
          select: { id: true, name: true, emailAddress: true, gender: true },
        },
        family: {
          select: { id: true, name: true, emailAddress: true },
        },
        cancellationEmailLogs: true,
      },
    });

    console.log(`[CRON] Found ${pendingCancellations.length} subscriptions with pending cancellation`);

    const results: EmailResult[] = [];

    for (const subscription of pendingCancellations) {
      const userType = subscription.nannyId ? 'nanny' : 'family';
      const user = userType === 'nanny' ? subscription.nanny : subscription.family;

      if (!user || !user.emailAddress) {
        console.log(`[CRON] Skipping subscription ${subscription.id}: no user email`);
        continue;
      }

      const userName = user.name || 'Usuário';
      const userEmail = user.emailAddress;
      const planName = getPlanDisplayName(subscription.plan);
      const accessUntilDate = formatDatePtBr(subscription.currentPeriodEnd);
      const daysUntilEnd = differenceInDays(subscription.currentPeriodEnd, today);
      const sentEmails = subscription.cancellationEmailLogs.map((log) => log.emailType);

      const revertCancelUrl = `${siteUrl}/app/assinatura?action=revert-cancel`;
      const reactivateUrl = `${siteUrl}/app/assinatura`;

      // Email 2: 5 days before
      if (daysUntilEnd === 5 && !sentEmails.includes('REMINDER_5_DAYS')) {
        try {
          const template = await getReminder5DaysEmailTemplate({
            name: userName.split(' ')[0],
            userType,
            planName,
            accessUntilDate,
            revertCancelUrl,
          });

          const emailResult = await sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
          });

          if (emailResult.success) {
            await prisma.cancellationEmailLog.create({
              data: {
                subscriptionId: subscription.id,
                emailType: 'REMINDER_5_DAYS',
              },
            });
          }

          results.push({
            subscriptionId: subscription.id,
            userEmail,
            userName,
            emailType: 'REMINDER_5_DAYS',
            success: emailResult.success,
            error: emailResult.error ?? undefined,
          });

          console.log(`[CRON] Sent REMINDER_5_DAYS email to ${userEmail}: ${emailResult.success ? 'success' : emailResult.error}`);
        } catch (error) {
          console.error(`[CRON] Error sending REMINDER_5_DAYS email to ${userEmail}:`, error);
          results.push({
            subscriptionId: subscription.id,
            userEmail,
            userName,
            emailType: 'REMINDER_5_DAYS',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Email 3: 1 day before
      if (daysUntilEnd === 1 && !sentEmails.includes('REMINDER_1_DAY')) {
        try {
          const template = await getReminder1DayEmailTemplate({
            name: userName.split(' ')[0],
            userType,
            planName,
            accessUntilDate,
            revertCancelUrl,
          });

          const emailResult = await sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
          });

          if (emailResult.success) {
            await prisma.cancellationEmailLog.create({
              data: {
                subscriptionId: subscription.id,
                emailType: 'REMINDER_1_DAY',
              },
            });
          }

          results.push({
            subscriptionId: subscription.id,
            userEmail,
            userName,
            emailType: 'REMINDER_1_DAY',
            success: emailResult.success,
            error: emailResult.error ?? undefined,
          });

          console.log(`[CRON] Sent REMINDER_1_DAY email to ${userEmail}: ${emailResult.success ? 'success' : emailResult.error}`);
        } catch (error) {
          console.error(`[CRON] Error sending REMINDER_1_DAY email to ${userEmail}:`, error);
          results.push({
            subscriptionId: subscription.id,
            userEmail,
            userName,
            emailType: 'REMINDER_1_DAY',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Email 4: On cancellation day (or after)
      if (daysUntilEnd <= 0 && !sentEmails.includes('CANCELED')) {
        try {
          // Try to get win-back coupon (adds user to allowed list if coupon exists and is active)
          const winbackCoupon = await getWinbackCoupon(
            userType,
            userEmail,
            subscription.nannyId,
            subscription.familyId
          );

          let template;

          if (winbackCoupon) {
            // Send email with coupon
            template = await getCanceledWithWinbackEmailTemplate({
              name: userName.split(' ')[0],
              userType,
              planName,
              reactivateUrl,
              couponCode: winbackCoupon.code,
              couponDiscount: `${winbackCoupon.discountPercent}%`,
              couponExpirationDate: winbackCoupon.expirationDate,
            });
            console.log(`[CRON] Using win-back coupon ${winbackCoupon.code} for ${userEmail}`);
          } else {
            // Send email without coupon
            template = await getCanceledEmailTemplate({
              name: userName.split(' ')[0],
              userType,
              planName,
              reactivateUrl,
            });
            console.log(`[CRON] No active win-back coupon for ${userType}, sending email without coupon`);
          }

          const emailResult = await sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
          });

          if (emailResult.success) {
            await prisma.cancellationEmailLog.create({
              data: {
                subscriptionId: subscription.id,
                emailType: 'CANCELED',
              },
            });
          }

          results.push({
            subscriptionId: subscription.id,
            userEmail,
            userName,
            emailType: 'CANCELED',
            success: emailResult.success,
            error: emailResult.error ?? undefined,
          });

          console.log(`[CRON] Sent CANCELED email to ${userEmail}: ${emailResult.success ? 'success' : emailResult.error}`);
        } catch (error) {
          console.error(`[CRON] Error sending CANCELED email to ${userEmail}:`, error);
          results.push({
            subscriptionId: subscription.id,
            userEmail,
            userName,
            emailType: 'CANCELED',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    const stats = {
      totalPendingCancellations: pendingCancellations.length,
      emailsSent: results.filter((r) => r.success).length,
      emailsFailed: results.filter((r) => !r.success).length,
      byType: {
        reminder5Days: results.filter((r) => r.emailType === 'REMINDER_5_DAYS').length,
        reminder1Day: results.filter((r) => r.emailType === 'REMINDER_1_DAY').length,
        canceled: results.filter((r) => r.emailType === 'CANCELED').length,
      },
    };

    console.log('[CRON] Cancellation emails check complete:', stats);

    return NextResponse.json({
      success: true,
      stats,
      results,
      message: `Processed ${pendingCancellations.length} subscriptions, sent ${stats.emailsSent} emails`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error processing cancellation emails:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process cancellation emails',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
