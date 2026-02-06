import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';

/**
 * GET /api/reviews/stats
 * Retorna estatísticas gerais de avaliações
 */
async function handleGet() {
  try {
    await requirePermission('REVIEWS');

    // Get counts by status
    const [
      totalReviews,
      pendingReviews,
      publishedReviews,
      hiddenReviews,
      familyToNannyCount,
      nannyToFamilyCount,
    ] = await Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { isPublished: false } }),
      prisma.review.count({ where: { isPublished: true, isVisible: true } }),
      prisma.review.count({ where: { isVisible: false } }),
      prisma.review.count({ where: { type: 'FAMILY_TO_NANNY' } }),
      prisma.review.count({ where: { type: 'NANNY_TO_FAMILY' } }),
    ]);

    // Get average ratings
    const avgRatings = await prisma.review.aggregate({
      _avg: {
        overallRating: true,
        punctuality: true,
        care: true,
        communication: true,
        reliability: true,
        respect: true,
        environment: true,
        payment: true,
      },
      where: {
        isPublished: true,
        isVisible: true,
      },
    });

    // Get reviews created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentReviews = await prisma.review.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['overallRating'],
      _count: true,
      where: {
        isPublished: true,
        isVisible: true,
      },
    });

    // Format rating distribution
    const distribution: Record<string, number> = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    ratingDistribution.forEach((item) => {
      const roundedRating = Math.round(item.overallRating);
      const key = String(Math.min(5, Math.max(1, roundedRating)));
      distribution[key] = (distribution[key] || 0) + item._count;
    });

    return NextResponse.json({
      total: totalReviews,
      pending: pendingReviews,
      published: publishedReviews,
      hidden: hiddenReviews,
      byType: {
        familyToNanny: familyToNannyCount,
        nannyToFamily: nannyToFamilyCount,
      },
      averages: {
        overall: avgRatings._avg.overallRating ? Math.round(avgRatings._avg.overallRating * 10) / 10 : 0,
        punctuality: avgRatings._avg.punctuality ? Math.round(avgRatings._avg.punctuality * 10) / 10 : null,
        care: avgRatings._avg.care ? Math.round(avgRatings._avg.care * 10) / 10 : null,
        communication: avgRatings._avg.communication ? Math.round(avgRatings._avg.communication * 10) / 10 : null,
        reliability: avgRatings._avg.reliability ? Math.round(avgRatings._avg.reliability * 10) / 10 : null,
        respect: avgRatings._avg.respect ? Math.round(avgRatings._avg.respect * 10) / 10 : null,
        environment: avgRatings._avg.environment ? Math.round(avgRatings._avg.environment * 10) / 10 : null,
        payment: avgRatings._avg.payment ? Math.round(avgRatings._avg.payment * 10) / 10 : null,
      },
      recentCount: recentReviews,
      ratingDistribution: distribution,
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar estatísticas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
