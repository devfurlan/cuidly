'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SupportTicketRow } from './SupportContent';

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
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

interface Props {
  tickets: SupportTicketRow[];
  onUpdate: () => void;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export default function SupportTable({
  tickets,
  pagination,
  onPageChange,
}: Props) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">Nenhum chamado encontrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead>Msgs</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => {
              const userName =
                ticket.nanny?.name || ticket.family?.name || 'Desconhecido';
              const userType = ticket.nannyId ? 'Babá' : 'Família';

              return (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{userName}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {userType}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-1">{ticket.subject}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {CATEGORY_LABELS[ticket.category] || ticket.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        STATUS_CONFIG[ticket.status]?.variant || 'outline'
                      }
                    >
                      {STATUS_CONFIG[ticket.status]?.label || ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {ticket.satisfactionRating === null
                        ? '—'
                        : ticket.satisfactionRating
                          ? '👍'
                          : '👎'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {ticket._count.messages}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/suporte/${ticket.id}`}>Ver</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
