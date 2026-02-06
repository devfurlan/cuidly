import PageContent from '@/components/layout/PageContent';
import { requirePermission } from '@/lib/auth/checkPermission';
import prisma from '@/lib/prisma';
import { Conversation } from './schema';
import ConversationSearch from './_components/ConversationSearch';
import ConversationList from './_components/ConversationList';

interface ChatModerationPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

async function fetchConversations(search?: string): Promise<Conversation[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search) {
    where.participants = {
      some: {
        OR: [
          { nanny: { name: { contains: search, mode: 'insensitive' } } },
          { nanny: { emailAddress: { contains: search, mode: 'insensitive' } } },
          { family: { name: { contains: search, mode: 'insensitive' } } },
          { family: { emailAddress: { contains: search, mode: 'insensitive' } } },
        ],
      },
    };
  }

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      participants: {
        include: {
          nanny: {
            select: {
              id: true,
              name: true,
              emailAddress: true,
              photoUrl: true,
            },
          },
          family: {
            select: {
              id: true,
              name: true,
              emailAddress: true,
              photoUrl: true,
            },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        where: { deletedAt: null },
        select: {
          id: true,
          body: true,
          createdAt: true,
          senderNannyId: true,
          senderFamilyId: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: { deletedAt: null },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  return conversations.map((c) => ({
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    participants: c.participants.map((p) => ({
      ...p,
      joinedAt: new Date(p.joinedAt),
    })),
    messages: c.messages.map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt),
    })),
  }));
}

export const metadata = {
  title: 'Moderação de Chat',
  description: 'Modere conversas e mensagens do chat.',
};

export default async function ChatModerationPage({
  searchParams,
}: ChatModerationPageProps) {
  await requirePermission('CHAT_MODERATION');

  const params = await searchParams;
  const conversations = await fetchConversations(params.search);

  return (
    <PageContent title="Moderação de Chat">
      <div className="space-y-6">
        <ConversationSearch />
        <ConversationList conversations={conversations} />
      </div>
    </PageContent>
  );
}
