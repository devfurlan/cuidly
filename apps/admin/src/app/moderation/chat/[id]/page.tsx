'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContent from '@/components/layout/PageContent';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/useToast';
import PrivacyWarningDialog from '../_components/PrivacyWarningDialog';
import ConversationViewer from '../_components/ConversationViewer';
import { Message, PARTICIPANT_TYPE_LABELS, Participant } from '../schema';
import { CaretLeftIcon, ShieldWarningIcon } from '@phosphor-icons/react';
import Link from 'next/link';

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

type ConversationData = {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  messages: Message[];
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getParticipantInfo(participant: Participant) {
  if (participant.nanny) {
    return {
      name: participant.nanny.name,
      email: participant.nanny.emailAddress,
      photoUrl: participant.nanny.photoUrl,
      type: 'nanny' as const,
    };
  }
  if (participant.family) {
    return {
      name: participant.family.name,
      email: participant.family.emailAddress,
      photoUrl: participant.family.photoUrl,
      type: 'family' as const,
    };
  }
  return { name: 'Unknown', email: '', photoUrl: null, type: 'nanny' as const };
}

function getRoleBadge(type: 'nanny' | 'family') {
  const roleConfig = {
    nanny: { variant: 'teal' as const },
    family: { variant: 'blue' as const },
  };

  const config = roleConfig[type];
  return (
    <Badge variant={config.variant}>
      {PARTICIPANT_TYPE_LABELS[type]}
    </Badge>
  );
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setConversationId(p.id));
  }, [params]);

  async function fetchConversation() {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/conversations/${conversationId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao carregar conversa');
      }

      const data = await response.json();
      setConversation(data.conversation);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar conversa',
        description:
          error instanceof Error ? error.message : 'Por favor, tente novamente.',
      });
      router.push('/moderation/chat');
    }
    setIsLoading(false);
  }

  function handleConfirmPrivacy() {
    setShowWarning(false);
    fetchConversation();
  }

  function handleCancelPrivacy() {
    router.push('/moderation/chat');
  }

  if (showWarning) {
    return (
      <>
        <PageContent title="Visualizar Conversa">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <ShieldWarningIcon className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground text-center max-w-md">
              Para visualizar esta conversa, você precisa confirmar que está
              ciente das políticas de privacidade.
            </p>
          </div>
        </PageContent>
        <PrivacyWarningDialog
          open={showWarning}
          onConfirm={handleConfirmPrivacy}
          onCancel={handleCancelPrivacy}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <PageContent title="Visualizar Conversa">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Carregando conversa...</p>
        </div>
      </PageContent>
    );
  }

  if (!conversation) {
    return (
      <PageContent title="Visualizar Conversa">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Conversa não encontrada.</p>
        </div>
      </PageContent>
    );
  }

  const participantNames = conversation.participants
    .map((p) => {
      const info = getParticipantInfo(p);
      return info.name || info.email;
    })
    .join(' & ');

  return (
    <PageContent
      title={`Moderacao: ${participantNames}`}
      actions={
        <Button variant="outline" asChild>
          <Link href="/moderation/chat">
            <CaretLeftIcon className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Aviso de moderacao */}
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <ShieldWarningIcon className="h-5 w-5 text-yellow-600" weight="fill" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Modo de Moderacao:</strong> Este acesso foi registrado
                para fins de auditoria.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Participantes */}
        <Card>
          <CardHeader>
            <CardTitle>Participantes</CardTitle>
            <CardDescription>
              Conversa iniciada em {formatDate(conversation.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {conversation.participants.map((participant) => {
                const info = getParticipantInfo(participant);
                return (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    {info.photoUrl ? (
                      <img
                        src={info.photoUrl}
                        alt={info.name || 'User'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {(info.name || info.email)[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {info.name || 'Sem nome'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {info.email}
                      </div>
                    </div>
                    {getRoleBadge(info.type)}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mensagens */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Mensagens</CardTitle>
            <CardDescription>
              {conversation.messages.length} mensagens nesta conversa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConversationViewer messages={conversation.messages} />
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
