import { withPermission } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auditService } from '@/services/auditService';
import { UserWithPermissions } from '@/lib/auth/checkPermission';

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/conversations/[id]
 * Retorna o historico completo de uma conversa
 * IMPORTANTE: Este endpoint registra um evento de auditoria sempre que acessado
 */
async function handleGet(
  _request: Request,
  context: RouteParams | undefined,
  admin: UserWithPermissions
) {
  try {
    const { id } = await context!.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            nanny: {
              select: {
                id: true,
                name: true,
                emailAddress: true,
                photoUrl: true,
              },
            },
            family: {
              select: {
                id: true,
                name: true,
                emailAddress: true,
                photoUrl: true,
              },
            },
          },
        },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          include: {
            senderNanny: {
              select: {
                id: true,
                name: true,
                emailAddress: true,
                photoUrl: true,
              },
            },
            senderFamily: {
              select: {
                id: true,
                name: true,
                emailAddress: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Log access to conversation for audit purposes (MANDATORY)
    await auditService.logConversationView(
      id,
      admin.email,
      conversation.participants.map((p) => ({
        nannyId: p.nannyId,
        familyId: p.familyId,
        name: p.nanny?.name || p.family?.name || '',
        email: p.nanny?.emailAddress || p.family?.emailAddress || '',
        role: p.nannyId ? 'nanny' : 'family',
      }))
    );

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar conversa';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withPermission('CHAT_MODERATION', handleGet);
