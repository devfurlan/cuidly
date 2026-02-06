import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * GET /api/reviews/my-reviews - Get all reviews by the current user
 * Returns both published and unpublished reviews
 */
export async function GET(_request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    let where: Record<string, unknown>;

    if (currentUser.type === 'family') {
      // Family user - get reviews they made (FAMILY_TO_NANNY)
      where = {
        familyId: currentUser.family.id,
        type: 'FAMILY_TO_NANNY',
      };
    } else {
      // Nanny user - get reviews they made (NANNY_TO_FAMILY)
      where = {
        nannyId: currentUser.nanny.id,
        type: 'NANNY_TO_FAMILY',
      };
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        family: {
          select: { id: true, name: true },
        },
        nanny: {
          select: { id: true, name: true, photoUrl: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Separate published and unpublished
    const publishedReviews = reviews.filter(r => r.isPublished);
    const unpublishedReviews = reviews.filter(r => !r.isPublished);

    return NextResponse.json({
      reviews,
      publishedReviews,
      unpublishedReviews,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
