'use client';

import { useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DotsThreeVertical,
  User,
  Briefcase,
  X,
  Pause,
  Trash,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Report {
  id: number;
  targetType: 'NANNY' | 'JOB';
  reason: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  action: string | null;
  createdAt: string;
  targetNanny: { id: number; name: string; slug: string; photoUrl: string | null } | null;
  targetJob: { id: number; title: string } | null;
  reporterNanny: { id: number; name: string } | null;
  reporterFamily: { id: number; name: string } | null;
  actionTakenBy: { id: string; name: string | null; email: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ReportsTableProps {
  reports: Report[];
  onReportUpdate: () => void;
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendente', variant: 'default' },
  REVIEWED: { label: 'Revisada', variant: 'secondary' },
  DISMISSED: { label: 'Dispensada', variant: 'outline' },
};

const ACTION_LABELS: Record<string, string> = {
  DISMISSED: 'Dispensada',
  SUSPENDED: 'Suspenso',
  DELETED: 'Excluído',
};

export default function ReportsTable({
  reports,
  onReportUpdate,
  pagination,
  onPageChange,
}: ReportsTableProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<'dismiss' | 'suspend' | 'delete' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async () => {
    if (!selectedReport || !actionType) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          actionNote: actionNote || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        onReportUpdate();
        closeDialog();
      } else {
        toast.error(data.error || 'Erro ao processar ação');
      }
    } catch (error) {
      console.error('Error processing action:', error);
      toast.error('Erro ao processar ação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDialog = () => {
    setSelectedReport(null);
    setActionType(null);
    setActionNote('');
  };

  const openActionDialog = (report: Report, action: 'dismiss' | 'suspend' | 'delete') => {
    setSelectedReport(report);
    setActionType(action);
  };

  const getReporterName = (report: Report) => {
    if (report.reporterFamily) return report.reporterFamily.name;
    if (report.reporterNanny) return report.reporterNanny.name;
    return 'Anônimo';
  };

  const getTargetName = (report: Report) => {
    if (report.targetNanny) return report.targetNanny.name;
    if (report.targetJob) return report.targetJob.title;
    return 'N/A';
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'dismiss':
        return 'Dispensar Denúncia';
      case 'suspend':
        return 'Suspender Alvo';
      case 'delete':
        return 'Excluir Alvo';
      default:
        return '';
    }
  };

  const getActionDescription = () => {
    const targetName = selectedReport ? getTargetName(selectedReport) : '';
    switch (actionType) {
      case 'dismiss':
        return 'Esta ação irá dispensar a denúncia sem tomar nenhuma ação contra o alvo.';
      case 'suspend':
        return `Esta ação irá suspender temporariamente "${targetName}".`;
      case 'delete':
        return `Esta ação irá excluir permanentemente "${targetName}". Esta ação não pode ser desfeita.`;
      default:
        return '';
    }
  };

  if (reports.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">Nenhuma denúncia encontrada</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Alvo</TableHead>
              <TableHead>Denunciante</TableHead>
              <TableHead className="max-w-[300px]">Motivo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {report.targetType === 'NANNY' ? (
                      <User className="size-4 text-fuchsia-500" weight="bold" />
                    ) : (
                      <Briefcase className="size-4 text-blue-500" weight="bold" />
                    )}
                    <span className="text-sm">
                      {report.targetType === 'NANNY' ? 'Perfil' : 'Vaga'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {report.targetNanny && (
                      <>
                        <Avatar className="size-8">
                          <AvatarImage src={report.targetNanny.photoUrl || undefined} />
                          <AvatarFallback>
                            {report.targetNanny.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{report.targetNanny.name}</span>
                      </>
                    )}
                    {report.targetJob && (
                      <span className="font-medium">{report.targetJob.title}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={report.reporterFamily || report.reporterNanny ? '' : 'text-muted-foreground italic'}>
                    {getReporterName(report)}
                  </span>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {report.reason}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={STATUS_LABELS[report.status].variant}>
                      {STATUS_LABELS[report.status].label}
                    </Badge>
                    {report.action && (
                      <span className="text-xs text-muted-foreground">
                        {ACTION_LABELS[report.action]}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(report.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  {report.status === 'PENDING' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <DotsThreeVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openActionDialog(report, 'dismiss')}>
                          <X className="mr-2 size-4" />
                          Dispensar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openActionDialog(report, 'suspend')}>
                          <Pause className="mr-2 size-4" />
                          Suspender
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openActionDialog(report, 'delete')}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 size-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} denúncias
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <CaretLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <CaretRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>{getActionDescription()}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedReport && (
              <div className="rounded-lg bg-muted p-4">
                <p className="mb-2 text-sm font-medium">Motivo da denúncia:</p>
                <p className="text-sm text-muted-foreground">{selectedReport.reason}</p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Nota (opcional)
              </label>
              <Textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Adicione uma nota sobre esta ação..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleAction}
              disabled={isSubmitting}
              variant={actionType === 'delete' ? 'destructive' : 'default'}
            >
              {isSubmitting ? 'Processando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
