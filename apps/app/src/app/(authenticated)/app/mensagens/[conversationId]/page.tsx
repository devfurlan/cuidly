'use client';

/**
 * Conversation Page - Página de Conversa Individual
 * /app/mensagens/[conversationId]
 *
 * Exibe o histórico de mensagens com suporte a tempo real via Supabase Broadcast
 * Usa UI otimista para envio instantâneo de mensagens
 */

import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PiArrowDown,
  PiArrowLeft,
  PiCheck,
  PiChecks,
  PiPaperPlaneRight,
  PiSpinner,
  PiWarningCircle,
} from 'react-icons/pi';

import { PageTitle } from '@/components/PageTitle';
import { NannyProUpsellModal } from '@/components/subscription/nanny-pro-upsell-modal';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/shadcn/avatar';
import { Button } from '@/components/ui/shadcn/button';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { useUnreadMessages } from '@/contexts/UnreadMessagesContext';
import { useApiError } from '@/hooks/useApiError';
import { useChatRealtime } from '@/hooks/useChatRealtime';
import { createClient } from '@/utils/supabase/client';

interface Sender {
  id: string;
  name: string;
  photoUrl: string | null;
  role: 'NANNY' | 'FAMILY' | null;
}

interface Message {
  id: string;
  body: string;
  senderId: string;
  seq?: string;
  createdAt: string;
  isFromMe: boolean;
  sender: Sender;
  // Para UI otimista
  isPending?: boolean;
  tempId?: string;
}

interface OtherParticipant {
  userId: string | null;
  name: string;
  photoUrl: string | null;
  role: 'NANNY' | 'FAMILY' | null;
  lastReadSeq: string | null;
  isOnline: boolean;
}

interface ConversationData {
  id: string;
  createdAt: string;
  otherParticipant: OtherParticipant;
}

interface CurrentUser {
  id: string;
  name: string;
  photoUrl: string | null;
  role: 'NANNY' | 'FAMILY' | null;
}

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatMessageTime(date: Date): string {
  return format(date, 'HH:mm', { locale: ptBR });
}

function formatDateSeparator(date: Date): string {
  if (isToday(date)) {
    return 'Hoje';
  }
  if (isYesterday(date)) {
    return 'Ontem';
  }
  return format(date, "dd 'de' MMMM", { locale: ptBR });
}

function shouldShowDateSeparator(
  currentMessage: Message,
  previousMessage: Message | null,
): boolean {
  if (!previousMessage) return true;
  const currentDate = new Date(currentMessage.createdAt);
  const previousDate = new Date(previousMessage.createdAt);
  return currentDate.toDateString() !== previousDate.toDateString();
}

