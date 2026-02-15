import { withPermission } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: Promise<Record<string, string>>;
}

async function handleGet() {
  try {
    const [total, open, inProgress, resolved, closed, positive, negative] =
      await Promise.all([
        prisma.supportTicket.count(),
        prisma.supportTicket.count({ where: { status: 'OPEN' } }),
        prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
        prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
        prisma.supportTicket.count({ where: { satisfactionRating: true } }),
        prisma.supportTicket.count({ where: { satisfactionRating: false } }),
      ]);

    return NextResponse.json({
      total,
      open,
      inProgress,
      resolved,
      closed,
      positive,
      negative,
    });
  } catch (error) {
    console.error('Error fetching support stats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 },
    );
  }
}

export const GET = withPermission<RouteContext>('SUPPORT', handleGet);
