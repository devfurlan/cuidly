import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, getSubscriptionParams } from '@/lib/auth/getCurrentUser';
import {
  canStartConversation,
  getTotalConversationCount,
  getMaxConversations,
  getSubscription
} from '@/services/subscription';
import { getFirstName } from '@/utils/slug';

/**
 * GET /api/chat/conversations
 * Retorna a lista de conversas do usuário autenticado
 * Inclui o outro participante, última mensagem e contagem de não lidas
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Build the where clause based on user type
    const participantWhere = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    // Buscar conversas onde o usuário é participante
    // Usando campos desnormalizados para evitar nested query de última mensagem
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: participantWhere,
        },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        lastMessageId: true,
        lastMessageAt: true,
        lastMessagePreview: true,
        participants: {
          include: {
            nanny: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
              },
            },
            family: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
    });

    // Calcular unread usando lastReadAt do participant vs lastMessageAt da conversa
    // Função helper para verificar se há mensagens não lidas (0 ou 1)
    const hasUnread = (
      conv: { lastMessageAt: Date | null },
      myParticipant: { lastReadAt: Date | null; nannyId: number | null; familyId: number | null } | undefined
    ): number => {
      if (!conv.lastMessageAt || !myParticipant) return 0;
      if (!myParticipant.lastReadAt) return 1; // Nunca leu = tem não lidas
      return conv.lastMessageAt > myParticipant.lastReadAt ? 1 : 0;
    };

    // Formatar resposta
    const formattedConversations = conversations.map((conv) => {
      // Encontrar meu participante (para calcular unread)
      const myParticipant = conv.participants.find((p) => {
        if (currentUser.type === 'nanny') {
          return p.nannyId === currentUser.nanny.id;
        }
        return p.familyId === currentUser.family.id;
      });

      // Encontrar o outro participante (não o usuário atual)
      const otherParticipant = conv.participants.find((p) => {
        if (currentUser.type === 'nanny') {
          return p.nannyId !== currentUser.nanny.id;
        }
        return p.familyId !== currentUser.family.id;
      });

      // Determinar nome, foto e role do outro participante
      let otherName = 'Usuário';
      let otherPhoto: string | null = null;
      let otherRole: 'NANNY' | 'FAMILY' | null = null;
      let otherId: number | null = null;

      if (otherParticipant?.nanny) {
        otherRole = 'NANNY';
        otherId = otherParticipant.nanny.id;
        // Para babás, mostrar apenas o primeiro nome (privacidade)
        otherName = otherParticipant.nanny.name ? getFirstName(otherParticipant.nanny.name) : 'Babá';
        otherPhoto = otherParticipant.nanny.photoUrl;
      } else if (otherParticipant?.family) {
        otherRole = 'FAMILY';
        otherId = otherParticipant.family.id;
        otherName = otherParticipant.family.name || 'Família';
        otherPhoto = otherParticipant.family.photoUrl;
      }

      // Calcular unread baseado em lastReadAt vs lastMessageAt
      const unreadCount = hasUnread(conv, myParticipant);

      // Verificar se a última mensagem é minha (para mostrar "isRead" corretamente)
      // Se não tenho lastMessageId, não há mensagens
      const hasLastMessage = conv.lastMessageAt !== null;

      return {
        id: conv.id,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        otherParticipant: {
          id: otherId,
          name: otherName,
          photoUrl: otherPhoto,
          role: otherRole,
        },
        lastMessage: hasLastMessage
          ? {
              id: conv.lastMessageId,
              body: conv.lastMessagePreview || '',
              isRead: unreadCount === 0, // Se não há unread, está lida
              createdAt: conv.lastMessageAt,
              isFromMe: false, // Não temos essa info desnormalizada, mas não é crítico para listagem
            }
          : null,
        unreadCount,
      };
    });

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/conversations
 * Cria uma nova conversa entre o usuário autenticado e um destinatário
 * Se já existir uma conversa entre eles, retorna a existente
 *
 * Body: { recipientNannyId?: number, recipientFamilyId?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientNannyId, recipientFamilyId } = body;

    if (!recipientNannyId && !recipientFamilyId) {
      return NextResponse.json(
        { error: 'recipientNannyId ou recipientFamilyId é obrigatório' },
        { status: 400 }
      );
    }

    // Prevent conversation with self
    if (currentUser.type === 'nanny' && recipientNannyId === currentUser.nanny.id) {
      return NextResponse.json(
        { error: 'Não é possível criar uma conversa consigo mesmo' },
        { status: 400 }
      );
    }
    if (currentUser.type === 'family' && recipientFamilyId === currentUser.family.id) {
      return NextResponse.json(
        { error: 'Não é possível criar uma conversa consigo mesmo' },
        { status: 400 }
      );
    }

    // Verificar se o destinatário existe
    let recipientName = 'Usuário';
    let recipientPhoto: string | null = null;
    let recipientRole: 'NANNY' | 'FAMILY';

    if (recipientNannyId) {
      const nanny = await prisma.nanny.findUnique({
        where: { id: recipientNannyId },
        select: { id: true, name: true, photoUrl: true },
      });
      if (!nanny) {
        return NextResponse.json(
          { error: 'Destinatário não encontrado' },
          { status: 404 }
        );
      }
      recipientName = nanny.name ? getFirstName(nanny.name) : 'Babá';
      recipientPhoto = nanny.photoUrl;
      recipientRole = 'NANNY';
    } else {
      const family = await prisma.family.findUnique({
        where: { id: recipientFamilyId },
        select: { id: true, name: true, photoUrl: true },
      });
      if (!family) {
        return NextResponse.json(
          { error: 'Destinatário não encontrado' },
          { status: 404 }
        );
      }
      recipientName = family.name || 'Família';
      recipientPhoto = family.photoUrl;
      recipientRole = 'FAMILY';
    }

    // Verificar se é uma família tentando contatar uma babá
    if (currentUser.type === 'family' && recipientNannyId) {
      // Verificar limite total de conversas
      const subscriptionParams = getSubscriptionParams(currentUser);
      const recipientLookup = { nannyId: recipientNannyId };
      const canStartResult = await canStartConversation(subscriptionParams, recipientLookup);

      if (!canStartResult.canStart) {
        return NextResponse.json(
          {
            error: canStartResult.reason,
            code: canStartResult.code,
            conversationsUsed: canStartResult.conversationsUsed,
            conversationLimit: canStartResult.conversationLimit,
          },
          { status: 403 }
        );
      }
    }

    // Verificar se já existe uma conversa entre os dois
    const currentParticipantWhere = currentUser.type === 'nanny'
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    const recipientParticipantWhere = recipientNannyId
      ? { nannyId: recipientNannyId }
      : { familyId: recipientFamilyId };

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: currentParticipantWhere } },
          { participants: { some: recipientParticipantWhere } },
        ],
      },
    });

    if (existingConversation) {
      return NextResponse.json({
        conversation: {
          id: existingConversation.id,
          createdAt: existingConversation.createdAt,
          isExisting: true,
        },
        message: 'Conversa já existente',
      });
    }

    // Criar nova conversa com os dois participantes
    const participantData = currentUser.type === 'nanny'
      ? [
          { nannyId: currentUser.nanny.id },
          recipientNannyId ? { nannyId: recipientNannyId } : { familyId: recipientFamilyId },
        ]
      : [
          { familyId: currentUser.family.id },
          recipientNannyId ? { nannyId: recipientNannyId } : { familyId: recipientFamilyId },
        ];

    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: participantData,
        },
      },
    });

    // Obter informações de limite para resposta
    let conversationInfo = {};
    if (currentUser.type === 'family') {
      const subscriptionParams = getSubscriptionParams(currentUser);
      const subscription = await getSubscription(subscriptionParams);
      if (subscription) {
        const conversationsUsed = await getTotalConversationCount(subscriptionParams);
        const conversationLimit = getMaxConversations(subscription.plan);
        conversationInfo = {
          conversationsUsed,
          conversationLimit,
          remainingConversations: conversationLimit === -1 ? -1 : conversationLimit - conversationsUsed,
        };
      }
    }

    return NextResponse.json({
      conversation: {
        id: newConversation.id,
        createdAt: newConversation.createdAt,
        isExisting: false,
        otherParticipant: {
          id: recipientNannyId || recipientFamilyId,
          name: recipientName,
          photoUrl: recipientPhoto,
          role: recipientRole,
        },
      },
      ...conversationInfo,
      message: 'Conversa criada com sucesso',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
