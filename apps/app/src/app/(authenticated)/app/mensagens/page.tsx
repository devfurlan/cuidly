/**
 * Messages Page - Server Component
 * Desktop: mostra EmptyConversation (sidebar já exibe lista)
 * Mobile: mostra MessagesList completa
 */

import { PageTitle } from '@/components/PageTitle';
import { MessagesList } from '@/components/messages/messages-list';
import { EmptyConversation } from '@/components/messages/empty-conversation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getConversations } from '@/lib/data/conversations';
import { redirect } from 'next/navigation';

export default async function MessagesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const userRole = user.type === 'nanny' ? 'NANNY' : 'FAMILY';
  const currentEntityId = user.type === 'nanny' ? user.nanny.id : user.family.id;
  const conversations = await getConversations(user.authId, userRole);

  return (
    <>
      <PageTitle title="Mensagens - Cuidly" />

      {/* Desktop: empty state (sidebar já mostra a lista) */}
      <div className="hidden h-full md:block">
        <EmptyConversation />
      </div>

      {/* Mobile: lista completa de mensagens */}
      <div className="p-4 md:hidden">
        <MessagesList
          initialConversations={conversations}
          currentEntityId={currentEntityId}
          userRole={userRole}
        />
      </div>
    </>
  );
}
