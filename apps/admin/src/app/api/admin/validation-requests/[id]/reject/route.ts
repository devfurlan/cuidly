import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { logAudit } from '@/utils/auditLog';
import { z } from 'zod';

type RouteParams = {
  params: Promise<{ id: string }>;
};

const RejectSchema = z.object({
  reason: z.string().min(1, 'Motivo é obrigatório'),
});

/**
 * POST /api/admin/validation-requests/[id]/reject
 * Rejeita manualmente uma solicitação de validação
 */
async function handlePost(request: Request, context: RouteParams) {
  try {
    const admin = await requirePermission('VALIDATIONS');
    const { id } = await context.params;

    const body = await request.json();
    const validationResult = RejectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { reason } = validationResult.data;

    const validationRequest = await prisma.validationRequest.findUnique({
      where: { id },
      include: {
        nanny: true,
      },
    });

    if (!validationRequest) {
      return NextResponse.json(
        { error: 'Solicitação de validação não encontrada' },
        { status: 404 }
      );
    }

    if (validationRequest.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Esta validação já foi concluida' },
        { status: 400 }
      );
    }

    // Update validation request status
    const updatedValidation = await prisma.validationRequest.update({
      where: { id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
      },
    });

    // Update nanny profile with rejection message
    await prisma.nanny.update({
      where: { id: validationRequest.nannyId },
      data: {
        documentValidationMessage: `Rejeitado: ${reason}`,
      },
    });

    // Log the action
    await logAudit({
      action: 'REJECT',
      table: 'validation_requests',
      recordId: id,
      data: {
        nannyId: validationRequest.nannyId,
        nannyName: validationRequest.nanny.name,
        level: validationRequest.level,
        rejectedBy: admin.email,
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      validationRequest: updatedValidation,
    });
  } catch (error) {
    console.error('Error rejecting validation request:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao rejeitar validação';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = withAuth(handlePost);
