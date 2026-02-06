import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { notifyReviewPublished } from '@/lib/notifications/review-notifications';
import prisma from '@/lib/prisma';
import { canSeeReviews } from '@/services/subscription';
import type { ReviewType } from '@cuidly/database';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/reviews - List reviews for a user
 * Query params:
 *   - nannyId or familyId: ID of the user to get reviews for
 *   - type: 'received' or 'given'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nannyId = searchParams.get('nannyId');
    const familyId = searchParams.get('familyId');
    const type = searchParams.get('type') || 'received';

    if (!nannyId && !familyId) {
      return NextResponse.json(
        { error: 'nannyId ou familyId é obrigatório' },
        { status: 400 },
      );
    }

    // Check if user is authenticated and can see reviews
    const currentUser = await getCurrentUser();

    // Families need subscription to see reviews
    if (currentUser) {
      if (currentUser.type === 'family') {
        const canSee = await canSeeReviews({ familyId: currentUser.family.id });
        if (!canSee) {
          return NextResponse.json(
            {
              error: 'Funcionalidade Premium',
              code: 'SUBSCRIPTION_REQUIRED',
              message: 'Assine um plano para ver todas avaliações',
              reviews: [],
              avgRating: 0,
              totalReviews: 0,
              categoryAverages: null,
              isBlocked: true,
            },
            { status: 200 },
          ); // Return 200 with blocked flag instead of 403
        }
      }
    }

    let where: Record<string, unknown> = {
      isVisible: true,
      isPublished: true,
    };

    if (nannyId) {
      const id = parseInt(nannyId);
      if (type === 'received') {
        // Reviews where nanny was reviewed (FAMILY_TO_NANNY)
        where = { ...where, nannyId: id, type: 'FAMILY_TO_NANNY' };
      } else {
        // Reviews where nanny gave review (NANNY_TO_FAMILY)
        where = { ...where, nannyId: id, type: 'NANNY_TO_FAMILY' };
      }
    } else if (familyId) {
      const id = parseInt(familyId);
      if (type === 'received') {
        // Reviews where family was reviewed (NANNY_TO_FAMILY)
        where = { ...where, familyId: id, type: 'NANNY_TO_FAMILY' };
      } else {
        // Reviews where family gave review (FAMILY_TO_NANNY)
        where = { ...where, familyId: id, type: 'FAMILY_TO_NANNY' };
      }
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        nanny: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    // Calculate averages
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
        : 0;

    // Category averages for nanny reviews
    const nannyReviews = reviews.filter((r) => r.type === 'FAMILY_TO_NANNY');
    const categoryAverages =
      nannyReviews.length > 0
        ? {
            punctuality:
              nannyReviews.reduce((sum, r) => sum + (r.punctuality || 0), 0) /
              nannyReviews.length,
            care:
              nannyReviews.reduce((sum, r) => sum + (r.care || 0), 0) /
              nannyReviews.length,
            communication:
              nannyReviews.reduce((sum, r) => sum + (r.communication || 0), 0) /
              nannyReviews.length,
            reliability:
              nannyReviews.reduce((sum, r) => sum + (r.reliability || 0), 0) /
              nannyReviews.length,
          }
        : null;

    // Category averages for family reviews
    const familyReviews = reviews.filter((r) => r.type === 'NANNY_TO_FAMILY');
    const familyCategoryAverages =
      familyReviews.length > 0
        ? {
            communication:
              familyReviews.reduce(
                (sum, r) => sum + (r.communication || 0),
                0,
              ) / familyReviews.length,
            respect:
              familyReviews.reduce((sum, r) => sum + (r.respect || 0), 0) /
              familyReviews.length,
            environment:
              familyReviews.reduce((sum, r) => sum + (r.environment || 0), 0) /
              familyReviews.length,
            payment:
              familyReviews.reduce((sum, r) => sum + (r.payment || 0), 0) /
              familyReviews.length,
          }
        : null;

    return NextResponse.json({
      reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
      categoryAverages: categoryAverages || familyCategoryAverages,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/reviews - Create a new review
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      targetId,
      type: typeStr,
      categories,
      comment,
      jobId,
      photos,
    } = body;
    const type = typeStr as ReviewType;

    // Validations
    if (!targetId || !type || !categories) {
      return NextResponse.json(
        { error: 'targetId, type e categories são obrigatórios' },
        { status: 400 },
      );
    }

    if (!['NANNY_TO_FAMILY', 'FAMILY_TO_NANNY'].includes(type)) {
      return NextResponse.json({ error: 'type inválido' }, { status: 400 });
    }

    // Determine reviewer and reviewed based on type
    let familyId: number;
    let nannyId: number;

    if (type === 'FAMILY_TO_NANNY') {
      if (currentUser.type !== 'family') {
        return NextResponse.json(
          { error: 'Apenas famílias podem fazer este tipo de avaliação' },
          { status: 403 },
        );
      }
      familyId = currentUser.family.id;
      nannyId = parseInt(targetId);

      // Verify nanny exists
      const nanny = await prisma.nanny.findUnique({ where: { id: nannyId } });
      if (!nanny) {
        return NextResponse.json(
          { error: 'Babá não encontrada' },
          { status: 404 },
        );
      }
    } else {
      if (currentUser.type !== 'nanny') {
        return NextResponse.json(
          { error: 'Apenas babás podem fazer este tipo de avaliação' },
          { status: 403 },
        );
      }
      nannyId = currentUser.nanny.id;
      familyId = parseInt(targetId);

      // Verify family exists
      const family = await prisma.family.findUnique({
        where: { id: familyId },
      });
      if (!family) {
        return NextResponse.json(
          { error: 'Família não encontrada' },
          { status: 404 },
        );
      }
    }

    // Find a conversation where both users are participants
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const conversation = await prisma.conversation.findFirst({
      where: {
        createdAt: { gte: fourteenDaysAgo },
        AND: [
          { participants: { some: { familyId } } },
          { participants: { some: { nannyId } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!conversation) {
      return NextResponse.json(
        {
          error:
            'Você só pode avaliar usuários com quem teve contato nos últimos 14 dias',
        },
        { status: 400 },
      );
    }

    // Check if already reviewed
    const parsedJobId = jobId ? parseInt(jobId) : null;
    const existing = await prisma.review.findFirst({
      where: {
        familyId,
        nannyId,
        type,
        jobId: parsedJobId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Você já avaliou este usuário' },
        { status: 400 },
      );
    }

    // Calculate overall rating
    const categoryValues = Object.values(categories).filter(
      (v): v is number => typeof v === 'number',
    );
    if (categoryValues.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos uma categoria deve ser avaliada' },
        { status: 400 },
      );
    }
    const overallRating =
      categoryValues.reduce((sum, v) => sum + v, 0) / categoryValues.length;

    // Create review
    const review = await prisma.review.create({
      data: {
        familyId,
        nannyId,
        type,
        punctuality: categories.punctuality || null,
        care: categories.care || null,
        communication: categories.communication || null,
        reliability: categories.reliability || null,
        respect: categories.respect || null,
        environment: categories.environment || null,
        payment: categories.payment || null,
        overallRating,
        comment: comment || null,
        photos: Array.isArray(photos) ? photos : [],
        jobId: jobId ? parseInt(jobId) : null,
        conversationId: conversation.id,
        isPublished: false,
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

    // Check if reciprocal review exists
    const reciprocalType =
      type === 'FAMILY_TO_NANNY' ? 'NANNY_TO_FAMILY' : 'FAMILY_TO_NANNY';
    const reciprocalReview = await prisma.review.findFirst({
      where: {
        familyId,
        nannyId,
        type: reciprocalType,
        jobId: parsedJobId,
      },
    });

    // If both reviewed, publish both
    if (reciprocalReview) {
      await prisma.review.updateMany({
        where: {
          id: { in: [review.id, reciprocalReview.id] },
        },
        data: {
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      // Send notifications
      try {
        await notifyReviewPublished(review.id);
        await notifyReviewPublished(reciprocalReview.id);
      } catch (notifyError) {
        console.error('Error sending notifications:', notifyError);
        // Don't fail the request if notifications fail
      }

      return NextResponse.json({
        review,
        message: 'Avaliação publicada! Ambos avaliaram.',
        isPublished: true,
      });
    }

    return NextResponse.json({
      review,
      message:
        'Avaliação salva! Será publicada quando o outro usuário avaliar ou após 14 dias.',
      isPublished: false,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
