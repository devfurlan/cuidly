import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { notifyReviewResponse } from '@/lib/notifications/review-notifications';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * POST /api/reviews/[id]/response - Add a response to a review
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { response } = body;

    if (!response || response.trim().length === 0) {
      return NextResponse.json({ error: 'Resposta não pode ser vazia' }, { status: 400 });
    }

    // Get review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    // Verify the user is the reviewed party
    const isReviewed = (review.type === 'FAMILY_TO_NANNY' && currentUser.type === 'nanny' && currentUser.nanny.id === review.nannyId) ||
                       (review.type === 'NANNY_TO_FAMILY' && currentUser.type === 'family' && currentUser.family.id === review.familyId);

    if (!isReviewed) {
      return NextResponse.json({ error: 'Apenas o avaliado pode responder' }, { status: 403 });
    }

    // Check if published
    if (!review.isPublished) {
      return NextResponse.json({ error: 'Não é possível responder avaliações não publicadas' }, { status: 400 });
    }

    // Check if already responded
    if (review.response) {
      return NextResponse.json({ error: 'Esta avaliação já possui uma resposta' }, { status: 400 });
    }

    // Update with response
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        response,
        respondedAt: new Date(),
      },
      include: {
        family: {
          select: { id: true, name: true },
        },
        nanny: {
          select: { id: true, name: true, photoUrl: true },
        },
      },
    });

    // Send notification to reviewer
    try {
      await notifyReviewResponse(reviewId);
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ review: updated });
  } catch (error) {
    console.error('Error responding to review:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
