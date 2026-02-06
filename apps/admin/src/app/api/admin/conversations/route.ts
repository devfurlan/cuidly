import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';

/**
 * GET /api/admin/conversations
 * Lista todas as conversas com filtros
 * Query params:
 *   - search: busca por nome ou email dos participantes
 *   - page: numero da pagina (default 1)
 *   - limit: itens por pagina (default 20)
 */
async function handleGet(request: Request) {
  try {
    await requirePermission('CHAT_MODERATION');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Search filter by participant name or email
    if (search) {
      where.participants = {
        some: {
          OR: [
            { nanny: { name: { contains: search, mode: 'insensitive' } } },
            { nanny: { emailAddress: { contains: search, mode: 'insensitive' } } },
            { family: { name: { contains: search, mode: 'insensitive' } } },
            { family: { emailAddress: { contains: search, mode: 'insensitive' } } },
          ],
        },
      };
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          participants: {
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
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            where: { deletedAt: null },
            select: {
              id: true,
              body: true,
              createdAt: true,
              senderNannyId: true,
              senderFamilyId: true,
            },
          },
          _count: {
            select: {
              messages: {
                where: { deletedAt: null },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.conversation.count({ where }),
    ]);

    return NextResponse.json({
      conversations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar conversas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
