/**
 * Messages Layout - Split View
 * Desktop: sidebar com lista de conversas + área principal
 * Mobile: apenas a área principal (lista ou conversa, separadas)
 */

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getConversations } from '@/lib/data/conversations';
import { redirect } from 'next/navigation';
import { ConversationSidebar } from '@/components/messages/conversation-sidebar';

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const userRole = user.type === 'nanny' ? 'NANNY' : 'FAMILY';
  const currentEntityId = user.type === 'nanny' ? user.nanny.id : user.family.id;
  const conversations = await getConversations(user.authId, userRole);

  return (
    <div className="-mx-5 -my-6 flex h-[calc(100vh-80px)] sm:-mx-6">
      {/* Sidebar - visível apenas em desktop */}
      <aside className="hidden w-80 shrink-0 flex-col border-r bg-white md:flex">
        <ConversationSidebar
          conversations={conversations}
          currentEntityId={currentEntityId}
          userRole={userRole}
        />
      </aside>

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col bg-white">
        {children}
      </main>
    </div>
  );
}
