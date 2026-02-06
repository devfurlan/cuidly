/**
 * Conversations Data Fetching Functions
 * Server-side data fetching for messages page
 */

import prisma from '@/lib/prisma';
import { getFirstName } from '@/utils/slug';

// Online if lastActivityAt is within the last 5 minutes
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

function isUserOnline(lastActivityAt: Date | null): boolean {
  if (!lastActivityAt) return false;
  return Date.now() - lastActivityAt.getTime() < ONLINE_THRESHOLD_MS;
}

export interface ConversationSummary {
  id: string;
  otherParticipant: {
    id: number;
    name: string | null;
    photoUrl: string | null;
    role: 'nanny' | 'family';
    isOnline: boolean;
  };
  lastMessage: {
    body: string;
    createdAt: Date;
    senderNannyId: number | null;
    senderFamilyId: number | null;
  } | null;
  unreadCount: number;
  updatedAt: Date;
}

export async function getConversations(
  authId: string,
  userRole: 'NANNY' | 'FAMILY'
): Promise<ConversationSummary[]> {
  // Get user's entity ID
  let currentEntityId: number | null = null;

  if (userRole === 'NANNY') {
    const nanny = await prisma.nanny.findUnique({
      where: { authId },
      select: { id: true },
    });
    currentEntityId = nanny?.id || null;
  } else {
    const family = await prisma.family.findUnique({
      where: { authId },
      select: { id: true },
    });
    currentEntityId = family?.id || null;
  }

  if (!currentEntityId) {
    return [];
  }

  // Query conversations where user is a participant
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: userRole === 'NANNY'
          ? { nannyId: currentEntityId }
          : { familyId: currentEntityId },
      },
    },
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
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const results: ConversationSummary[] = [];

  for (const conv of conversations) {
    // Find the other participant (not the current user)
    const otherParticipantRecord = conv.participants.find((p) =>
      userRole === 'NANNY' ? p.familyId !== null : p.nannyId !== null
    );

    if (!otherParticipantRecord) continue;

    let otherParticipant: ConversationSummary['otherParticipant'] | null = null;

    if (otherParticipantRecord.nanny) {
      // Para babás, mostrar apenas o primeiro nome (privacidade)
      const nannyName = otherParticipantRecord.nanny.name
        ? getFirstName(otherParticipantRecord.nanny.name)
        : 'Babá';
      otherParticipant = {
        id: otherParticipantRecord.nanny.id,
        name: nannyName,
        photoUrl: otherParticipantRecord.nanny.photoUrl,
        role: 'nanny',
        isOnline: isUserOnline(otherParticipantRecord.nanny.lastActivityAt),
      };
    } else if (otherParticipantRecord.family) {
      otherParticipant = {
        id: otherParticipantRecord.family.id,
        name: otherParticipantRecord.family.name,
        photoUrl: otherParticipantRecord.family.photoUrl,
        role: 'family',
        isOnline: isUserOnline(otherParticipantRecord.family.lastActivityAt),
      };
    }

    if (!otherParticipant) continue;

    const lastMessage = conv.messages[0] || null;

    // Find current user's participant record for this conversation
    const myParticipant = conv.participants.find((p) =>
      userRole === 'NANNY' ? p.nannyId === currentEntityId : p.familyId === currentEntityId
    );

    // Count unread messages (messages from the other participant after my lastReadAt)
    let unreadCount = 0;
    if (myParticipant) {
      const unreadWhere: {
        conversationId: string;
        senderNannyId?: { not: number | null } | null;
        senderFamilyId?: { not: number | null } | null;
        createdAt?: { gt: Date };
      } = {
        conversationId: conv.id,
        // Messages NOT sent by me
        ...(userRole === 'NANNY'
          ? { senderNannyId: null }
          : { senderFamilyId: null }),
      };

      // Only count messages after my lastReadAt
      if (myParticipant.lastReadAt) {
        unreadWhere.createdAt = { gt: myParticipant.lastReadAt };
      }

      unreadCount = await prisma.message.count({
        where: unreadWhere,
      });
    }

    results.push({
      id: conv.id,
      otherParticipant,
      lastMessage: lastMessage
        ? {
            body: lastMessage.body,
            createdAt: lastMessage.createdAt,
            senderNannyId: lastMessage.senderNannyId,
            senderFamilyId: lastMessage.senderFamilyId,
          }
        : null,
      unreadCount,
      updatedAt: conv.updatedAt,
    });
  }

  return results;
}

export async function getConversation(
  conversationId: string,
  authId: string,
  userRole: 'NANNY' | 'FAMILY'
) {
  // Get user's entity ID
  let currentEntityId: number | null = null;

  if (userRole === 'NANNY') {
    const nanny = await prisma.nanny.findUnique({
      where: { authId },
      select: { id: true },
    });
    currentEntityId = nanny?.id || null;
  } else {
    const family = await prisma.family.findUnique({
      where: { authId },
      select: { id: true },
    });
    currentEntityId = family?.id || null;
  }

  if (!currentEntityId) {
    return null;
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: userRole === 'NANNY'
          ? { nannyId: currentEntityId }
          : { familyId: currentEntityId },
      },
    },
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
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) return null;

  // Find the other participant and determine their online status
  const otherParticipant = conversation.participants.find((p) =>
    userRole === 'NANNY' ? p.familyId !== null : p.nannyId !== null
  );

  let isOtherParticipantOnline = false;
  if (otherParticipant) {
    const lastActivity = otherParticipant.nanny?.lastActivityAt || otherParticipant.family?.lastActivityAt;
    isOtherParticipantOnline = isUserOnline(lastActivity ?? null);
  }

  return {
    ...conversation,
    isOtherParticipantOnline,
  };
}
