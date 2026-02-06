'use client';

/**
 * Hook para receber atualizações em tempo real na lista de mensagens
 * Usa o contexto UnreadMessagesContext que já escuta o canal do usuário
 */

import { useEffect } from 'react';
import { useUnreadMessages } from '@/contexts/UnreadMessagesContext';

interface UseMessagesListRealtimeOptions {
  onConversationUpdate: (
    conversationId: string,
    lastMessage: {
      body: string;
      createdAt: Date;
      senderNannyId: number | null;
      senderFamilyId: number | null;
    },
    senderName: string,
    senderPhoto: string | null
  ) => void;
  enabled?: boolean;
}

export function useMessagesListRealtime({
  onConversationUpdate,
  enabled = true,
}: UseMessagesListRealtimeOptions) {
  const { lastUpdate } = useUnreadMessages();

  useEffect(() => {
    if (!enabled || !lastUpdate) return;

    onConversationUpdate(
      lastUpdate.conversationId,
      {
        body: lastUpdate.lastMessage.body,
        createdAt: new Date(lastUpdate.lastMessage.createdAt),
        senderNannyId: lastUpdate.lastMessage.senderNannyId,
        senderFamilyId: lastUpdate.lastMessage.senderFamilyId,
      },
      lastUpdate.senderName,
      lastUpdate.senderPhoto
    );
  }, [lastUpdate, enabled, onConversationUpdate]);
}
