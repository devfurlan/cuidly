'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { createClient } from '@/utils/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ConversationUpdatePayload {
  conversationId: string;
  lastMessage: {
    body: string;
    createdAt: string;
    senderNannyId: number | null;
    senderFamilyId: number | null;
  };
  senderName: string;
  senderPhoto: string | null;
}

interface UnreadMessagesContextType {
  unreadCount: number;
  unreadByConversation: Record<string, number>;
  incrementUnread: () => void;
  decrementUnread: () => void;
  resetUnreadForConversation: (conversationId: string) => void;
  refetch: () => Promise<void>;
  lastUpdate: ConversationUpdatePayload | null;
  lastReadConversationId: string | null;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType | undefined>(
  undefined
);

interface UnreadMessagesProviderProps {
  children: ReactNode;
  authId: string | null;
}

export function UnreadMessagesProvider({
  children,
  authId,
}: UnreadMessagesProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate] = useState<ConversationUpdatePayload | null>(null);
  const [lastReadConversationId, setLastReadConversationId] = useState<string | null>(null);
  const [myConversationIds, setMyConversationIds] = useState<Set<string>>(new Set());
  const [myEntityId, setMyEntityId] = useState<{ nannyId?: number; familyId?: number } | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);
  const previousConversationsRef = useRef<Set<string>>(new Set());
  const unreadByConversationRef = useRef<Record<string, number>>({});

  const fetchUnreadCount = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      const response = await fetch('/api/chat/conversations/unread-count');
      if (!response.ok || !isMountedRef.current) return;

      const data = await response.json();
      const newCount = data.unreadCount || 0;
      const newConversations: string[] = data.conversationsWithUnread || [];
      const allConversationIds: string[] = data.allConversationIds || [];
      const newUnreadByConv: Record<string, number> = data.unreadByConversation || {};
      const newSet = new Set<string>(newConversations);

      // Verificar se houve nova mensagem comparando com o estado anterior
      const prevSet = previousConversationsRef.current;
      for (const convId of newConversations) {
        if (!prevSet.has(convId)) {
          // Nova conversa com mensagem não lida - disparar update
          setLastUpdate({
            conversationId: convId,
            lastMessage: {
              body: '',
              createdAt: new Date().toISOString(),
              senderNannyId: null,
              senderFamilyId: null,
            },
            senderName: '',
            senderPhoto: null,
          });
        }
      }

      previousConversationsRef.current = newSet;
      unreadByConversationRef.current = newUnreadByConv;
      setUnreadByConversation(newUnreadByConv);
      setUnreadCount(newCount);
      setMyConversationIds(new Set(allConversationIds));

      // Guardar o entity ID do usuário
      if (data.entityId) {
        setMyEntityId(data.entityId);
      }
    } catch (error) {
      console.error('Erro ao buscar contagem de mensagens não lidas:', error);
    }
  }, []);

  // Refs para usar nos callbacks do realtime (evita re-subscribe a cada mudança de estado)
  const myConversationIdsRef = useRef<Set<string>>(new Set());
  const myEntityIdRef = useRef<{ nannyId?: number; familyId?: number } | null>(null);

  // Atualizar refs quando os estados mudam
  useEffect(() => {
    myConversationIdsRef.current = myConversationIds;
  }, [myConversationIds]);

  useEffect(() => {
    myEntityIdRef.current = myEntityId;
  }, [myEntityId]);

  // Fetch inicial (Realtime cuida das atualizações)
  useEffect(() => {
    if (!authId) return;
    isMountedRef.current = true;

    // Fetch inicial
    fetchUnreadCount();

    return () => {
      isMountedRef.current = false;
    };
  }, [authId, fetchUnreadCount]);

  // Supabase Realtime Broadcast para novas mensagens
  // Usa Broadcast em vez de Postgres Changes (não depende de RLS)
  useEffect(() => {
    if (!authId) return;

    const supabase = createClient();

    const channel = supabase
      .channel('new-messages')
      .on('broadcast', { event: 'new_message' }, (payload) => {
        console.log('[Realtime] Broadcast recebido:', payload);

        const data = payload.payload as {
          conversationId: string;
          messageId: string;
          body: string;
          createdAt: string;
          senderNannyId: number | null;
          senderFamilyId: number | null;
        };

        const currentConversationIds = myConversationIdsRef.current;
        const currentEntityId = myEntityIdRef.current;

        console.log('[Realtime] Minhas conversas:', Array.from(currentConversationIds));
        console.log('[Realtime] Meu entity:', currentEntityId);

        // Verificar se a mensagem é de uma conversa que eu participo
        if (!currentConversationIds.has(data.conversationId)) {
          // Pode ser uma nova conversa - refetch para atualizar a lista
          console.log('[Realtime] Conversa não encontrada, fazendo refetch');
          fetchUnreadCount();
          return;
        }

        // Verificar se a mensagem NÃO foi enviada por mim
        const isFromMe =
          currentEntityId &&
          ((currentEntityId.nannyId && data.senderNannyId === currentEntityId.nannyId) ||
            (currentEntityId.familyId && data.senderFamilyId === currentEntityId.familyId));

        if (isFromMe) {
          console.log('[Realtime] Mensagem enviada por mim, ignorando');
          return;
        }

        console.log('[Realtime] Nova mensagem recebida! Incrementando contador');

        // Nova mensagem recebida! Incrementar contagem
        const currentUnreadByConv = unreadByConversationRef.current;
        const currentConvUnread = currentUnreadByConv[data.conversationId] || 0;
        const newUnreadByConv = {
          ...currentUnreadByConv,
          [data.conversationId]: currentConvUnread + 1,
        };
        unreadByConversationRef.current = newUnreadByConv;
        setUnreadByConversation(newUnreadByConv);
        setUnreadCount((count) => count + 1);

        // Disparar update para a sidebar
        setLastUpdate({
          conversationId: data.conversationId,
          lastMessage: {
            body: data.body,
            createdAt: data.createdAt,
            senderNannyId: data.senderNannyId,
            senderFamilyId: data.senderFamilyId,
          },
          senderName: '',
          senderPhoto: null,
        });
      })
      .subscribe((status, err) => {
        console.log('[Realtime] Status:', status, err ? `Error: ${err.message}` : '');
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Conectado ao canal new-messages (broadcast)');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Erro ao conectar:', err);
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] Timeout na conexão');
        } else if (status === 'CLOSED') {
          console.log('[Realtime] Canal fechado');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [authId, fetchUnreadCount]);

  const incrementUnread = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  const decrementUnread = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const resetUnreadForConversation = useCallback((conversationId: string) => {
    // Notificar a sidebar que esta conversa foi lida
    setLastReadConversationId(conversationId);

    // Subtrair o número de mensagens não lidas desta conversa do total
    const currentUnreadByConv = unreadByConversationRef.current;
    const conversationUnread = currentUnreadByConv[conversationId] || 0;

    if (conversationUnread > 0) {
      const newUnreadByConv = { ...currentUnreadByConv };
      delete newUnreadByConv[conversationId];
      unreadByConversationRef.current = newUnreadByConv;
      setUnreadByConversation(newUnreadByConv);
      setUnreadCount((count) => Math.max(0, count - conversationUnread));

      // Atualizar previousConversationsRef
      const prevSet = new Set(previousConversationsRef.current);
      prevSet.delete(conversationId);
      previousConversationsRef.current = prevSet;
    }
  }, []);

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadCount,
        unreadByConversation,
        incrementUnread,
        decrementUnread,
        resetUnreadForConversation,
        refetch: fetchUnreadCount,
        lastUpdate,
        lastReadConversationId,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
}

// Default value when used outside provider (for SSR/hydration safety)
const defaultContextValue: UnreadMessagesContextType = {
  unreadCount: 0,
  unreadByConversation: {},
  incrementUnread: () => {},
  decrementUnread: () => {},
  resetUnreadForConversation: () => {},
  refetch: async () => {},
  lastUpdate: null,
  lastReadConversationId: null,
};

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);
  // Return default value if outside provider (SSR/hydration)
  // This prevents errors during server-side rendering
  if (context === undefined) {
    return defaultContextValue;
  }
  return context;
}
