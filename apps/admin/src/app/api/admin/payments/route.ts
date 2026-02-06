import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';

/**
 * GET /api/admin/payments
 * Lista todos os pagamentos
 * Query params:
 *   - status: 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'PAID' | 'FAILED' | 'CANCELED' | 'REFUNDED' | 'OVERDUE' | 'all' (default: 'all')
 *   - userId: filtro por ID do usuario
 *   - startDate: data inicial (formato ISO)
 *   - endDate: data final (formato ISO)
 *   - search: busca por nome ou email do usuario
 *   - page: numero da pagina (default: 1)
 *   - limit: itens por pagina (default: 20)
 */
async function handleGet(request: Request) {
  try {
    await requirePermission('SUBSCRIPTIONS');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Filtro por status
    if (status && status !== 'all') {
      where.status = status;
    }

    // Filtro por nannyId ou familyId
    if (userId) {
      const numId = parseInt(userId);
      if (!isNaN(numId)) {
        where.OR = [
          { nannyId: numId },
          { familyId: numId },
        ];
      }
    }

    // Filtro por periodo
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Busca por nome ou email
    if (search) {
      where.OR = [
        { nanny: { name: { contains: search, mode: 'insensitive' } } },
        { nanny: { emailAddress: { contains: search, mode: 'insensitive' } } },
        { family: { name: { contains: search, mode: 'insensitive' } } },
        { family: { emailAddress: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          nanny: {
            select: {
              id: true,
              name: true,
              emailAddress: true,
              photoUrl: true,
            },
          },
          family: {
            select: {
              id: true,
              name: true,
              emailAddress: true,
              photoUrl: true,
            },
          },
          subscription: {
            select: {
              id: true,
              plan: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar pagamentos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
