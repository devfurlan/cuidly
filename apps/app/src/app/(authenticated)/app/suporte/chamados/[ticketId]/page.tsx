'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Label } from '@/components/ui/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/shadcn/radio-group';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { useUser } from '@/contexts/UserContext';
import { PiArrowLeft, PiThumbsUp, PiThumbsDown } from 'react-icons/pi';
import { toast } from 'sonner';
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_CATEGORY_LABELS,
  DISSATISFACTION_REASON_LABELS,
} from '../../_constants/ticket-labels';
import type {
  TicketCategory,
  TicketDissatisfactionReason,
  TicketStatus,
} from '@cuidly/database';

interface TicketMessage {
  id: string;
  senderNannyId: number | null;
  senderFamilyId: number | null;
  senderAdminId: string | null;
  senderAdmin: { name: string | null } | null;
  body: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  satisfactionRating: boolean | null;
  satisfactionReason: TicketDissatisfactionReason | null;
  satisfactionComment: string | null;
  satisfactionRatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useUser();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyBody, setReplyBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Satisfaction rating state
  const [showReasonForm, setShowReasonForm] = useState(false);
  const [selectedReason, setSelectedReason] =
    useState<TicketDissatisfactionReason | null>(null);
  const [satisfactionComment, setSatisfactionComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const loadTicket = useCallback(async () => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data);
      }
    } catch (error) {
      console.error('Erro ao carregar chamado:', error);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

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
      const response = await fetch(
        `/api/support/tickets/${ticketId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: replyBody.trim() }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }

      setReplyBody('');
      toast.success('Mensagem enviada');
      await loadTicket();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao enviar mensagem',
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmitRating = async (rating: boolean) => {
    if (!rating && !selectedReason) {
      toast.error('Selecione um motivo');
      return;
    }

    setIsSubmittingRating(true);

    try {
      const response = await fetch(
        `/api/support/tickets/${ticketId}/rating`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating,
            reason: rating ? undefined : selectedReason,
            comment: rating
              ? undefined
              : satisfactionComment.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao enviar avaliação');
      }

      toast.success('Agradecemos pela avaliação!');
      await loadTicket();
      setShowReasonForm(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao enviar avaliação',
      );
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const isUserMessage = (msg: TicketMessage) => {
    if (user?.role === 'NANNY') return msg.senderNannyId !== null;
    if (user?.role === 'FAMILY') return msg.senderFamilyId !== null;
    return false;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Chamado não encontrado.</p>
        <Button asChild className="mt-4">
          <Link href="/app/suporte/chamados">Voltar aos chamados</Link>
        </Button>
      </div>
    );
  }

  const isClosed = ticket.status === 'CLOSED';
  const canRate =
    (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') &&
    ticket.satisfactionRating === null;
  const hasRated = ticket.satisfactionRating !== null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/app/suporte/chamados"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <PiArrowLeft className="size-4" />
          Voltar aos chamados
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={TICKET_STATUS_COLORS[ticket.status]}
          >
            {TICKET_STATUS_LABELS[ticket.status]}
          </Badge>
          <Badge variant="outline">
            {TICKET_CATEGORY_LABELS[ticket.category]}
          </Badge>
          <span className="text-xs text-gray-400">
            Aberto em{' '}
            {new Date(ticket.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Message Thread */}
      <Card>
        <CardContent className="divide-y pt-6">
          {ticket.messages.map((msg) => {
            const fromUser = isUserMessage(msg);
            return (
              <div
                key={msg.id}
                className={`py-4 first:pt-0 last:pb-0 ${fromUser ? '' : 'bg-fuchsia-50/50 -mx-6 px-6'}`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {fromUser
                      ? 'Você'
                      : msg.senderAdmin?.name || 'Equipe Cuidly'}
                  </span>
                  <span className="text-xs text-gray-400">
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

      {/* Satisfaction Rating */}
      {canRate && (
        <Card>
          <CardContent className="pt-6">
            {!showReasonForm ? (
              <div className="text-center">
                <p className="mb-4 text-sm font-medium text-gray-700">
                  Como foi o atendimento?
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => handleSubmitRating(true)}
                    disabled={isSubmittingRating}
                  >
                    <PiThumbsUp className="size-5" />
                    Bom
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => setShowReasonForm(true)}
                    disabled={isSubmittingRating}
                  >
                    <PiThumbsDown className="size-5" />
                    Ruim
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">
                  O que podemos melhorar?
                </p>
                <RadioGroup
                  value={selectedReason || ''}
                  onValueChange={(value) =>
                    setSelectedReason(value as TicketDissatisfactionReason)
                  }
                >
                  {(
                    Object.entries(DISSATISFACTION_REASON_LABELS) as [
                      TicketDissatisfactionReason,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem value={value} id={value} />
                      <Label htmlFor={value} className="cursor-pointer text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <Textarea
                  value={satisfactionComment}
                  onChange={(e) => setSatisfactionComment(e.target.value)}
                  placeholder="Conte mais sobre o problema (opcional)"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSubmitRating(false)}
                    disabled={isSubmittingRating || !selectedReason}
                  >
                    {isSubmittingRating ? 'Enviando...' : 'Enviar avaliação'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowReasonForm(false);
                      setSelectedReason(null);
                      setSatisfactionComment('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Already Rated */}
      {hasRated && (
        <Card>
          <CardContent className="py-6 text-center">
            {ticket.satisfactionRating ? (
              <p className="flex items-center justify-center gap-2 text-sm text-green-700">
                <PiThumbsUp className="size-5" />
                Você avaliou este atendimento como positivo. Agradecemos!
              </p>
            ) : (
              <p className="flex items-center justify-center gap-2 text-sm text-red-700">
                <PiThumbsDown className="size-5" />
                Você avaliou este atendimento como negativo. Agradecemos pelo
                retorno!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reply Form */}
      {!isClosed && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSendReply} className="space-y-4">
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Escreva sua resposta..."
                rows={4}
              />
              <Button type="submit" disabled={isSending}>
                {isSending ? 'Enviando...' : 'Enviar resposta'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isClosed && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-gray-500">
              Este chamado foi encerrado. Caso precise de mais ajuda, abra um
              novo chamado.
            </p>
            <Button asChild className="mt-3">
              <Link href="/app/suporte/novo">Abrir novo chamado</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
