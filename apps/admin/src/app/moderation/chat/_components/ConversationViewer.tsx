'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Message, PARTICIPANT_TYPE_LABELS } from '../schema';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/useToast';
import { DotsThreeIcon, TrashIcon } from '@phosphor-icons/react';

interface ConversationViewerProps {
  messages: Message[];
  currentUserId?: string;
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getSenderInfo(message: Message) {
  if (message.senderNanny) {
    return {
      name: message.senderNanny.name,
      email: message.senderNanny.emailAddress,
      photoUrl: message.senderNanny.photoUrl,
      type: 'nanny' as const,
    };
  }
  if (message.senderFamily) {
    return {
      name: message.senderFamily.name,
      email: message.senderFamily.emailAddress,
      photoUrl: message.senderFamily.photoUrl,
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
    <Badge variant={config.variant} className="text-xs">
      {PARTICIPANT_TYPE_LABELS[type]}
    </Badge>
  );
}

function groupMessagesByDate(messages: Message[]): Map<string, Message[]> {
  const groups = new Map<string, Message[]>();

  messages.forEach((message) => {
    const dateKey = new Date(message.createdAt).toDateString();
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, message]);
  });

  return groups;
}

export default function ConversationViewer({
  messages,
}: ConversationViewerProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const messageGroups = groupMessagesByDate(messages);

  async function handleDeleteMessage() {
    if (!selectedMessage) return;

    if (!deleteReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Motivo obrigatório',
        description: 'Por favor, informe o motivo da exclusão.',
      });
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/messages/${selectedMessage.id}?reason=${encodeURIComponent(deleteReason)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar mensagem');
      }

      toast({
        variant: 'success',
        title: 'Mensagem deletada',
        description: 'A mensagem foi removida com sucesso.',
      });
      setShowDeleteDialog(false);
      setSelectedMessage(null);
      setDeleteReason('');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao deletar mensagem',
        description:
          error instanceof Error ? error.message : 'Por favor, tente novamente.',
      });
    }
    setIsDeleting(false);
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Esta conversa não possui mensagens.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {Array.from(messageGroups.entries()).map(([dateKey, dateMessages]) => (
          <div key={dateKey}>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">
                {formatDate(dateMessages[0].createdAt)}
              </span>
              <div className="flex-1 border-t" />
            </div>

            <div className="space-y-4">
              {dateMessages.map((message) => {
                const sender = getSenderInfo(message);
                return (
                  <div
                    key={message.id}
                    className="group flex gap-3 p-3 rounded-lg hover:bg-muted/50"
                  >
                    {sender.photoUrl ? (
                      <img
                        src={sender.photoUrl}
                        alt={sender.name || 'User'}
                        className="h-8 w-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium">
                          {(sender.name || sender.email || '?')[0].toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {sender.name || sender.email}
                        </span>
                        {getRoleBadge(sender.type)}
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap wrap-break-word">
                        {message.body}
                      </p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <DotsThreeIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMessage(message);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-500"
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Deletar mensagem
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar mensagem</DialogTitle>
            <DialogDescription>
              Você está prestes a deletar permanentemente esta mensagem.
              Por favor, informe o motivo da exclusão.
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="text-muted-foreground mb-1">
                <strong>{getSenderInfo(selectedMessage).name || getSenderInfo(selectedMessage).email}:</strong>
              </p>
              <p className="whitespace-pre-wrap">{selectedMessage.body}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="delete-reason">Motivo da exclusão</Label>
            <Textarea
              id="delete-reason"
              placeholder="Informe o motivo da exclusão..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedMessage(null);
                setDeleteReason('');
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMessage}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deletando...' : 'Deletar mensagem'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
