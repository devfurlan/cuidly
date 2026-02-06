import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';

/**
 * GET /api/admin/subscriptions
 * Lista todas as assinaturas (modelo Subscription vinculado a Nanny/Family)
 * Query params:
 *   - status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'INCOMPLETE' | 'EXPIRED' | 'all' (default: 'all')
 *   - plan: filtro por plano (ex: 'FAMILY_FREE', 'FAMILY_PLUS', 'NANNY_FREE', 'NANNY_PRO')
 *   - nannyId: filtro por ID da baba
 *   - familyId: filtro por ID da familia
 *   - search: busca por nome ou email
 *   - page: numero da pagina (default: 1)
 *   - limit: itens por pagina (default: 20)
 */
async function handleGet(request: Request) {
  try {
    await requirePermission('SUBSCRIPTIONS');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const nannyId = searchParams.get('nannyId');
    const familyId = searchParams.get('familyId');
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

    // Filtro por plano
    if (plan) {
      where.plan = plan;
    }

    // Filtro por nannyId
    if (nannyId) {
      where.nannyId = parseInt(nannyId);
    }

    // Filtro por familyId
    if (familyId) {
      where.familyId = parseInt(familyId);
    }

    // Busca por nome ou email (nanny ou family)
    if (search) {
      where.OR = [
        { nanny: { name: { contains: search, mode: 'insensitive' } } },
        { nanny: { emailAddress: { contains: search, mode: 'insensitive' } } },
        { family: { name: { contains: search, mode: 'insensitive' } } },
        { family: { emailAddress: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
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
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
              paidAt: true,
            },
          },
          appliedCoupon: {
            select: {
              id: true,
              code: true,
              discountType: true,
              discountValue: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    return NextResponse.json({
      subscriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar assinaturas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
