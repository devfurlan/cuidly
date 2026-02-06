import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/validation-requests/[id]
 * Retorna os detalhes de uma solicitação de validação
 */
async function handleGet(_request: Request, context: RouteParams) {
  try {
    await requirePermission('VALIDATIONS');
    const { id } = await context.params;

    const validationRequest = await prisma.validationRequest.findUnique({
      where: { id },
      include: {
        nanny: {
          select: {
            id: true,
            name: true,
            slug: true,
            photoUrl: true,
            emailAddress: true,
            phoneNumber: true,
            birthDate: true,
            documentValidated: true,
            documentExpirationDate: true,
            documentValidationDate: true,
            documentValidationMessage: true,
            criminalBackgroundValidated: true,
            criminalBackgroundValidationDate: true,
            criminalBackgroundValidationMessage: true,
            personalDataValidated: true,
            personalDataValidatedAt: true,
            personalDataValidatedBy: true,
            documentUploads: {
              select: {
                id: true,
                type: true,
                url: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!validationRequest) {
      return NextResponse.json(
        { error: 'Solicitação de validação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ validationRequest });
  } catch (error) {
    console.error('Error fetching validation request:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar validação';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
