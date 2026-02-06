import { withPermission, type UserWithPermissions } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const actionSchema = z.object({
  action: z.enum(['dismiss', 'suspend', 'delete']),
  actionNote: z.string().optional(),
});

async function handleGet(
  _request: Request,
  context: RouteContext | undefined
) {
  try {
    if (!context) {
      return NextResponse.json({ error: 'Contexto inválido' }, { status: 400 });
    }

    const { id } = await context.params;
    const reportId = parseInt(id);

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        targetNanny: {
          select: {
            id: true,
            name: true,
            slug: true,
            photoUrl: true,
            status: true,
            emailAddress: true,
          },
        },
        targetJob: {
          select: {
            id: true,
            title: true,
            status: true,
            family: { select: { id: true, name: true } },
          },
        },
        reporterNanny: { select: { id: true, name: true } },
        reporterFamily: { select: { id: true, name: true } },
        actionTakenBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Denúncia não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Erro ao buscar denuncia' }, { status: 500 });
  }
}

async function handlePatch(
  request: Request,
  context: RouteContext | undefined,
  user: UserWithPermissions
) {
  try {
    if (!context) {
      return NextResponse.json({ error: 'Contexto inválido' }, { status: 400 });
    }

    const { id } = await context.params;
    const reportId = parseInt(id);
    const body = await request.json();

    const validation = actionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { action, actionNote } = validation.data;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        targetNanny: true,
        targetJob: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Denúncia não encontrada' }, { status: 404 });
    }

    // Execute action based on type
    await prisma.$transaction(async (tx) => {
      // Update report status
      await tx.report.update({
        where: { id: reportId },
        data: {
          status: action === 'dismiss' ? 'DISMISSED' : 'REVIEWED',
          action: action === 'dismiss' ? 'DISMISSED' : action === 'suspend' ? 'SUSPENDED' : 'DELETED',
          actionTakenAt: new Date(),
          actionTakenById: user.id,
          actionNote: actionNote || null,
        },
      });

      // Apply action to target
      if (action === 'suspend') {
        if (report.targetType === 'NANNY' && report.targetNannyId) {
          await tx.nanny.update({
            where: { id: report.targetNannyId },
            data: { status: 'SUSPENDED' },
          });
        } else if (report.targetType === 'JOB' && report.targetJobId) {
          await tx.job.update({
            where: { id: report.targetJobId },
            data: { status: 'PAUSED' },
          });
        }
      } else if (action === 'delete') {
        if (report.targetType === 'NANNY' && report.targetNannyId) {
          await tx.nanny.update({
            where: { id: report.targetNannyId },
            data: { status: 'DELETED', deletedAt: new Date() },
          });
        } else if (report.targetType === 'JOB' && report.targetJobId) {
          await tx.job.update({
            where: { id: report.targetJobId },
            data: { status: 'CLOSED', deletedAt: new Date() },
          });
        }
      }
    });

    const actionMessages: Record<string, string> = {
      dismiss: 'Denuncia dispensada com sucesso',
      suspend: 'Alvo suspenso com sucesso',
      delete: 'Alvo excluído com sucesso',
    };

    return NextResponse.json({
      success: true,
      message: actionMessages[action],
    });
  } catch (error) {
    console.error('Error processing report action:', error);
    return NextResponse.json({ error: 'Erro ao processar acao' }, { status: 500 });
  }
}

export const GET = withPermission<RouteContext>('REPORTS', handleGet);
export const PATCH = withPermission<RouteContext>('REPORTS', handlePatch);
