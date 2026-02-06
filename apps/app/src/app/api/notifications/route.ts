import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * GET /api/notifications - List notifications for the current user
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Build where clause based on user type
    const whereClause = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : currentUser.type === 'family'
        ? { familyId: currentUser.family.id }
        : null;

    if (!whereClause) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        ...whereClause,
        isRead: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications - Mark notifications as read
 * Query params:
 *   - id: notification id or 'all' to mark all as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Build where clause based on user type
    const whereClause = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : currentUser.type === 'family'
        ? { familyId: currentUser.family.id }
        : null;

    if (!whereClause) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id === 'all') {
      // Marcar todas como lidas
      await prisma.notification.updateMany({
        where: {
          ...whereClause,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } else if (id) {
      // Marcar uma como lida
      await prisma.notification.updateMany({
        where: {
          id,
          ...whereClause,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
