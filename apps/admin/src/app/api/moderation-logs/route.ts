import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';

/**
 * GET /api/moderation-logs
 * Lista histórico de moderações
 * Query params:
 *   - page: número da página (default 1)
 *   - limit: itens por página (default 50)
 *   - moderatorId: filtrar por moderador
 *   - action: filtrar por ação (APPROVED, HIDDEN, DELETED, PUBLISHED)
 */
async function handleGet(request: Request) {
  try {
    await requirePermission('REVIEWS');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const moderatorId = searchParams.get('moderatorId');
    const action = searchParams.get('action');
    const skip = (page - 1) * limit;

    // Build where clause
     
    const where: any = {};

    if (moderatorId) {
      where.moderatorId = moderatorId;
    }

    if (action) {
      where.action = action;
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.moderationLog.findMany({
        where,
        include: {
          moderator: {
            select: {
              id: true,
              name: true,
              email: true,
              photoUrl: true,
            },
          },
          review: {
            select: {
              id: true,
              overallRating: true,
              comment: true,
              isVisible: true,
              isPublished: true,
              family: {
                select: { id: true, name: true },
              },
              nanny: {
                select: { id: true, name: true, photoUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.moderationLog.count({ where }),
    ]);

    // Get stats
    const [totalActions, approved, hidden, deleted, published] = await Promise.all([
      prisma.moderationLog.count(),
      prisma.moderationLog.count({ where: { action: 'APPROVED' } }),
      prisma.moderationLog.count({ where: { action: 'HIDDEN' } }),
      prisma.moderationLog.count({ where: { action: 'DELETED' } }),
      prisma.moderationLog.count({ where: { action: 'PUBLISHED' } }),
    ]);

    return NextResponse.json({
      logs,
      stats: {
        totalActions,
        approved,
        hidden,
        deleted,
        published,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching moderation logs:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar histórico';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
