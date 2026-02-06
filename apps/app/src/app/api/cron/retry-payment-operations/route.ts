/**
 * Cron Job: Retry Payment Operations
 * GET /api/cron/retry-payment-operations
 *
 * Retries failed Asaas operations (subscription/invoice cancellations, recreations)
 * with exponential backoff strategy.
 *
 * Retry delays (exponential backoff):
 * - Attempt 1: 15 minutes
 * - Attempt 2: 1 hour
 * - Attempt 3: 6 hours
 * - Attempt 4: 24 hours
 * - Attempt 5: 72 hours
 *
 * This endpoint should be called by Vercel Cron every 6 hours
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCronAuth } from '@/lib/cron-auth';
import { PaymentGatewayFactory } from '@/lib/payment/gateway-factory';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max 60 seconds for cron job

interface RetryResult {
  operationId: string;
  type: string;
  action: 'completed' | 'retried' | 'failed' | 'skipped';
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const auth = verifyCronAuth(request);
    if (!auth.isAuthorized) {
      return auth.errorResponse;
    }

    console.log('[CRON] Starting payment operations retry...');

    const now = new Date();

    // Exponential backoff: 15min, 1h, 6h, 24h, 72h
    const retryDelays = [
      15 * 60 * 1000,      // 15 minutes
      60 * 60 * 1000,      // 1 hour
      6 * 60 * 60 * 1000,  // 6 hours
      24 * 60 * 60 * 1000, // 24 hours
      72 * 60 * 60 * 1000, // 72 hours
    ];

    // Find operations ready for retry
    const pendingOperations = await prisma.pendingPaymentOperation.findMany({
      where: {
        status: { in: ['PENDING', 'RETRYING'] },
        attempts: { lt: prisma.pendingPaymentOperation.fields.maxAttempts },
      },
      include: {
        subscription: true,
        payment: true,
      },
    });

    console.log(`[CRON] Found ${pendingOperations.length} pending operations`);

    const results: RetryResult[] = [];

    for (const operation of pendingOperations) {
      // Check if enough time has passed since last attempt (exponential backoff)
      if (operation.lastAttemptAt) {
        const attemptIndex = Math.min(operation.attempts, retryDelays.length - 1);
        const nextRetryTime = new Date(
          operation.lastAttemptAt.getTime() + retryDelays[attemptIndex]
        );

        if (now < nextRetryTime) {
          console.log(
            `[CRON] Operation ${operation.id} (${operation.type}) not ready for retry yet. Next retry at ${nextRetryTime.toISOString()}`
          );
          results.push({
            operationId: operation.id,
            type: operation.type,
            action: 'skipped',
            error: 'Not yet time for retry',
          });
          continue;
        }
      }

      // Attempt retry
      let success = false;
      let error: string | undefined;

      try {
        switch (operation.type) {
          case 'CANCEL_SUBSCRIPTION':
            if (operation.externalId && operation.subscription) {
              console.log(
                `[CRON] Retrying CANCEL_SUBSCRIPTION for ${operation.externalId} (attempt ${operation.attempts + 1})`
              );

              const gateway = PaymentGatewayFactory.create(
                operation.subscription.paymentGateway
              );
              const result = await gateway.cancelSubscription(operation.externalId);
              success = result.success;
              error = result.error;

              if (success) {
                console.log(
                  `[CRON] Successfully canceled subscription ${operation.externalId}`
                );
              } else {
                console.error(
                  `[CRON] Failed to cancel subscription ${operation.externalId}: ${error}`
                );
              }
            } else {
              error = 'Missing externalId or subscription';
            }
            break;

          case 'CANCEL_INVOICE':
            if (operation.externalId && operation.subscription) {
              console.log(
                `[CRON] Retrying CANCEL_INVOICE for ${operation.externalId} (attempt ${operation.attempts + 1})`
              );

              const gateway = PaymentGatewayFactory.create(
                operation.subscription.paymentGateway
              );
              const result = await gateway.cancelInvoice(operation.externalId);
              success = result.success;
              error = result.error;

              if (success) {
                console.log(`[CRON] Successfully canceled invoice ${operation.externalId}`);
              } else {
                console.error(
                  `[CRON] Failed to cancel invoice ${operation.externalId}: ${error}`
                );
              }
            } else {
              error = 'Missing externalId or subscription';
            }
            break;

          case 'RECREATE_SUBSCRIPTION':
            // TODO: Implement subscription recreation logic
            // This will be handled in the revert-cancel endpoint enhancement
            console.log(`[CRON] RECREATE_SUBSCRIPTION not yet implemented for operation ${operation.id}`);
            error = 'Not yet implemented';
            break;

          case 'UPDATE_SUBSCRIPTION':
            console.log(`[CRON] UPDATE_SUBSCRIPTION not yet implemented for operation ${operation.id}`);
            error = 'Not yet implemented';
            break;

          default:
            error = `Unknown operation type: ${operation.type}`;
        }
      } catch (e) {
        error = e instanceof Error ? e.message : 'Unknown error';
        console.error(`[CRON] Exception during retry of operation ${operation.id}:`, e);
      }

      // Update operation status
      if (success) {
        await prisma.pendingPaymentOperation.update({
          where: { id: operation.id },
          data: {
            status: 'COMPLETED',
            completedAt: now,
            lastAttemptAt: now,
            attempts: operation.attempts + 1,
          },
        });

        results.push({
          operationId: operation.id,
          type: operation.type,
          action: 'completed',
        });
      } else {
        const newAttempts = operation.attempts + 1;
        const isFinalAttempt = newAttempts >= operation.maxAttempts;

        await prisma.pendingPaymentOperation.update({
          where: { id: operation.id },
          data: {
            status: isFinalAttempt ? 'FAILED' : 'RETRYING',
            lastAttemptAt: now,
            attempts: newAttempts,
            lastError: error,
          },
        });

        results.push({
          operationId: operation.id,
          type: operation.type,
          action: isFinalAttempt ? 'failed' : 'retried',
          error,
        });

        if (isFinalAttempt) {
          console.error(
            `[CRON] Operation ${operation.id} (${operation.type}) has reached max attempts and FAILED permanently`
          );
        } else {
          const nextAttemptIndex = Math.min(newAttempts, retryDelays.length - 1);
          const nextRetryDelay = retryDelays[nextAttemptIndex];
          const nextRetryTime = new Date(now.getTime() + nextRetryDelay);
          console.log(
            `[CRON] Operation ${operation.id} (${operation.type}) will retry at ${nextRetryTime.toISOString()}`
          );
        }
      }
    }

    const stats = {
      totalOperations: pendingOperations.length,
      completed: results.filter((r) => r.action === 'completed').length,
      retried: results.filter((r) => r.action === 'retried').length,
      failed: results.filter((r) => r.action === 'failed').length,
      skipped: results.filter((r) => r.action === 'skipped').length,
    };

    console.log('[CRON] Payment operations retry complete:', stats);

    return NextResponse.json({
      success: true,
      stats,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error retrying payment operations:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retry operations',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
