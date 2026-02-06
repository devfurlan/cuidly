import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { logAudit } from '@/utils/auditLog';
import { z } from 'zod';

type RouteParams = {
  params: Promise<{ id: string }>;
};

const UpdateJobSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'CLOSED']).optional(),
  moderationReason: z.string().optional(),
});

/**
 * GET /api/admin/jobs/[id]
 * Retorna os detalhes de uma vaga especifica, incluindo candidaturas
 */
async function handleGet(_request: Request, context: RouteParams) {
  try {
    await requirePermission('JOBS');
    const { id } = await context.params;

    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            name: true,
            phoneNumber: true,
            emailAddress: true,
            address: true,
          },
        },
        applications: {
          include: {
            nanny: {
              select: {
                id: true,
                name: true,
                slug: true,
                photoUrl: true,
                phoneNumber: true,
                emailAddress: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Error fetching job:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar vaga';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/jobs/[id]
 * Atualiza os dados de uma vaga (para correcao de texto ou moderacao)
 */
async function handlePut(request: Request, context: RouteParams) {
  try {
    await requirePermission('JOBS');
    const { id } = await context.params;

    const body = await request.json();
    const validationResult = UpdateJobSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existingJob = await prisma.job.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
      },
      include: {
        family: {
          select: { id: true, name: true, name: true },
        },
      },
    });

    await logAudit({
      action: 'UPDATE',
      table: 'jobs',
      recordId: job.id.toString(),
      data: {
        changes: data,
        moderationReason: data.moderationReason,
      },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Error updating job:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao atualizar vaga';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/jobs/[id]
 * Desativa uma vaga (soft delete) com motivo de moderacao
 */
async function handleDelete(request: Request, context: RouteParams) {
  try {
    await requirePermission('JOBS');
    const { id } = await context.params;

    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Moderacao administrativa';

    const existingJob = await prisma.job.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: {
        status: 'CLOSED',
        deletedAt: new Date(),
      },
    });

    await logAudit({
      action: 'DELETE',
      table: 'jobs',
      recordId: job.id.toString(),
      data: {
        moderationReason: reason,
        previousStatus: existingJob.status,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('Error deleting job:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao desativar vaga';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const PUT = withAuth(handlePut);
export const DELETE = withAuth(handleDelete);
