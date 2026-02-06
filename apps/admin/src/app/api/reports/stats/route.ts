import { withPermission } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: Promise<Record<string, string>>;
}

async function handleGet() {
  try {
    const [total, pending, reviewed, dismissed, byType] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'REVIEWED' } }),
      prisma.report.count({ where: { status: 'DISMISSED' } }),
      prisma.report.groupBy({
        by: ['targetType'],
        _count: true,
      }),
    ]);

    return NextResponse.json({
      total,
      pending,
      reviewed,
      dismissed,
      byType: {
        nanny: byType.find(t => t.targetType === 'NANNY')?._count || 0,
        job: byType.find(t => t.targetType === 'JOB')?._count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatisticas' }, { status: 500 });
  }
}

export const GET = withPermission<RouteContext>('REPORTS', handleGet);
