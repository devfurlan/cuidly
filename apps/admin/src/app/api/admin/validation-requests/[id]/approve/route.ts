import { withPermission } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auditService } from '@/services/auditService';
import { UserWithPermissions } from '@/lib/auth/checkPermission';

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/admin/validation-requests/[id]/approve
 * Aprova manualmente uma solicitação de validação
 */
async function handlePost(
  _request: Request,
  context: RouteParams | undefined,
  admin: UserWithPermissions
) {
  try {
    const { id } = await context!.params;

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
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Update nanny profile based on validation level
    const nannyUpdateData: Record<string, unknown> = {
      documentValidated: true,
      documentExpirationDate: null,
      documentValidationDate: new Date(),
      documentValidationMessage: 'Aprovado manualmente por administrador',
      personalDataValidated: true,
      personalDataValidatedAt: new Date(),
      personalDataValidatedBy: admin.id,
    };

    // If PREMIUM level, also mark criminal background as validated
    if (validationRequest.level === 'PREMIUM') {
      nannyUpdateData.criminalBackgroundValidated = true;
      nannyUpdateData.criminalBackgroundValidationDate = new Date();
      nannyUpdateData.criminalBackgroundValidationMessage =
        'Aprovado manualmente por administrador';
    }

    await prisma.nanny.update({
      where: { id: validationRequest.nannyId },
      data: nannyUpdateData,
    });

    // Log the action
    await auditService.logValidationApprove(
      id,
      {
        nannyId: validationRequest.nannyId,
        nannyName: validationRequest.nanny.name,
        level: validationRequest.level,
        previousStatus: validationRequest.status,
      },
      admin.email
    );

    return NextResponse.json({
      success: true,
      validationRequest: updatedValidation,
    });
  } catch (error) {
    console.error('Error approving validation request:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao aprovar validação';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = withPermission('VALIDATIONS', handlePost);
