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

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  refetch: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(
  undefined
);

interface NotificationsProviderProps {
  children: ReactNode;
  nannyId?: number;
  familyId?: number;
}

export function NotificationsProvider({
  children,
  nannyId,
  familyId,
}: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  }, []);

  // Fetch inicial + Supabase Realtime subscription
  useEffect(() => {
    // Fetch inicial
    fetchNotifications();

    // Construir filtro baseado no tipo de usuário
    const filter = nannyId
      ? `nanny_id=eq.${nannyId}`
      : familyId
        ? `family_id=eq.${familyId}`
        : null;

    if (!filter) return;

    // Subscription para novos inserts e updates
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter,
        },
        (payload) => {
          // Nova notificação recebida
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter,
        },
        (payload) => {
          // Notificação atualizada (ex: marcada como lida)
          const updated = payload.new as Notification;
          setNotifications((prev) => {
            const newList = prev.map((n) => (n.id === updated.id ? updated : n));
            // Recalcular unread count
            const newUnread = newList.filter((n) => !n.isRead).length;
            setUnreadCount(newUnread);
            return newList;
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Conectado ao canal de notificações');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Erro ao conectar ao canal de notificações');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchNotifications, nannyId, familyId, supabase]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: 'PATCH' });
      // O Realtime vai atualizar automaticamente via UPDATE event
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications?id=all', { method: 'PATCH' });
      // O Realtime vai atualizar automaticamente via UPDATE events
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
    }
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        refetch: fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider'
    );
  }
  return context;
}
