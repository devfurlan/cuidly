'use client';

/**
 * Messages List Client Component
 * Lista todas as conversas com filtro local e atualização em tempo real
 */

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PiChatCircle,
  PiChatCircleDots,
  PiMagnifyingGlass,
} from 'react-icons/pi';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/shadcn/avatar';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import type { ConversationSummary } from '@/lib/data/conversations';
import { useUnreadMessages } from '@/contexts/UnreadMessagesContext';

interface MessagesListProps {
  initialConversations: ConversationSummary[];
  currentEntityId: number;
  userRole: 'NANNY' | 'FAMILY';
}

function getUserInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function truncateMessage(message: string, maxLength: number = 50): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength).trim() + '...';
}

export function MessagesList({ initialConversations, currentEntityId, userRole }: MessagesListProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [searchQuery, setSearchQuery] = useState('');
  const { lastUpdate, unreadByConversation } = useUnreadMessages();

  // Atualiza a lista quando receber um novo update via real-time
  useEffect(() => {
    if (!lastUpdate) return;

    setConversations((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === lastUpdate.conversationId);

      if (existingIndex === -1) {
        // Conversa nova - não está na lista, precisaria refetch completo
        // Por enquanto, apenas ignoramos (o usuário pode atualizar a página)
        return prev;
      }

      const updated = [...prev];
      const conversation = { ...updated[existingIndex] };

      // Atualiza a última mensagem se tiver conteúdo
      if (lastUpdate.lastMessage.body) {
        conversation.lastMessage = {
          body: lastUpdate.lastMessage.body,
          createdAt: new Date(lastUpdate.lastMessage.createdAt),
          senderNannyId: lastUpdate.lastMessage.senderNannyId,
          senderFamilyId: lastUpdate.lastMessage.senderFamilyId,
        };
      }

      // O unreadCount agora vem do contexto (unreadByConversation)
      conversation.unreadCount = unreadByConversation[conversation.id] || 0;
      conversation.updatedAt = new Date();

      // Remove da posição atual
      updated.splice(existingIndex, 1);
      // Adiciona no início (mais recente)
      updated.unshift(conversation);

      return updated;
    });
  }, [lastUpdate, unreadByConversation]);

  // Sincroniza unreadCount de todas as conversas com o contexto
  useEffect(() => {
    setConversations((prev) => {
      let hasChanges = false;
      const updated = prev.map((conv) => {
        const contextUnread = unreadByConversation[conv.id] || 0;
        if (conv.unreadCount !== contextUnread) {
          hasChanges = true;
          return { ...conv, unreadCount: contextUnread };
        }
        return conv;
      });
      return hasChanges ? updated : prev;
    });
  }, [unreadByConversation]);

  // Filtra conversas por nome (client-side)
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }

    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) =>
      conv.otherParticipant.name?.toLowerCase().includes(query)
    );
  }, [searchQuery, conversations]);

  return (
    <>
      <div className="mb-6">
        <p className="text-gray-600">Suas conversas com babás e famílias</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <PiMagnifyingGlass className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar conversa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Conversations list */}
      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <PiChatCircle className="size-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </h3>
            <p className="text-center text-sm text-gray-500">
              {searchQuery
                ? 'Tente buscar por outro nome'
                : 'Quando você iniciar uma conversa, ela aparecerá aqui'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => {
            // Check if the last message was sent by the current user
            const isFromMe = conversation.lastMessage
              ? userRole === 'NANNY'
                ? conversation.lastMessage.senderNannyId === currentEntityId
                : conversation.lastMessage.senderFamilyId === currentEntityId
              : false;

            return (
              <Link
                key={conversation.id}
                href={`/app/mensagens/${conversation.id}`}
                className="block"
              >
                <Card
                  className={`transition-colors hover:bg-gray-50 ${
                    conversation.unreadCount > 0 ? 'border-fuchsia-200 bg-fuchsia-50/30' : ''
                  }`}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <Avatar className="size-12">
                        {conversation.otherParticipant.photoUrl && (
                          <AvatarImage
                            src={conversation.otherParticipant.photoUrl}
                            alt={conversation.otherParticipant.name || ''}
                          />
                        )}
                        <AvatarFallback className="bg-fuchsia-100 text-fuchsia-600">
                          {getUserInitials(conversation.otherParticipant.name)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online indicator */}
                      {conversation.otherParticipant.isOnline && (
                        <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-green-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`truncate text-sm font-medium ${
                            conversation.unreadCount > 0
                              ? 'text-gray-900'
                              : 'text-gray-700'
                          }`}
                        >
                          {conversation.otherParticipant.name}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="shrink-0 text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(conversation.lastMessage.createdAt),
                              { addSuffix: false, locale: ptBR }
                            )}
                          </span>
                        )}
                      </div>

                      {/* Last message */}
                      <div className="flex items-center justify-between gap-2">
                        {conversation.lastMessage ? (
                          <p
                            className={`mt-0.5 truncate text-sm ${
                              conversation.unreadCount > 0
                                ? 'font-medium text-gray-900'
                                : 'text-gray-500'
                            }`}
                          >
                            {isFromMe && (
                              <span className="text-gray-400">Você: </span>
                            )}
                            {truncateMessage(conversation.lastMessage.body)}
                          </p>
                        ) : (
                          <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-400">
                            <PiChatCircleDots className="size-4" />
                            Nenhuma mensagem ainda
                          </p>
                        )}

                        {/* Unread badge */}
                        {conversation.unreadCount > 0 && (
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-medium text-white">
                            {conversation.unreadCount > 9 ? '+9' : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
