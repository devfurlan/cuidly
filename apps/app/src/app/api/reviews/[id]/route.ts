import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * GET /api/reviews/[id] - Get a single review
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * PUT /api/reviews/[id] - Update an unpublished review
 */
export async function PUT(
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

    // Get review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    // Check if already published
    if (review.isPublished) {
      return NextResponse.json({ error: 'Não é possível editar avaliações já publicadas' }, { status: 400 });
    }

    // Check ownership based on user type and review type
    const isOwner = (review.type === 'FAMILY_TO_NANNY' && currentUser.type === 'family' && review.familyId === currentUser.family.id) ||
                    (review.type === 'NANNY_TO_FAMILY' && currentUser.type === 'nanny' && review.nannyId === currentUser.nanny.id);

    if (!isOwner) {
      return NextResponse.json({ error: 'Você não tem permissão para editar esta avaliação' }, { status: 403 });
    }

    const body = await request.json();
    const { categories, comment, photos } = body;

    if (!categories) {
      return NextResponse.json({ error: 'categories é obrigatório' }, { status: 400 });
    }

    // Calculate overall rating
    const categoryValues = Object.values(categories).filter((v): v is number => typeof v === 'number');
    if (categoryValues.length === 0) {
      return NextResponse.json({ error: 'Pelo menos uma categoria deve ser avaliada' }, { status: 400 });
    }
    const overallRating = categoryValues.reduce((sum, v) => sum + v, 0) / categoryValues.length;

    // Update review
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        punctuality: categories.punctuality || null,
        care: categories.care || null,
        communication: categories.communication || null,
        reliability: categories.reliability || null,
        respect: categories.respect || null,
        environment: categories.environment || null,
        payment: categories.payment || null,
        overallRating,
        comment: comment || null,
        photos: Array.isArray(photos) ? photos : undefined,
      },
      include: {
        family: {
          select: { id: true, name: true },
        },
        nanny: {
          select: { id: true, name: true, photoUrl: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      review: updated,
      message: 'Avaliação atualizada com sucesso',
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * DELETE /api/reviews/[id] - Delete an unpublished review
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Get review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    // Check if already published
    if (review.isPublished) {
      return NextResponse.json({ error: 'Não é possível excluir avaliações já publicadas' }, { status: 400 });
    }

    // Check ownership based on user type and review type
    const isOwner = (review.type === 'FAMILY_TO_NANNY' && currentUser.type === 'family' && review.familyId === currentUser.family.id) ||
                    (review.type === 'NANNY_TO_FAMILY' && currentUser.type === 'nanny' && review.nannyId === currentUser.nanny.id);

    if (!isOwner) {
      return NextResponse.json({ error: 'Você não tem permissão para excluir esta avaliação' }, { status: 403 });
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      success: true,
      message: 'Avaliação excluída com sucesso',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