// Gerar ID temporário para UI otimista
function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { showError } = useApiError();
  const { resetUnreadForConversation } = useUnreadMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const conversationId = params.conversationId as string;

  const [conversation, setConversation] = useState<ConversationData | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

  // Pagination states
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Scroll button states
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Ref para broadcastReadStatus para evitar dependência circular
  const broadcastReadStatusRef = useRef<
    ((lastReadSeq: string) => Promise<void>) | null
  >(null);

  // Callback para atualizar o status de leitura do outro participante
  const handleReadStatusUpdate = useCallback(
    (payload: { readerId: string; lastReadSeq: string }) => {
      // Atualizar o lastReadSeq do outro participante na conversa
      setConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          otherParticipant: {
            ...prev.otherParticipant,
            lastReadSeq: payload.lastReadSeq,
          },
        };
      });
    },
    [],
  );

  // Callback para receber novas mensagens via realtime
  const handleNewMessage = useCallback(
    (payload: {
      id: string;
      body: string;
      senderId: string;
      senderName: string;
      senderPhoto: string | null;
      senderRole: 'NANNY' | 'FAMILY' | null;
      createdAt: string;
      isFromMe: boolean;
    }) => {
      const newMsg: Message = {
        id: payload.id,
        body: payload.body,
        senderId: payload.senderId,
        createdAt: payload.createdAt,
        isFromMe: false,
        sender: {
          id: payload.senderId,
          name: payload.senderName,
          photoUrl: payload.senderPhoto,
          role: payload.senderRole,
        },
      };

      setMessages((prev) => {
        // Verificar se a mensagem já existe (evitar duplicatas)
        if (prev.some((m) => m.id === newMsg.id)) {
          return prev;
        }
        return [...prev, newMsg];
      });

      // Incrementar contador de novas mensagens (mostrado no botão flutuante)
      // O usuário verá o badge e pode clicar para rolar até as novas mensagens
      setNewMessagesCount((prev) => prev + 1);

      // Marcar como lida automaticamente e fazer broadcast
      fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds: [payload.id] }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.lastReadSeq && broadcastReadStatusRef.current) {
            broadcastReadStatusRef.current(data.lastReadSeq);
          }
          // Atualizar o contexto global para remover o badge de não lida
          resetUnreadForConversation(conversationId);
        })
        .catch(console.error);
    },
    [conversationId, resetUnreadForConversation],
  );

  // Hook de realtime
  const { broadcastMessage, broadcastReadStatus } = useChatRealtime({
    conversationId,
    currentUserId: currentUser?.id || null,
    onNewMessage: handleNewMessage,
    onReadStatusUpdate: handleReadStatusUpdate,
    enabled: !isLoading && !!currentUser,
  });

  // Atualizar ref quando broadcastReadStatus mudar
  useEffect(() => {
    broadcastReadStatusRef.current = broadcastReadStatus;
  }, [broadcastReadStatus]);

  // Carregar usuario atual
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const response = await fetch('/api/user/me');
        if (response.ok) {
          const userData = await response.json();

          let name = userData.name || 'Usuário';
          let photoUrl = userData.photoUrl;

          if (userData.role === 'NANNY' && userData.nannyId) {
            const nannyResponse = await fetch(
              `/api/nannies/by-id/${userData.nannyId}`,
            );
            if (nannyResponse.ok) {
              const nannyData = await nannyResponse.json();
              name = nannyData.name || name;
              photoUrl = nannyData.photoUrl || photoUrl;
            }
          }

          setCurrentUser({
            id: user.id,
            name,
            photoUrl,
            role: userData.role,
          });
        }
      } catch (err) {
        console.error('Error loading current user:', err);
      }
    };

    loadCurrentUser();
  }, [supabase]);

  // Monitorar estado da conexão realtime
  useEffect(() => {
    if (!conversationId || !currentUser) return;

    const channel = supabase.channel(`conversa-${conversationId}`);

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsDisconnected(false);
      } else if (
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT' ||
        status === 'CLOSED'
      ) {
        setIsDisconnected(true);
      }
    });

    return () => {
      // Cleanup handled by useChatRealtime hook
    };
  }, [conversationId, currentUser, supabase]);

  // Carregar conversa e mensagens
  const loadConversation = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(
        `/api/chat/conversations/${conversationId}?limit=30`,
        {
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        if (response.status === 403) {
          setError('Você não tem acesso a esta conversa');
          return;
        }
        if (response.status === 404) {
          setError('Conversa não encontrada');
          return;
        }
        throw new Error('Erro ao carregar conversa');
      }

      const data = await response.json();
      setConversation(data.conversation);
      setMessages(data.messages || []);

      // Guardar info de paginação
      setHasMore(data.pagination?.hasMore || false);
      setNextCursor(data.pagination?.nextCursor || null);

      // Marcar mensagens como lidas e fazer broadcast
      const markReadResponse = await fetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markAllAsRead: true }),
        },
      );

      if (markReadResponse.ok) {
        const markReadData = await markReadResponse.json();
        if (markReadData.lastReadSeq && broadcastReadStatusRef.current) {
          broadcastReadStatusRef.current(markReadData.lastReadSeq);
        }
        // Decrementar badge do menu se tinha mensagens não lidas
        resetUnreadForConversation(conversationId);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Erro ao carregar a conversa');
      showError(err, 'Erro ao carregar a conversa');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, showError, resetUnreadForConversation]);

  // Carregar mensagens mais antigas (paginação)
  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || isLoadingMore || !nextCursor) return;

    setIsLoadingMore(true);

    try {
      const container = messagesContainerRef.current;
      const previousScrollHeight = container?.scrollHeight || 0;

      const response = await fetch(
        `/api/chat/conversations/${conversationId}?cursor=${nextCursor}&limit=30`,
      );

      if (!response.ok) return;

      const data = await response.json();

      // Prepend mensagens antigas (elas vêm em ordem cronológica)
      setMessages((prev) => [...(data.messages || []), ...prev]);
      setHasMore(data.pagination?.hasMore || false);
      setNextCursor(data.pagination?.nextCursor || null);

      // Manter posição do scroll após prepend
      requestAnimationFrame(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - previousScrollHeight;
        }
      });
    } catch (err) {
      console.error('Error loading older messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, hasMore, isLoadingMore, nextCursor]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Marcar mensagens como lidas quando usuário visualiza
  const markMessagesAsRead = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markAllAsRead: true }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.lastReadSeq && broadcastReadStatusRef.current) {
          broadcastReadStatusRef.current(data.lastReadSeq);
        }
        // Atualizar o contexto global de mensagens não lidas
        resetUnreadForConversation(conversationId);
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [conversationId, resetUnreadForConversation]);

  // Scroll handler para paginação e botão flutuante
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Carregar mais mensagens se perto do topo (threshold de 100px para melhor detecção)
    if (scrollTop < 100 && hasMore && !isLoadingMore) {
      loadOlderMessages();
    }

    // Mostrar/esconder botão de scroll baseado na distância do fim
    // Mostra se não está no final (distância > 50px do fim)
    const shouldShow = distanceFromBottom > 50;
    setShowScrollButton(shouldShow);

    // Se o usuário chegou ao final (viu as novas mensagens), marcar como lidas
    if (distanceFromBottom < 50 && newMessagesCount > 0) {
      setNewMessagesCount(0);
      markMessagesAsRead();
    }
  }, [
    hasMore,
    isLoadingMore,
    loadOlderMessages,
    newMessagesCount,
    markMessagesAsRead,
  ]);

  // Scroll para o fim apenas no carregamento inicial
  const initialLoadDoneRef = useRef(false);
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });

      // Trigger scroll handler after initial scroll to set correct button state
      setTimeout(() => {
        handleScroll();
      }, 100);
    }
  }, [isLoading, messages.length, handleScroll]);

  // Note: scroll handler is attached via onScroll prop on the container element

  // Check scroll position after initial messages load (to trigger lazy load if needed)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !hasMore || isLoadingMore) return;

    // Check if we're already near the top on initial load
    const checkInitialScroll = () => {
      if (container.scrollTop < 100 && hasMore && !isLoadingMore) {
        loadOlderMessages();
      }
    };

    // Small delay to ensure scroll position is set after initial render
    const timeout = setTimeout(checkInitialScroll, 300);
    return () => clearTimeout(timeout);
  }, [hasMore, isLoadingMore, loadOlderMessages]);

  // Resetar contador de novas mensagens quando usuário rola para baixo
  useEffect(() => {
    if (!showScrollButton) {
      setNewMessagesCount(0);
    }
  }, [showScrollButton]);

  // Função para rolar para baixo
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMessagesCount(0);
  }, []);

  // Enviar mensagem com UI otimista
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const messageBody = newMessage.trim();
    const tempId = generateTempId();
    const now = new Date().toISOString();

    // UI Otimista: adicionar mensagem imediatamente
    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      body: messageBody,
      senderId: currentUser.id,
      createdAt: now,
      isFromMe: true,
      isPending: true,
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        photoUrl: currentUser.photoUrl,
        role: currentUser.role,
      },
    };

    // Adicionar mensagem otimista e limpar input imediatamente
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    textareaRef.current?.focus();

    // Scroll para baixo quando o usuário envia uma mensagem
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      // Persistir no banco de dados
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: messageBody }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Verificar se é erro de plano Pro necessário
        if (response.status === 403) {
          const errorCode = errorData.code || '';
          const errorMessage = errorData.error || '';

          if (
            errorCode === 'WAITING_FAMILY_RESPONSE' ||
            errorCode === 'NO_SUBSCRIPTION' ||
            errorCode === 'PREMIUM_REQUIRED' ||
            errorMessage.includes('Pro') ||
            errorMessage.includes('aguardando') ||
            errorMessage.includes('assinatura')
          ) {
            // Remover mensagem otimista
            setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
            setNewMessage(messageBody);
            setShowUpgradeModal(true);
            return;
          }
        }

        throw new Error(errorData.error || 'Erro ao enviar mensagem');
      }

      const data = await response.json();
      const serverMessage = data.message;

      // Substituir mensagem otimista pela mensagem do servidor
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...serverMessage, isPending: false } : msg,
        ),
      );

      // Broadcast para outros usuarios no canal
      await broadcastMessage({
        id: serverMessage.id,
        body: serverMessage.body,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderPhoto: currentUser.photoUrl,
        senderRole: currentUser.role,
        createdAt: serverMessage.createdAt,
        isFromMe: true,
      });
    } catch (err) {
      console.error('Error sending message:', err);

      // Remover mensagem otimista em caso de erro
      setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));

      // Restaurar mensagem no campo
      setNewMessage(messageBody);
      showError(err, 'Erro ao enviar mensagem');
    }
  };

  // Enviar com Enter (Shift+Enter para nova linha)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <PageTitle title="Conversa - Cuidly" />
        <div className="flex h-full flex-col">
          {/* Header skeleton */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            {/* Botão voltar - mobile only */}
            <Skeleton className="size-9 rounded-lg md:hidden" />

            {/* Avatar com indicador de online */}
            <div className="relative">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="absolute right-0 bottom-0 size-3 rounded-full" />
            </div>

            {/* Nome e status */}
            <div className="flex-1">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-1 h-3 w-16" />
            </div>
          </div>

          {/* Messages skeleton */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {/* Date separator */}
            <div className="flex justify-center">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Message bubbles */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
              >
                <Skeleton
                  className={`h-14 max-w-[75%] rounded-lg ${
                    i % 2 === 0
                      ? 'w-2/3 rounded-br-none'
                      : 'w-1/2 rounded-bl-none'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Input skeleton */}
          <div className="border-t p-4">
            <div className="flex items-end gap-2">
              <Skeleton className="h-10 flex-1 rounded-2xl" />
              <Skeleton className="size-10 shrink-0 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-3 w-64" />
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <PageTitle title="Erro - Cuidly" />
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-4 rounded-full bg-red-100 p-4">
            <PiWarningCircle className="size-12 text-red-500" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{error}</h2>
          <p className="mb-4 text-sm text-gray-500">
            Não foi possível carregar esta conversa
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/app/mensagens')}
          >
            <PiArrowLeft className="mr-2 size-4" />
            Voltar para Mensagens
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle
        title={`${conversation?.otherParticipant.name || 'Conversa'} - Cuidly`}
      />

      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Link
            href="/app/mensagens"
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
          >
            <PiArrowLeft className="size-5 text-gray-600" />
          </Link>

          <div className="relative">
            <Avatar className="size-10">
              {conversation?.otherParticipant.photoUrl && (
                <AvatarImage
                  src={conversation.otherParticipant.photoUrl}
                  alt={conversation.otherParticipant.name}
                />
              )}
              <AvatarFallback className="bg-fuchsia-100 text-fuchsia-600">
                {getUserInitials(conversation?.otherParticipant.name || 'U')}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator on avatar */}
            {conversation?.otherParticipant.isOnline && (
              <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>

          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">
              {conversation?.otherParticipant.name}
            </h1>
            <p
              className={`text-xs ${conversation?.otherParticipant.isOnline ? 'text-green-500' : 'text-gray-500'}`}
            >
              {conversation?.otherParticipant.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Connection Error Banner */}
        {isDisconnected && (
          <div className="flex items-center justify-center gap-2 bg-orange-50 px-4 py-2 text-sm text-orange-800">
            <PiWarningCircle className="size-4" />
            Conexão instável. Tentando reconectar...
          </div>
        )}

        {/* Messages area */}
        <div
          ref={messagesContainerRef}
          className="relative min-h-0 flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
              <p className="text-gray-500">Nenhuma mensagem ainda</p>
              <p className="mt-1 text-sm text-gray-400">
                Envie uma mensagem para iniciar a conversa
              </p>
            </div>
          ) : (
            <div className="space-y-4 px-4 py-4">
              {/* Loading indicator when fetching older messages (lazy load on scroll) */}
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <PiSpinner className="size-5 animate-spin text-gray-400" />
                </div>
              )}

              {messages.map((message, index) => {
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const showDateSeparator = shouldShowDateSeparator(
                  message,
                  previousMessage,
                );

                return (
                  <div key={message.id}>
                    {/* Separador de data */}
                    {showDateSeparator && (
                      <div className="my-4 flex items-center justify-center">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                          {formatDateSeparator(new Date(message.createdAt))}
                        </span>
                      </div>
                    )}

                    {/* Mensagem */}
                    <div
                      className={`flex ${
                        message.isFromMe ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 ${
                          message.isFromMe
                            ? 'rounded-br-none bg-fuchsia-100 text-gray-900'
                            : 'rounded-bl-none bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm wrap-break-word whitespace-pre-wrap">
                          {message.body}
                        </p>
                        <div
                          className={`mt-1 flex items-center justify-end gap-1 text-2xs ${
                            message.isFromMe ? 'text-gray-300' : 'text-gray-400'
                          }`}
                        >
                          <span>
                            {formatMessageTime(new Date(message.createdAt))}
                          </span>
                          {/* Status da mensagem (apenas para mensagens enviadas por mim) */}
                          {message.isFromMe &&
                            (message.isPending ? (
                              <PiCheck className="size-3.5" />
                            ) : conversation?.otherParticipant.lastReadSeq &&
                              message.seq &&
                              BigInt(message.seq) <=
                                BigInt(
                                  conversation.otherParticipant.lastReadSeq,
                                ) ? (
                              // Mensagem lida - dois checks azuis
                              <PiChecks className="size-3.5 text-sky-400" />
                            ) : (
                              // Mensagem entregue - dois checks
                              <PiChecks className="size-3.5" />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Floating scroll to bottom button with badge - sticky at bottom */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="sticky bottom-4 left-full z-10 flex -translate-x-8 items-center justify-center rounded-full bg-white p-2.5 shadow-lg transition-all hover:bg-gray-50"
            >
              <PiArrowDown className="size-5 text-gray-600" />
              {newMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-medium text-white">
                  {newMessagesCount > 9 ? '+9' : newMessagesCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Input area */}
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                // Auto-resize textarea
                const textarea = e.target;
                // Reset height to measure scrollHeight correctly, but use scrollHeight directly
                textarea.style.height = '0';
                const scrollHeight = textarea.scrollHeight;
                const newHeight = Math.max(40, Math.min(scrollHeight, 120));
                textarea.style.height = `${newHeight}px`;
                // Show scrollbar only when at max height
                textarea.style.overflowY =
                  scrollHeight > 120 ? 'auto' : 'hidden';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="max-h-[120px] min-h-10 resize-none overflow-hidden rounded-2xl py-2.5"
              maxLength={5000}
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !currentUser}
              className="size-10 shrink-0 rounded-full bg-fuchsia-600 p-0 hover:bg-fuchsia-700"
            >
              <PiPaperPlaneRight className="size-5" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Pressione Enter para enviar, Shift+Enter para nova linha
          </p>
        </div>
      </div>

      {/* Modal de upgrade para plano Pro - mensagens ilimitadas */}
      <NannyProUpsellModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="messages"
      />
    </>
  );
}
