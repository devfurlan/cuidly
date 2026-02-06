import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, getSubscriptionParams } from '@/lib/auth/getCurrentUser';
import { canNannySendMessage, isJobExpired } from '@/services/subscription';
import { getFirstName } from '@/utils/slug';
import { createAdminClient } from '@/utils/supabase/server';

interface RouteParams {
  params: Promise<{ conversationId: string }>;
}

/**
 * POST /api/chat/conversations/[conversationId]/messages
 * Envia uma nova mensagem para uma conversa específica
 * O sender é automaticamente o usuário autenticado
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Buscar dados da conversa
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { jobId: true },
    });

    // Se é uma babá, verificar regras de mensagem
    if (currentUser.type === 'nanny') {
      const subscriptionParams = getSubscriptionParams(currentUser);
      const canSendResult = await canNannySendMessage(subscriptionParams, conversationId);

      if (!canSendResult.canSend) {
        return NextResponse.json(
          {
            error: canSendResult.reason,
            code: canSendResult.code,
          },
          { status: 403 }
        );
      }
    }

    // Se a conversa está associada a uma vaga, verificar se expirou
    if (conversation?.jobId && currentUser.type === 'family') {
      // Buscar a família dona da vaga
      const job = await prisma.job.findUnique({
        where: { id: conversation.jobId },
        select: { familyId: true },
      });

      // Se o usuário é da família dona da vaga, verificar expiração
      if (job?.familyId === currentUser.family.id) {
        const subscriptionParams = getSubscriptionParams(currentUser);
        const expirationResult = await isJobExpired(subscriptionParams, conversation.jobId);

        if (expirationResult.isExpired) {
          return NextResponse.json(
            {
              error: expirationResult.reason,
              code: 'JOB_EXPIRED',
            },
            { status: 403 }
          );
        }
      }
    }

    const body = await request.json();
    const { body: messageBody } = body;

    if (!messageBody || typeof messageBody !== 'string') {
      return NextResponse.json(
        { error: 'O corpo da mensagem é obrigatório' },
        { status: 400 }
      );
    }

    const trimmedBody = messageBody.trim();
    if (trimmedBody.length === 0) {
      return NextResponse.json(
        { error: 'A mensagem não pode estar vazia' },
        { status: 400 }
      );
    }

    if (trimmedBody.length > 5000) {
      return NextResponse.json(
        { error: 'A mensagem não pode ter mais de 5000 caracteres' },
        { status: 400 }
      );
    }

    // Criar a mensagem e atualizar campos desnormalizados da conversa em uma transação
    const senderData = currentUser.type === 'nanny'
      ? { senderNannyId: currentUser.nanny.id }
      : { senderFamilyId: currentUser.family.id };

    const now = new Date();
    const messagePreview = trimmedBody.substring(0, 100);

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          ...senderData,
          body: trimmedBody,
        },
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
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: {
          updatedAt: now,
          lastMessageAt: now,
          lastMessagePreview: messagePreview,
        },
      }),
    ]);

    // Atualizar lastMessageId após ter o ID da mensagem
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageId: message.id },
    });

    // Broadcast da nova mensagem para notificar outros participantes em tempo real
    // Usando Supabase Broadcast (não depende de RLS como Postgres Changes)
    try {
      const supabaseAdmin = createAdminClient();
      const channel = supabaseAdmin.channel('new-messages');

      await channel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: {
          conversationId,
          messageId: message.id,
          body: trimmedBody,
          createdAt: message.createdAt.toISOString(),
          senderNannyId: message.senderNannyId,
          senderFamilyId: message.senderFamilyId,
        },
      });

      // Cleanup: remover o canal após enviar
      await supabaseAdmin.removeChannel(channel);
    } catch (broadcastError) {
      // Log do erro mas não falha a requisição - a mensagem já foi salva
      console.error('Erro ao fazer broadcast da mensagem:', broadcastError);
    }

    // Formatar resposta
    let senderName = 'Usuário';
    let senderPhoto: string | null = null;
    let senderRole: 'NANNY' | 'FAMILY';
    let senderId: number | null = null;

    if (message.senderNanny) {
      senderRole = 'NANNY';
      senderId = message.senderNanny.id;
      // Para babás, mostrar apenas o primeiro nome (privacidade)
      senderName = message.senderNanny.name ? getFirstName(message.senderNanny.name) : 'Babá';
      senderPhoto = message.senderNanny.photoUrl;
    } else if (message.senderFamily) {
      senderRole = 'FAMILY';
      senderId = message.senderFamily.id;
      senderName = message.senderFamily.name || 'Família';
      senderPhoto = message.senderFamily.photoUrl;
    } else {
      senderRole = 'FAMILY'; // fallback
    }

    return NextResponse.json({
      message: {
        id: message.id,
        body: message.body,
        seq: message.seq.toString(), // BigInt serializado como string
        createdAt: message.createdAt,
        isFromMe: true,
        sender: {
          id: senderId,
          name: senderName,
          photoUrl: senderPhoto,
          role: senderRole,
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chat/conversations/[conversationId]/messages
 * Marca mensagens como lidas atualizando lastReadAt do participante
 * Body: { markAllAsRead: true } (messageIds ignorado - sempre marca todas)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Buscar a última mensagem da conversa para registrar lastReadMessageId
    const lastMessage = await prisma.message.findFirst({
      where: { conversationId, deletedAt: null },
      orderBy: { seq: 'desc' },
      select: { id: true, seq: true, createdAt: true },
    });

    // Atualizar lastReadAt do participante (uma única operação, não N updates em messages)
    await prisma.participant.update({
      where: { id: participant.id },
      data: {
        lastReadAt: new Date(),
        lastReadMessageId: lastMessage?.id ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      lastReadAt: new Date().toISOString(),
      lastReadSeq: lastMessage?.seq?.toString() ?? null,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
