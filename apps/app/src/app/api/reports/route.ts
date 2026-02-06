import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { z } from 'zod';

const createReportSchema = z.object({
  targetType: z.enum(['NANNY', 'JOB']),
  targetId: z.number().positive(),
  reason: z.string().min(10, 'A razão deve ter pelo menos 10 caracteres').max(2000),
});

/**
 * POST /api/reports - Create a new report (public, no auth required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { targetType, targetId, reason } = validation.data;

    // Get current user (optional - can be anonymous)
    const currentUser = await getCurrentUser();

    // Verify target exists and create snapshot
    let targetSnapshot = null;

    if (targetType === 'NANNY') {
      const nanny = await prisma.nanny.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          photoUrl: true,
        },
      });
      if (!nanny) {
        return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
      }
      targetSnapshot = nanny;
    } else {
      const job = await prisma.job.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
        },
      });
      if (!job) {
        return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
      }
      targetSnapshot = job;
    }

    // Extract reporter info
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;

    // Create report
    const report = await prisma.report.create({
      data: {
        targetType,
        targetNannyId: targetType === 'NANNY' ? targetId : null,
        targetJobId: targetType === 'JOB' ? targetId : null,
        reason,
        reporterNannyId: currentUser?.type === 'nanny' ? currentUser.nanny.id : null,
        reporterFamilyId: currentUser?.type === 'family' ? currentUser.family.id : null,
        reporterIp: ip,
        reporterUserAgent: userAgent,
        targetSnapshot,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Denúncia enviada com sucesso. Nossa equipe analisará em breve.',
      reportId: report.id,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
