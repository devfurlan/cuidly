'use client';

import Link from 'next/link';
import { Conversation, PARTICIPANT_TYPE_LABELS, Participant } from '../schema';
import { Badge } from '@/components/ui/Badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ConversationListProps {
  conversations: Conversation[];
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getParticipantName(participant: Participant): string {
  if (participant.nanny) {
    return participant.nanny.name || participant.nanny.emailAddress;
  }
  if (participant.family) {
    return participant.family.name || participant.family.emailAddress;
  }
  return 'Unknown';
}

function getParticipantType(participant: Participant): 'nanny' | 'family' {
  return participant.nanny ? 'nanny' : 'family';
}

function getRoleBadge(type: 'nanny' | 'family') {
  const roleConfig = {
    nanny: { variant: 'teal' as const },
    family: { variant: 'blue' as const },
  };

  const config = roleConfig[type];
  return (
    <Badge variant={config.variant} className="text-xs">
      {PARTICIPANT_TYPE_LABELS[type]}
    </Badge>
  );
}

export default function ConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhuma conversa encontrada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => {
        const lastMessage = conversation.messages[0];

        return (
          <Link
            key={conversation.id}
            href={`/moderation/chat/${conversation.id}`}
            className="block"
          >
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {conversation.participants.map((p, i) => (
                      <span key={p.id}>
                        {i > 0 && ' & '}
                        {getParticipantName(p)}
                      </span>
                    ))}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(conversation.updatedAt)}
                  </span>
                </div>
                <CardDescription className="flex gap-2">
                  {conversation.participants.map((p) => (
                    <span key={p.id} className="flex items-center gap-1">
                      {getRoleBadge(getParticipantType(p))}
                    </span>
                  ))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    {lastMessage ? (
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {lastMessage.body}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Sem mensagens
                      </p>
                    )}
                  </div>
                  <Badge variant="muted">
                    {conversation._count.messages} mensagens
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
