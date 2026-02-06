import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getFirstName } from '@/utils/slug';

interface RouteParams {
  params: Promise<{ conversationId: string }>;
}

// Online if lastActivityAt is within the last 5 minutes
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

function isUserOnline(lastActivityAt: Date | null): boolean {
  if (!lastActivityAt) return false;
  return Date.now() - lastActivityAt.getTime() < ONLINE_THRESHOLD_MS;
}

/**
 * GET /api/chat/conversations/[conversationId]
 * Retorna o histórico de mensagens de uma conversa específica
 * Suporta paginação via query params: cursor e limit
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { conversationId } = await params;

    // Verificar se o usuário é participante desta conversa
    const participantWhere = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id, conversationId }
      : { familyId: currentUser.family.id, conversationId };

    const participant = await prisma.participant.findFirst({
      where: participantWhere,
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Você não tem acesso a esta conversa' },
        { status: 403 }
      );
    }

    // Parâmetros de paginação
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor'); // Agora é seq (BigInt como string)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Buscar mensagens com paginação baseada em seq (cursor forte e monotônico)
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
        ...(cursor && { seq: { lt: BigInt(cursor) } }), // Mensagens com seq menor que o cursor
      },
      orderBy: { seq: 'desc' },
      take: limit + 1, // Pegar um a mais para saber se há mais páginas
      select: {
        id: true,
        body: true,
        seq: true,
        senderNannyId: true,
        senderFamilyId: true,
        createdAt: true,
        senderNanny: {
          select: { id: true, name: true, photoUrl: true },
        },
        senderFamily: {
          select: { id: true, name: true, photoUrl: true },
        },
      },
    });

    // Verificar se há mais páginas
    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop(); // Remover o item extra
    }

    // Buscar informações da conversa e do outro participante
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            nanny: {
              select: { id: true, name: true, photoUrl: true, lastActivityAt: true },
            },
            family: {
              select: { id: true, name: true, photoUrl: true, lastActivityAt: true },
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

    // Encontrar o outro participante
    const otherParticipant = conversation.participants.find((p) => {
      if (currentUser.type === 'nanny') {
        return p.nannyId !== currentUser.nanny.id;
      }
      return p.familyId !== currentUser.family.id;
    });

    let otherName = 'Usuário';
    let otherPhoto: string | null = null;
    let otherRole: 'NANNY' | 'FAMILY' | null = null;
    let otherId: number | null = null;
    let otherLastReadSeq: string | null = null;
    let otherIsOnline = false;

    if (otherParticipant?.nanny) {
      otherRole = 'NANNY';
      otherId = otherParticipant.nanny.id;
      // Para babás, mostrar apenas o primeiro nome (privacidade)
      otherName = otherParticipant.nanny.name ? getFirstName(otherParticipant.nanny.name) : 'Babá';
      otherPhoto = otherParticipant.nanny.photoUrl;
      otherIsOnline = isUserOnline(otherParticipant.nanny.lastActivityAt);
    } else if (otherParticipant?.family) {
      otherRole = 'FAMILY';
      otherId = otherParticipant.family.id;
      otherName = otherParticipant.family.name || 'Família';
      otherPhoto = otherParticipant.family.photoUrl;
      otherIsOnline = isUserOnline(otherParticipant.family.lastActivityAt);
    }

    // Buscar o seq da última mensagem lida pelo outro participante
    if (otherParticipant?.lastReadMessageId) {
      const lastReadMessage = await prisma.message.findUnique({
        where: { id: otherParticipant.lastReadMessageId },
        select: { seq: true },
      });
      if (lastReadMessage) {
        otherLastReadSeq = lastReadMessage.seq.toString();
      }
    }

    // Formatar mensagens
    const formattedMessages = messages.map((msg) => {
      let senderName = 'Usuário';
      let senderPhoto: string | null = null;
      let senderRole: 'NANNY' | 'FAMILY';
      let senderId: number | null = null;

      if (msg.senderNanny) {
        senderRole = 'NANNY';
        senderId = msg.senderNanny.id;
        // Para babás, mostrar apenas o primeiro nome (privacidade)
        senderName = msg.senderNanny.name ? getFirstName(msg.senderNanny.name) : 'Babá';
        senderPhoto = msg.senderNanny.photoUrl;
      } else if (msg.senderFamily) {
        senderRole = 'FAMILY';
        senderId = msg.senderFamily.id;
        senderName = msg.senderFamily.name || 'Família';
        senderPhoto = msg.senderFamily.photoUrl;
      } else {
        senderRole = 'FAMILY'; // fallback
      }

      // Check if message is from current user
      let isFromMe = false;
      if (currentUser.type === 'nanny') {
        isFromMe = msg.senderNannyId === currentUser.nanny.id;
      } else {
        isFromMe = msg.senderFamilyId === currentUser.family.id;
      }

      return {
        id: msg.id,
        body: msg.body,
        seq: msg.seq.toString(), // BigInt serializado como string
        createdAt: msg.createdAt,
        isFromMe,
        sender: {
          id: senderId,
          name: senderName,
          photoUrl: senderPhoto,
          role: senderRole,
        },
      };
    });

    // Reverter ordem para cronológica (mais antigas primeiro)
    formattedMessages.reverse();

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        createdAt: conversation.createdAt,
        otherParticipant: {
          id: otherId,
          name: otherName,
          photoUrl: otherPhoto,
          role: otherRole,
          lastReadSeq: otherLastReadSeq,
          isOnline: otherIsOnline,
        },
      },
      messages: formattedMessages,
      pagination: {
        hasMore,
        nextCursor: hasMore ? messages[messages.length - 1]?.seq.toString() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
