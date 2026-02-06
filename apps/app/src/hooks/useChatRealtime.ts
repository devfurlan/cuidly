'use client';

/**
 * Hook para gerenciar conexao Realtime do Supabase para o chat
 * Usa Broadcast para comunicacao em tempo real entre usuarios
 */

import { useEffect, useRef, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface MessagePayload {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  senderRole: 'NANNY' | 'FAMILY' | null;
  createdAt: string;
  isFromMe: boolean;
}

interface ReadStatusPayload {
  readerId: string;
  lastReadSeq: string;
}

interface UseChatRealtimeOptions {
  conversationId: string;
  currentUserId: string | null;
  onNewMessage: (message: MessagePayload) => void;
  onReadStatusUpdate?: (payload: ReadStatusPayload) => void;
  enabled?: boolean;
}

export function useChatRealtime({
  conversationId,
  currentUserId,
  onNewMessage,
  onReadStatusUpdate,
  enabled = true,
}: UseChatRealtimeOptions) {
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Broadcast nova mensagem para outros usuarios no canal
  const broadcastMessage = useCallback(
    async (message: MessagePayload) => {
      if (!channelRef.current) {
        console.warn('Canal nao conectado, impossivel fazer broadcast');
        return;
      }

      try {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'nova_mensagem',
          payload: message,
        });
      } catch (error) {
        console.error('Erro ao fazer broadcast da mensagem:', error);
      }
    },
    []
  );

  // Broadcast status de leitura para outros usuarios no canal
  const broadcastReadStatus = useCallback(
    async (lastReadSeq: string) => {
      if (!channelRef.current || !currentUserId) {
        return;
      }

      try {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'mensagem_lida',
          payload: {
            readerId: currentUserId,
            lastReadSeq,
          },
        });
      } catch (error) {
        console.error('Erro ao fazer broadcast do status de leitura:', error);
      }
    },
    [currentUserId]
  );

  // Setup da conexao realtime
  useEffect(() => {
    if (!enabled || !conversationId || !currentUserId) {
      return;
    }

    const channelName = `conversa-${conversationId}`;

    // Criar canal de broadcast
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: {
          // Nao receber as proprias mensagens de volta
          self: false,
        },
      },
    });

    // Escutar evento de nova mensagem
    channel.on('broadcast', { event: 'nova_mensagem' }, ({ payload }) => {
      // Ignorar mensagens enviadas pelo proprio usuario
      if (payload.senderId === currentUserId) {
        return;
      }

      onNewMessage({
        ...payload,
        isFromMe: false,
      });
    });

    // Escutar evento de mensagem lida
    channel.on('broadcast', { event: 'mensagem_lida' }, ({ payload }) => {
      // Ignorar eventos de leitura do proprio usuario
      if (payload.readerId === currentUserId) {
        return;
      }

      if (onReadStatusUpdate) {
        onReadStatusUpdate(payload);
      }
    });

    // Conectar ao canal
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Conectado ao canal: ${channelName}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Erro ao conectar ao canal: ${channelName}`);
      }
    });

    channelRef.current = channel;

    // Cleanup: desconectar ao desmontar
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, currentUserId, enabled, onNewMessage, onReadStatusUpdate, supabase]);

  return {
    broadcastMessage,
    broadcastReadStatus,
    isConnected: !!channelRef.current,
  };
}
