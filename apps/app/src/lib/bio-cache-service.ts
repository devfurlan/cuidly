/**
 * Bio Cache Service
 *
 * Manages caching of generated biographies to reduce OpenAI API costs
 */

import prisma from '@/lib/prisma';
import { SentimentAnalysis } from '@/lib/bio-sentiment-analysis';

export interface CachedBio {
  biography: string;
  analysis: SentimentAnalysis;
  fromCache: true;
}

// Cache TTL: 30 days
const CACHE_TTL_DAYS = 30;

/**
 * Get biography from cache if exists and not expired
 */
export async function getBioFromCache(
  cacheKey: string
): Promise<CachedBio | null> {
  try {
    const cached = await prisma.bioCache.findUnique({
      where: {
        cacheKey: cacheKey,
      },
    });

    if (!cached) {
      return null;
    }

    // Check if expired
    if (cached.expiresAt < new Date()) {
      // Delete expired cache entry
      await prisma.bioCache.delete({
        where: { id: cached.id },
      });
      return null;
    }

    // Increment usage count
    await prisma.bioCache.update({
      where: { id: cached.id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    // Build analysis object
    const analysis: SentimentAnalysis = {
      sentiment: cached.sentimentScore
        ? cached.sentimentScore > 0.3
          ? 'positive'
          : cached.sentimentScore > -0.3
          ? 'neutral'
          : 'negative'
        : 'neutral',
      professionalism: cached.professionalism || 5,
      warmth: cached.warmth || 5,
      confidence: cached.confidence || 5,
      clarity: cached.clarity || 5,
      concerns: Array.isArray(cached.concerns) ? (cached.concerns as string[]) : [],
      suggestions: Array.isArray(cached.suggestions)
        ? (cached.suggestions as string[])
        : [],
      passesValidation: cached.passesValidation,
    };

    return {
      biography: cached.biography,
      analysis,
      fromCache: true,
    };
  } catch (error) {
    console.error('Error getting bio from cache:', error);
    return null;
  }
}

/**
 * Save biography to cache
 */
export async function saveBioToCache(
  cacheKey: string,
  biography: string,
  analysis: SentimentAnalysis
): Promise<void> {
  try {
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);

    // Map sentiment to numeric score
    const sentimentScore =
      analysis.sentiment === 'positive'
        ? 0.8
        : analysis.sentiment === 'neutral'
        ? 0.0
        : -0.8;

    // Upsert cache entry
    await prisma.bioCache.upsert({
      where: {
        cacheKey: cacheKey,
      },
      create: {
        cacheKey: cacheKey,
        biography,
        sentimentScore: sentimentScore,
        professionalism: analysis.professionalism,
        warmth: analysis.warmth,
        confidence: analysis.confidence,
        clarity: analysis.clarity,
        concerns: analysis.concerns,
        suggestions: analysis.suggestions,
        passesValidation: analysis.passesValidation,
        expiresAt: expiresAt,
      },
      update: {
        biography,
        sentimentScore: sentimentScore,
        professionalism: analysis.professionalism,
        warmth: analysis.warmth,
        confidence: analysis.confidence,
        clarity: analysis.clarity,
        concerns: analysis.concerns,
        suggestions: analysis.suggestions,
        passesValidation: analysis.passesValidation,
        expiresAt: expiresAt,
        usageCount: 1, // Reset usage count on update
      },
    });
  } catch (error) {
    console.error('Error saving bio to cache:', error);
    // Don't throw - caching is optional
  }
}

/**
 * Clean expired cache entries
 * Should be called periodically (e.g., daily cron job)
 */
export async function cleanExpiredCache(): Promise<number> {
  try {
    const result = await prisma.bioCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error('Error cleaning expired cache:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  avgUsageCount: number;
  topUsed: Array<{ cacheKey: string; usageCount: number }>;
}> {
  try {
    const totalEntries = await prisma.bioCache.count();

    const stats = await prisma.bioCache.aggregate({
      _avg: {
        usageCount: true,
      },
    });

    const topUsed = await prisma.bioCache.findMany({
      select: {
        cacheKey: true,
        usageCount: true,
      },
      orderBy: {
        usageCount: 'desc',
      },
      take: 10,
    });

    return {
      totalEntries,
      avgUsageCount: stats._avg.usageCount || 0,
      topUsed: topUsed.map((item: { cacheKey: string; usageCount: number }) => ({
        cacheKey: item.cacheKey,
        usageCount: item.usageCount,
      })),
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      totalEntries: 0,
      avgUsageCount: 0,
      topUsed: [],
    };
  }
}

/**
 * Invalidate cache for a specific key
 */
export async function invalidateCache(cacheKey: string): Promise<void> {
  try {
    await prisma.bioCache.delete({
      where: {
        cacheKey: cacheKey,
      },
    });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    // Don't throw - cache deletion is optional
  }
}
