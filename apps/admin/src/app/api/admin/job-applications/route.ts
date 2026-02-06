import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';

/**
 * GET /api/admin/job-applications
 * Lista todas as candidaturas com filtros e paginação
 * Query params:
 *   - status: 'all' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
 *   - jobId: ID da vaga
 *   - nannyId: ID da baba
 *   - page: numero da pagina (default 1)
 *   - limit: itens por pagina (default 20)
 */
async function handleGet(request: Request) {
  try {
    await requirePermission('JOBS');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const jobId = searchParams.get('jobId');
    const nannyId = searchParams.get('nannyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Status filter
    if (status !== 'all') {
      where.status = status;
    }

    // Job filter
    if (jobId) {
      where.jobId = parseInt(jobId);
    }

    // Nanny filter
    if (nannyId) {
      where.nannyId = parseInt(nannyId);
    }

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              status: true,
              family: {
                select: { id: true, name: true },
              },
            },
          },
          nanny: {
            select: {
              id: true,
              name: true,
              slug: true,
              photoUrl: true,
              phoneNumber: true,
              emailAddress: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.jobApplication.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar candidaturas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
