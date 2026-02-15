'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import { PiArrowLeft, PiChatCircle } from 'react-icons/pi';
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_CATEGORY_LABELS,
} from '../_constants/ticket-labels';
import type { TicketCategory, TicketStatus } from '@cuidly/database';

interface TicketListItem {
  id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: { body: string; createdAt: string }[];
}

export default function ChamadosPage() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        const response = await fetch('/api/support/tickets');
        if (response.ok) {
          const data = await response.json();
          setTickets(data);
        }
      } catch (error) {
        console.error('Erro ao carregar chamados:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTickets();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/app/suporte"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <PiArrowLeft className="size-4" />
          Voltar ao Suporte
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Chamados</h1>
            <p className="mt-1 text-gray-500">
              Acompanhe o status das suas solicitações.
            </p>
          </div>
          <Button asChild>
            <Link href="/app/suporte/novo">
              <PiChatCircle className="mr-2 size-4" />
              Novo chamado
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              Você ainda não abriu nenhum chamado.
            </p>
            <Button asChild className="mt-4">
              <Link href="/app/suporte/novo">Abrir primeiro chamado</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/app/suporte/chamados/${ticket.id}`}>
              <Card className="mt-3 transition-colors hover:bg-gray-50">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900">
                        {ticket.subject}
                      </h3>
                      {(ticket.messages?.length ?? 0) > 0 && (
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {ticket.messages[0].body}
                        </p>
                      )}
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
                          {new Date(ticket.createdAt).toLocaleDateString(
                            'pt-BR',
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
