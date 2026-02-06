import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { ModerationAction, NotificationType } from '@cuidly/database';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/reviews/[id]
 * Busca uma review específica
 */
async function handleGet(_request: Request, context: RouteContext) {
  try {
    await requirePermission('REVIEWS');

    const { id } = await context.params;
    const reviewId = parseInt(id);

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        family: {
          select: { id: true, name: true },
        },
        nanny: {
          select: { id: true, name: true, photoUrl: true, slug: true },
        },
        moderationLogs: {
          include: {
            moderator: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar avaliação';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/reviews/[id]
 * Atualiza uma review (moderação)
 * Body:
 *   - action: 'hide' | 'show' | 'publish'
 *   - moderationNote?: string
 */
async function handlePatch(request: Request, context: RouteContext) {
  try {
    const admin = await requirePermission('REVIEWS');

    const { id } = await context.params;
    const reviewId = parseInt(id);
    const body = await request.json();
    const { action, moderationNote } = body;

    if (!action || !['hide', 'show', 'publish'].includes(action)) {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    // Get current review with full data for snapshot
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        family: {
          select: { id: true, name: true },
        },
        nanny: {
          select: { id: true, name: true, photoUrl: true, slug: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    // Create snapshot for moderation log
    const reviewSnapshot = {
      id: review.id,
      type: review.type,
      overallRating: review.overallRating,
      comment: review.comment,
      isPublished: review.isPublished,
      isVisible: review.isVisible,
      family: { id: review.family.id, name: review.family.name },
      nanny: { id: review.nanny.id, name: review.nanny.name },
      createdAt: review.createdAt,
    };

    // Map action to log action
    const actionMap: Record<string, ModerationAction> = {
      hide: ModerationAction.HIDDEN,
      show: ModerationAction.APPROVED,
      publish: ModerationAction.PUBLISHED,
    };

    // Prepare update data
     
    const updateData: any = {
      moderatedAt: new Date(),
      moderatedBy: admin.id,
    };

    if (moderationNote) {
      updateData.moderationNote = moderationNote;
    }

    switch (action) {
      case 'hide':
        updateData.isVisible = false;
        break;
      case 'show':
        updateData.isVisible = true;
        break;
      case 'publish':
        if (review.isPublished) {
          return NextResponse.json({ error: 'Avaliação já está publicada' }, { status: 400 });
        }
        updateData.isPublished = true;
        updateData.publishedAt = new Date();
        updateData.isVisible = true;
        break;
    }

    // Execute update and create moderation log in transaction
    const [updated] = await prisma.$transaction([
      prisma.review.update({
        where: { id: reviewId },
        data: updateData,
        include: {
          family: { select: { id: true, name: true } },
          nanny: { select: { id: true, name: true, photoUrl: true, slug: true } },
        },
      }),
      prisma.moderationLog.create({
        data: {
          moderatorId: admin.id,
          reviewId: reviewId,
          action: actionMap[action],
          reason: moderationNote || null,
          reviewSnapshot,
        },
      }),
    ]);

    // Send notification to user if review was hidden
    if (action === 'hide') {
      // Determine if it's a family or nanny who made the review
      const isFamilyReview = review.type === 'FAMILY_TO_NANNY';

      // Create notification via API call to app
      try {
        await prisma.notification.create({
          data: {
            familyId: isFamilyReview ? review.familyId : null,
            nannyId: !isFamilyReview ? review.nannyId : null,
            type: NotificationType.REVIEW_MODERATED,
            title: 'Sua avaliação foi ocultada',
            message: moderationNote
              ? `Sua avaliação foi ocultada pela moderação. Motivo: ${moderationNote}`
              : 'Sua avaliação foi ocultada pela moderação por violar nossas diretrizes de comunidade.',
            link: '/app/minhas-avaliacoes',
            reviewId: reviewId,
          },
        });
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
        // Don't fail the request if notification fails
      }
    }

    const actionMessages: Record<string, string> = {
      hide: 'Avaliação ocultada com sucesso',
      show: 'Avaliação tornada visível com sucesso',
      publish: 'Avaliação publicada com sucesso',
    };

    return NextResponse.json({
      review: updated,
      message: actionMessages[action],
    });
  } catch (error) {
    console.error('Error updating review:', error);
    const message = error instanceof Error ? error.message : 'Erro ao atualizar avaliação';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const PATCH = withAuth(handlePatch);
