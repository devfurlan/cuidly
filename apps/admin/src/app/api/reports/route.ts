import { withPermission } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: Promise<Record<string, string>>;
}

async function handleGet(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (status !== 'all') where.status = status;
    if (type !== 'all') where.targetType = type;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          targetNanny: { select: { id: true, name: true, slug: true, photoUrl: true } },
          targetJob: { select: { id: true, title: true } },
          reporterNanny: { select: { id: true, name: true } },
          reporterFamily: { select: { id: true, name: true } },
          actionTakenBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Erro ao buscar denuncias' }, { status: 500 });
  }
}

export const GET = withPermission<RouteContext>('REPORTS', handleGet);
