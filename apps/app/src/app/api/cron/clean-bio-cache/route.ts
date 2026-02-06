/**
 * Cron Job: Clean Bio Cache
 * GET /api/cron/clean-bio-cache
 *
 * Runs daily to clean expired biography cache entries
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cleanExpiredCache, getCacheStats } from '@/lib/bio-cache-service';
import { verifyCronAuth } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max 60 seconds for cron job

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação com comparação timing-safe
    const auth = verifyCronAuth(request);
    if (!auth.isAuthorized) {
      return auth.errorResponse;
    }

    console.log('[CRON] Starting bio cache cleanup...');

    // Get stats before cleanup
    const statsBefore = await getCacheStats();
    console.log('[CRON] Cache stats before cleanup:', statsBefore);

    // Clean expired entries
    const deletedCount = await cleanExpiredCache();
    console.log(`[CRON] Deleted ${deletedCount} expired cache entries`);

    // Get stats after cleanup
    const statsAfter = await getCacheStats();
    console.log('[CRON] Cache stats after cleanup:', statsAfter);

    return NextResponse.json({
      success: true,
      deletedCount,
      statsBefore,
      statsAfter,
      message: `Successfully cleaned ${deletedCount} expired cache entries`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error cleaning bio cache:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clean cache',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
