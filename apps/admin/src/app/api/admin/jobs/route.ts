import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';

/**
 * GET /api/admin/jobs
 * Lista todas as vagas com filtros e paginação
 * Query params:
 *   - status: 'all' | 'ACTIVE' | 'PAUSED' | 'CLOSED'
 *   - familyId: ID da familia
 *   - search: busca por titulo
 *   - page: numero da pagina (default 1)
 *   - limit: itens por pagina (default 20)
 */
async function handleGet(request: Request) {
  try {
    await requirePermission('JOBS');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const familyId = searchParams.get('familyId');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      deletedAt: null,
    };

    // Status filter
    if (status !== 'all') {
      where.status = status;
    }

    // Family filter
    if (familyId) {
      where.familyId = parseInt(familyId);
    }

    // Search filter
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          family: {
            select: { id: true, name: true, name: true },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar vagas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
