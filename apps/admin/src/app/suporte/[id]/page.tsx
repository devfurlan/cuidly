'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  OPEN: { label: 'Aberto', variant: 'default' },
  IN_PROGRESS: { label: 'Em andamento', variant: 'secondary' },
  RESOLVED: { label: 'Resolvido', variant: 'outline' },
  CLOSED: { label: 'Encerrado', variant: 'outline' },
};

const CATEGORY_LABELS: Record<string, string> = {
  SUBSCRIPTION_PAYMENT: 'Assinatura / Pagamento',
  ACCOUNT: 'Conta',
  BUG_TECHNICAL: 'Bug / Problema técnico',
  SUGGESTION: 'Sugestão',
  OTHER: 'Outro',
};

const DISSATISFACTION_REASON_LABELS: Record<string, string> = {
  NOT_RESOLVED: 'Não resolveu meu problema',
  SLOW_RESPONSE: 'Demorou muito para responder',
  UNCLEAR_RESPONSE: 'Resposta pouco clara',
  OTHER: 'Outro motivo',
};

interface TicketMessage {
  id: string;
  senderNannyId: number | null;
  senderFamilyId: number | null;
  senderAdminId: string | null;
  senderNanny: { name: string | null } | null;
  senderFamily: { name: string | null } | null;
  senderAdmin: { name: string | null } | null;
  body: string;
  createdAt: string;
}

interface TicketDetail {
  id: string;
  subject: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  closedBy: { name: string | null } | null;
  satisfactionRating: boolean | null;
  satisfactionReason: string | null;
  satisfactionComment: string | null;
  satisfactionRatedAt: string | null;
  nanny: {
    id: number;
    name: string | null;
    emailAddress: string | null;
    photoUrl: string | null;
  } | null;
  family: {
    id: number;
    name: string | null;
    emailAddress: string | null;
    photoUrl: string | null;
  } | null;
  messages: TicketMessage[];
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyBody, setReplyBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadTicket = useCallback(async () => {
    try {
      const response = await fetch(`/api/support/tickets/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data);
      } else if (response.status === 404) {
        router.push('/suporte');
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyBody.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`/api/support/tickets/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyBody.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao enviar resposta');
      }

      setReplyBody('');
      toast.success('Resposta enviada');
      await loadTicket();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao enviar resposta',
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);

    try {
      const response = await fetch(`/api/support/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar status');
      }

      toast.success('Status atualizado');
      await loadTicket();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar status',
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Chamado não encontrado.</p>
      </div>
    );
  }

  const userName = ticket.nanny?.name || ticket.family?.name || 'Desconhecido';
  const userEmail =
    ticket.nanny?.emailAddress || ticket.family?.emailAddress || '';
  const userType = ticket.nanny ? 'Babá' : 'Família';
  const isAdminMessage = (msg: TicketMessage) => msg.senderAdminId !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/suporte">
            <ArrowLeft className="mr-1 size-4" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Ticket Info */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{ticket.subject}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    STATUS_CONFIG[ticket.status]?.variant || 'outline'
                  }
                >
                  {STATUS_CONFIG[ticket.status]?.label || ticket.status}
                </Badge>
                <Badge variant="outline">
                  {CATEGORY_LABELS[ticket.category] || ticket.category}
                </Badge>
                <Badge variant="outline">{userType}</Badge>
              </div>
            </div>
            <div>
              <Select
                value={ticket.status}
                onValueChange={handleStatusChange}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Aberto</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                  <SelectItem value="RESOLVED">Resolvido</SelectItem>
                  <SelectItem value="CLOSED">Encerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Usuário:</span>{' '}
              <span className="font-medium">{userName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">E-mail:</span>{' '}
              <span className="font-medium">{userEmail}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Aberto em:</span>{' '}
              <span className="font-medium">
                {new Date(ticket.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {ticket.closedAt && (
              <div>
                <span className="text-muted-foreground">Encerrado em:</span>{' '}
                <span className="font-medium">
                  {new Date(ticket.closedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {ticket.closedBy?.name && ` por ${ticket.closedBy.name}`}
                </span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Avaliação:</span>{' '}
              {ticket.satisfactionRating === null ? (
                <span className="text-muted-foreground">Pendente</span>
              ) : ticket.satisfactionRating ? (
                <Badge variant="default" className="bg-green-600">
                  👍 Positiva
                </Badge>
              ) : (
                <span className="space-y-1">
                  <Badge variant="destructive">👎 Negativa</Badge>
                  {ticket.satisfactionReason && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      —{' '}
                      {DISSATISFACTION_REASON_LABELS[
                        ticket.satisfactionReason
                      ] || ticket.satisfactionReason}
                    </span>
                  )}
                  {ticket.satisfactionComment && (
                    <p className="mt-1 text-sm text-muted-foreground italic">
                      &ldquo;{ticket.satisfactionComment}&rdquo;
                    </p>
                  )}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Mensagens ({ticket.messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {ticket.messages.map((msg) => {
            const fromAdmin = isAdminMessage(msg);
            const senderName = fromAdmin
              ? msg.senderAdmin?.name || 'Admin'
              : msg.senderNanny?.name ||
                msg.senderFamily?.name ||
                'Usuário';

            return (
              <div
                key={msg.id}
                className={`py-4 first:pt-0 last:pb-0 ${fromAdmin ? 'bg-blue-50/50 -mx-6 px-6' : ''}`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {senderName}
                  </span>
                  {fromAdmin && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {msg.body}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Reply Form */}
      {ticket.status !== 'CLOSED' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Responder</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendReply} className="space-y-4">
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Escreva sua resposta ao usuário..."
                rows={4}
              />
              <Button type="submit" disabled={isSending}>
                {isSending ? 'Enviando...' : 'Enviar resposta'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
