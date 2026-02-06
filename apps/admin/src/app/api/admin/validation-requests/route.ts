import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';

/**
 * GET /api/admin/validation-requests
 * Lista todas as solicitacoes de validação com filtros e paginação
 * Query params:
 *   - status: 'all' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
 *   - level: 'all' | 'BASIC' | 'PREMIUM'
 *   - search: busca por nome da baba
 *   - page: numero da pagina (default 1)
 *   - limit: itens por pagina (default 20)
 */
async function handleGet(request: Request) {
  try {
    await requirePermission('VALIDATIONS');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const level = searchParams.get('level') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Status filter
    if (status !== 'all') {
      where.status = status;
    }

    // Level filter
    if (level !== 'all') {
      where.level = level;
    }

    // Search filter by nanny name
    if (search) {
      where.nanny = {
        name: { contains: search, mode: 'insensitive' },
      };
    }

    const [validationRequests, total] = await Promise.all([
      prisma.validationRequest.findMany({
        where,
        include: {
          nanny: {
            select: {
              id: true,
              name: true,
              slug: true,
              photoUrl: true,
              emailAddress: true,
              phoneNumber: true,
              documentValidated: true,
              documentExpirationDate: true,
              criminalBackgroundValidated: true,
              personalDataValidated: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.validationRequest.count({ where }),
    ]);

    return NextResponse.json({
      validationRequests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching validation requests:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar validacoes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
