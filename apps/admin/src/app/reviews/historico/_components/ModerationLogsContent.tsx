'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/skeleton';
import CardNumberSoft from '@/components/CardNumberSoft';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircleIcon,
  EyeSlashIcon,
  TrashIcon,
  MegaphoneIcon,
  UserIcon,
  StarIcon,
} from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ModerationLog {
  id: string;
  action: string;
  reason: string | null;
  createdAt: string;
  reviewSnapshot: {
    id: number;
    type: string;
    overallRating: number;
    comment: string | null;
    family: { id: number; name: string };
    nanny: { id: number; name: string };
  } | null;
  moderator: {
    id: string;
    name: string;
    email: string;
    photoUrl: string | null;
  };
  review: {
    id: number;
    overallRating: number;
    comment: string | null;
    isVisible: boolean;
    isPublished: boolean;
    family: { id: number; name: string };
    nanny: { id: number; name: string; photoUrl: string | null };
  } | null;
}

interface Stats {
  totalActions: number;
  approved: number;
  hidden: number;
  deleted: number;
  published: number;
}

export default function ModerationLogsContent() {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== 'all') {
        params.append('action', actionFilter);
      }

      const response = await fetch(`/api/moderation-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" weight="fill" />;
      case 'HIDDEN':
        return <EyeSlashIcon className="h-5 w-5 text-orange-600" weight="fill" />;
      case 'DELETED':
        return <TrashIcon className="h-5 w-5 text-red-600" weight="fill" />;
      case 'PUBLISHED':
        return <MegaphoneIcon className="h-5 w-5 text-blue-600" weight="fill" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'APPROVED':
        return 'Aprovada';
      case 'HIDDEN':
        return 'Ocultada';
      case 'DELETED':
        return 'Deletada';
      case 'PUBLISHED':
        return 'Publicada';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'HIDDEN':
        return 'bg-orange-100 text-orange-800';
      case 'DELETED':
        return 'bg-red-100 text-red-800';
      case 'PUBLISHED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReviewerName = (log: ModerationLog) => {
    const data = log.review || log.reviewSnapshot;
    if (!data) return 'Desconhecido';

    // Se é FAMILY_TO_NANNY, família avaliou a babá
    if ('type' in data && data.type === 'FAMILY_TO_NANNY') {
      return data.family.name;
    }
    return data.nanny.name;
  };

  const getReviewedName = (log: ModerationLog) => {
    const data = log.review || log.reviewSnapshot;
    if (!data) return 'Desconhecido';

    // Se é FAMILY_TO_NANNY, família avaliou a babá
    if ('type' in data && data.type === 'FAMILY_TO_NANNY') {
      return data.nanny.name;
    }
    return data.family.name;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
          <CardNumberSoft
            title="Total de Ações"
            value={stats.totalActions}
            color="stone"
            iconName="users-three"
          />
          <CardNumberSoft
            title="Aprovadas"
            value={stats.approved}
            color="green"
            iconName="check-circle"
          />
          <CardNumberSoft
            title="Publicadas"
            value={stats.published}
            color="blue"
            iconName="megaphone"
          />
          <CardNumberSoft
            title="Ocultadas"
            value={stats.hidden}
            color="orange"
            iconName="eye-slash"
          />
          <CardNumberSoft
            title="Deletadas"
            value={stats.deleted}
            color="red"
            iconName="trash"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por acao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as acoes</SelectItem>
            <SelectItem value="APPROVED">Aprovadas</SelectItem>
            <SelectItem value="PUBLISHED">Publicadas</SelectItem>
            <SelectItem value="HIDDEN">Ocultadas</SelectItem>
            <SelectItem value="DELETED">Deletadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[150px] rounded-xl" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum histórico encontrado</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="p-6">
              <div className="flex items-start gap-4">
                {/* Action Icon */}
                <div className="mt-1">{getActionIcon(log.action)}</div>

                {/* Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <Badge className={getActionColor(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserIcon className="h-4 w-4" />
                        <span>
                          Moderado por <strong>{log.moderator.name || log.moderator.email}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Info */}
                  {log.review ? (
                    <div className="mb-3 rounded bg-muted p-4">
                      <div className="mb-2 text-sm">
                        <strong>{getReviewerName(log)}</strong> avaliou{' '}
                        <strong>{getReviewedName(log)}</strong>
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                        <StarIcon className="h-4 w-4 text-yellow-400" weight="fill" />
                        <span className="font-semibold">
                          {log.review.overallRating.toFixed(1)}
                        </span>
                      </div>
                      {log.review.comment && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          &ldquo;{log.review.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : log.reviewSnapshot ? (
                    <div className="mb-3 rounded border border-red-200 bg-red-50 p-4">
                      <div className="mb-2 text-sm font-semibold text-red-600">
                        Avaliacao Deletada
                      </div>
                      <div className="mb-2 text-sm">
                        <strong>{getReviewerName(log)}</strong> avaliou{' '}
                        <strong>{getReviewedName(log)}</strong>
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                        <StarIcon className="h-4 w-4 text-yellow-400" weight="fill" />
                        <span className="font-semibold">
                          {log.reviewSnapshot.overallRating.toFixed(1)}
                        </span>
                      </div>
                      {log.reviewSnapshot.comment && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          &ldquo;{log.reviewSnapshot.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : null}

                  {/* Reason */}
                  {log.reason && (
                    <div className="rounded border border-blue-200 bg-blue-50 p-3">
                      <div className="mb-1 text-xs font-semibold text-blue-900">Motivo:</div>
                      <p className="text-sm text-gray-700">{log.reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
