import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';

/**
 * GET /api/reviews
 * Lista todas as reviews com filtros
 * Query params:
 *   - status: 'all' | 'pending' | 'published' | 'hidden'
 *   - type: 'all' | 'FAMILY_TO_NANNY' | 'NANNY_TO_FAMILY'
 *   - search: busca por nome da babá ou família
 *   - page: número da página (default 1)
 *   - limit: itens por página (default 20)
 */
async function handleGet(request: Request) {
  try {
    await requirePermission('REVIEWS');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
     
    const where: any = {};

    // Status filter
    if (status === 'pending') {
      where.isPublished = false;
    } else if (status === 'published') {
      where.isPublished = true;
      where.isVisible = true;
    } else if (status === 'hidden') {
      where.isVisible = false;
    }

    // Type filter
    if (type !== 'all') {
      where.type = type;
    }

    // Search filter
    if (search) {
      where.OR = [
        { nanny: { name: { contains: search, mode: 'insensitive' } } },
        { family: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
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
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar avaliações';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
