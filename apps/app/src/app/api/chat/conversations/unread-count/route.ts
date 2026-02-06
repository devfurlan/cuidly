import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * GET /api/chat/conversations/unread-count
 * Retorna o número total de mensagens não lidas para o usuário atual
 * Também retorna contagem por conversa para sincronizar a sidebar
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar participações do usuário atual
    const participantWhere = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    // Buscar todas as participações com lastReadAt
    const participants = await prisma.participant.findMany({
      where: participantWhere,
      select: {
        id: true,
        conversationId: true,
        lastReadAt: true,
        nannyId: true,
        familyId: true,
      },
    });

    const allConversationIds: string[] = [];
    const conversationsWithUnread: string[] = [];
    const unreadByConversation: Record<string, number> = {};
    let totalUnreadMessages = 0;

    // Para cada participação, contar mensagens não lidas
    for (const participant of participants) {
      allConversationIds.push(participant.conversationId);

      // Condição para mensagens não lidas:
      // 1. Mensagem após lastReadAt (ou todas se lastReadAt é null)
      // 2. Mensagem não enviada pelo próprio usuário
      const senderCondition = currentUser.type === 'nanny'
        ? { senderNannyId: { not: currentUser.nanny.id } }
        : { senderFamilyId: { not: currentUser.family.id } };

      const unreadMessages = await prisma.message.count({
        where: {
          conversationId: participant.conversationId,
          deletedAt: null,
          ...senderCondition,
          // Mensagens após lastReadAt (ou todas se nunca leu)
          ...(participant.lastReadAt
            ? { createdAt: { gt: participant.lastReadAt } }
            : {}),
        },
      });

      if (unreadMessages > 0) {
        conversationsWithUnread.push(participant.conversationId);
        unreadByConversation[participant.conversationId] = unreadMessages;
        totalUnreadMessages += unreadMessages;
      }
    }

    // Entity ID para o cliente saber quem é o usuário
    const entityId = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    return NextResponse.json({
      unreadCount: totalUnreadMessages,
      conversationsWithUnread,
      unreadByConversation,
      allConversationIds,
      entityId,
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
