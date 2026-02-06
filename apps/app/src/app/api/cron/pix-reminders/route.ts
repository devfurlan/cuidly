/**
 * Cron Job: PIX Payment Reminders
 * GET /api/cron/pix-reminders
 *
 * Runs daily to send PIX payment reminders:
 * - 1 day after creation: Reminder with PIX code (if still pending)
 * - When expired: Notification to generate new PIX
 *
 * This endpoint should be called by Vercel Cron at 10:00 BRT (13:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCronAuth } from '@/lib/cron-auth';
import { sendEmail } from '@/lib/email/sendEmail';
import {
  getPixReminderEmailTemplate,
  getPixExpiredEmailTemplate,
} from '@/lib/email/react-templates';
import { PixReminderEmailType, BillingInterval } from '@prisma/client';
import { config } from '@/config';
import { PLAN_LABELS } from '@cuidly/core';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Max 2 minutes for cron job

interface PixMetadata {
  pixQrCode?: string;
  pixCopyPaste?: string;
  pixExpiresAt?: string;
}

interface EmailResult {
  paymentId: string;
  userEmail: string;
  userName: string;
  emailType: PixReminderEmailType;
  success: boolean;
  error?: string;
}

export async function GET(req: NextRequest) {
  // Verify cron authentication
  const authResult = verifyCronAuth(req);
  if (!authResult.isAuthorized) {
    return authResult.errorResponse;
  }

  const results: EmailResult[] = [];
  const now = new Date();

  try {
    // Find all PENDING PIX payments
    const pendingPixPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        paymentMethod: 'PIX',
      },
      include: {
        subscription: true,
        nanny: {
          select: { name: true, emailAddress: true },
        },
        family: {
          select: { name: true, emailAddress: true },
        },
        pixReminderEmailLogs: true,
      },
    });

    for (const payment of pendingPixPayments) {
      const metadata = payment.metadata as PixMetadata | null;
      const pixExpiresAt = metadata?.pixExpiresAt ? new Date(metadata.pixExpiresAt) : null;
      const pixCopyPaste = metadata?.pixCopyPaste || '';
      const createdAt = payment.createdAt;

      // Get user info
      const userType = payment.nannyId ? 'nanny' : 'family';
      const userData = payment.nannyId ? payment.nanny : payment.family;
      const userEmail = userData?.emailAddress;
      const userName = userData?.name;

      if (!userEmail || !userName) {
        continue;
      }

      // Get plan info
      const planName = payment.subscription
        ? PLAN_LABELS[payment.subscription.plan as keyof typeof PLAN_LABELS] || payment.subscription.plan
        : 'Cuidly Plus';
      const billingIntervalLabel = payment.subscription
        ? getBillingIntervalLabel(payment.subscription.billingInterval)
        : 'Mensal';

      const amountFormatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(payment.amount);

      // Check which emails were already sent
      const sentEmailTypes = payment.pixReminderEmailLogs.map((log) => log.emailType);

      // Check if PIX expired
      const isExpired = pixExpiresAt && pixExpiresAt < now;

      if (isExpired) {
        // Send expired email if not sent yet
        if (!sentEmailTypes.includes('EXPIRED')) {
          const result = await sendPixExpiredEmail({
            paymentId: payment.id,
            userEmail,
            userName,
            userType,
            planName,
            amountFormatted,
          });
          results.push(result);
        }
      } else {
        // Check if 1 day has passed since creation
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const isOlderThan1Day = createdAt < oneDayAgo;

        if (isOlderThan1Day && !sentEmailTypes.includes('REMINDER_1_DAY')) {
          const result = await sendPixReminderEmail({
            paymentId: payment.id,
            userEmail,
            userName,
            userType,
            planName,
            amountFormatted,
            pixCopyPaste,
            pixExpiresAt: pixExpiresAt?.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) || '',
          });
          results.push(result);
        }
      }
    }

    // Summary
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`[PIX Reminders] Sent ${successful} emails, ${failed} failed`);

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        successful,
        failed,
      },
      results,
    });
  } catch (error) {
    console.error('[PIX Reminders] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function sendPixReminderEmail(params: {
  paymentId: string;
  userEmail: string;
  userName: string;
  userType: 'nanny' | 'family';
  planName: string;
  amountFormatted: string;
  pixCopyPaste: string;
  pixExpiresAt: string;
}): Promise<EmailResult> {
  const { paymentId, userEmail, userName, userType, planName, amountFormatted, pixCopyPaste, pixExpiresAt } = params;

  try {
    const emailTemplate = await getPixReminderEmailTemplate({
      name: userName.split(' ')[0],
      userType,
      planName,
      amount: amountFormatted,
      pixCopyPaste,
      pixExpiresAt,
      checkoutUrl: `${config.site.url}/app/assinatura`,
    });

    const emailResult = await sendEmail({
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (emailResult.success) {
      // Log the sent email
      await prisma.pixReminderEmailLog.create({
        data: {
          paymentId,
          emailType: 'REMINDER_1_DAY',
        },
      });
    }

    return {
      paymentId,
      userEmail,
      userName,
      emailType: 'REMINDER_1_DAY',
      success: emailResult.success,
      error: emailResult.error ?? undefined,
    };
  } catch (error) {
    console.error(`[PIX Reminders] Error sending reminder email to ${userEmail}:`, error);
    return {
      paymentId,
      userEmail,
      userName,
      emailType: 'REMINDER_1_DAY',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function sendPixExpiredEmail(params: {
  paymentId: string;
  userEmail: string;
  userName: string;
  userType: 'nanny' | 'family';
  planName: string;
  amountFormatted: string;
}): Promise<EmailResult> {
  const { paymentId, userEmail, userName, userType, planName, amountFormatted } = params;

  try {
    const emailTemplate = await getPixExpiredEmailTemplate({
      name: userName.split(' ')[0],
      userType,
      planName,
      amount: amountFormatted,
      checkoutUrl: `${config.site.url}/app/assinatura`,
    });

    const emailResult = await sendEmail({
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (emailResult.success) {
      // Log the sent email
      await prisma.pixReminderEmailLog.create({
        data: {
          paymentId,
          emailType: 'EXPIRED',
        },
      });
    }

    return {
      paymentId,
      userEmail,
      userName,
      emailType: 'EXPIRED',
      success: emailResult.success,
      error: emailResult.error ?? undefined,
    };
  } catch (error) {
    console.error(`[PIX Reminders] Error sending expired email to ${userEmail}:`, error);
    return {
      paymentId,
      userEmail,
      userName,
      emailType: 'EXPIRED',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
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
