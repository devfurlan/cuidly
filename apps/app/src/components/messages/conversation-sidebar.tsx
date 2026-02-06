'use client';

/**
 * Conversation Sidebar - Lista de conversas estilo WhatsApp
 * Usado no layout split-view em desktop
 */

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PiMagnifyingGlass } from 'react-icons/pi';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/shadcn/avatar';
import { Input } from '@/components/ui/shadcn/input';
import { useUnreadMessages } from '@/contexts/UnreadMessagesContext';
import type { ConversationSummary } from '@/lib/data/conversations';

interface ConversationSidebarProps {
  conversations: ConversationSummary[];
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

function truncateMessage(message: string, maxLength: number = 40): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength).trim() + '...';
}

export function ConversationSidebar({
  conversations: initialConversations,
  currentEntityId,
  userRole,
}: ConversationSidebarProps) {
  const pathname = usePathname();
  const [conversations, setConversations] = useState(initialConversations);
  const [searchQuery, setSearchQuery] = useState('');
  const { lastUpdate, lastReadConversationId, unreadByConversation } =
    useUnreadMessages();

  // Atualiza a lista quando receber um novo update via real-time
  useEffect(() => {
    if (!lastUpdate) return;

    setConversations((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.id === lastUpdate.conversationId,
      );

      if (existingIndex === -1) {
        return prev;
      }

      const updated = [...prev];
      const conversation = { ...updated[existingIndex] };

      // Atualizar última mensagem se tiver conteúdo
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

      updated.splice(existingIndex, 1);
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
      conv.otherParticipant.name?.toLowerCase().includes(query),
    );
  }, [searchQuery, conversations]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">Mensagens</h2>
      </div>

      {/* Search */}
      <div className="border-b px-3 py-2">
        <div className="relative">
          <PiMagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar conversa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <p className="text-sm text-gray-500">
              {searchQuery
                ? 'Nenhuma conversa encontrada'
                : 'Nenhuma conversa ainda'}
            </p>
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => {
              const isActive = pathname === `/app/mensagens/${conversation.id}`;
              const isFromMe = conversation.lastMessage
                ? userRole === 'NANNY'
                  ? conversation.lastMessage.senderNannyId === currentEntityId
                  : conversation.lastMessage.senderFamilyId === currentEntityId
                : false;

              return (
                <Link
                  key={conversation.id}
                  href={`/app/mensagens/${conversation.id}`}
                  className={`flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-gray-50 ${
                    isActive ? 'bg-fuchsia-50' : ''
                  }`}
                >
                  {/* Avatar with online indicator */}
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
                      <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm font-medium ${
                          conversation.unreadCount > 0
                            ? 'text-gray-900'
                            : 'text-gray-700'
                        }`}
                      >
                        {conversation.otherParticipant.name}
                      </span>
                      {conversation.lastMessage && (
                        <span className="shrink-0 text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(conversation.lastMessage.createdAt),
                            { addSuffix: false, locale: ptBR },
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {conversation.lastMessage ? (
                        <p
                          className={`truncate text-sm ${
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
                        <p className="text-sm text-gray-400">
                          Nenhuma mensagem
                        </p>
                      )}

                      {/* Unread badge */}
                      {conversation.unreadCount > 0 && (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-fuchsia-400 text-xs font-medium -tracking-widest text-white">
                          {conversation.unreadCount > 9
                            ? '+9'
                            : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
