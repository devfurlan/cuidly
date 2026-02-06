import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { logAudit } from '@/utils/auditLog';

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * DELETE /api/admin/messages/[id]
 * Soft delete de uma mensagem especifica
 */
async function handleDelete(request: Request, context: RouteParams) {
  try {
    const admin = await requirePermission('CHAT_MODERATION');
    const { id } = await context.params;

    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Moderacao administrativa';

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        senderNanny: {
          select: {
            id: true,
            name: true,
            emailAddress: true,
          },
        },
        senderFamily: {
          select: {
            id: true,
            name: true,
            emailAddress: true,
          },
        },
        conversation: {
          include: {
            participants: {
              include: {
                nanny: {
                  select: {
                    id: true,
                    name: true,
                    emailAddress: true,
                  },
                },
                family: {
                  select: {
                    id: true,
                    name: true,
                    emailAddress: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem não encontrada' },
        { status: 404 }
      );
    }

    if (message.deletedAt) {
      return NextResponse.json(
        { error: 'Mensagem já foi deletada' },
        { status: 400 }
      );
    }

    // Soft delete the message
    const deletedMessage = await prisma.message.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: admin.id,
      },
    });

    // Log the action
    const senderName = message.senderNanny?.name || message.senderFamily?.name || '';
    const senderEmail = message.senderNanny?.emailAddress || message.senderFamily?.emailAddress || '';

    await logAudit({
      action: 'DELETE_MESSAGE',
      table: 'messages',
      recordId: id,
      data: {
        conversationId: message.conversationId,
        senderNannyId: message.senderNannyId,
        senderFamilyId: message.senderFamilyId,
        senderName,
        senderEmail,
        messageBody: message.body.substring(0, 200), // Truncate for audit
        deletedBy: admin.email,
        reason,
        participants: message.conversation.participants.map((p) => ({
          nannyId: p.nannyId,
          familyId: p.familyId,
          name: p.nanny?.name || p.family?.name || '',
          email: p.nanny?.emailAddress || p.family?.emailAddress || '',
        })),
      },
    });

    return NextResponse.json({ success: true, message: deletedMessage });
  } catch (error) {
    console.error('Error deleting message:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao deletar mensagem';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const DELETE = withAuth(handleDelete);
