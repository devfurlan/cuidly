'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AuditLog, ACTION_LABELS, TABLE_LABELS, ACTION_SEVERITY } from './schema';

const getSeverityVariant = (
  severity: 'low' | 'medium' | 'high'
): 'default' | 'secondary' | 'destructive' => {
  switch (severity) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    default:
      return 'default';
  }
};

function JsonViewer({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return <span className="text-muted-foreground">Sem dados</span>;
  }

  const formatValue = (value: unknown, indent: number = 0): React.ReactNode => {
    const indentStyle = { marginLeft: `${indent * 16}px` };

    if (value === null) {
      return <span className="text-muted-foreground">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-blue-600">{value ? 'true' : 'false'}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-green-600">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-orange-600">&quot;{value}&quot;</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span>[]</span>;
      }
      return (
        <div style={indentStyle}>
          <span>[</span>
          {value.map((item, index) => (
            <div key={index} style={{ marginLeft: '16px' }}>
              {formatValue(item, indent + 1)}
              {index < value.length - 1 && ','}
            </div>
          ))}
          <span>]</span>
        </div>
      );
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <span>{'{}'}</span>;
      }
      return (
        <div>
          <span>{'{'}</span>
          {entries.map(([key, val], index) => (
            <div key={key} style={{ marginLeft: '16px' }}>
              <span className="text-purple-600">&quot;{key}&quot;</span>
              <span>: </span>
              {formatValue(val, indent + 1)}
              {index < entries.length - 1 && ','}
            </div>
          ))}
          <span>{'}'}</span>
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="rounded-md bg-muted p-4 font-mono text-sm">
      {formatValue(data)}
    </div>
  );
}

export function AuditLogDetailsModal() {
  const [log, setLog] = useState<AuditLog | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = (event: CustomEvent<AuditLog>) => {
      setLog(event.detail);
      setOpen(true);
    };

    window.addEventListener(
      'openAuditLogDetails',
      handleOpen as EventListener
    );

    return () => {
      window.removeEventListener(
        'openAuditLogDetails',
        handleOpen as EventListener
      );
    };
  }, []);

  if (!log) return null;

  const severity = ACTION_SEVERITY[log.action] || 'low';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
          <DialogDescription>
            Informações completas sobre a ação registrada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Data/Hora
              </label>
              <p className="mt-1">
                {format(new Date(log.createdAt), "dd/MM/yyyy 'as' HH:mm:ss", {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                ID
              </label>
              <p className="mt-1">
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {log.id}
                </code>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Administrador
              </label>
              <div className="mt-1">
                {log.user ? (
                  <>
                    <p className="font-medium">{log.user.name || 'Sem nome'}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.user.email}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Sistema</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Acao
              </label>
              <div className="mt-1">
                <Badge variant={getSeverityVariant(severity)}>
                  {ACTION_LABELS[log.action] || log.action}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tabela/Entidade
              </label>
              <p className="mt-1">{TABLE_LABELS[log.table] || log.table}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                ID do Registro
              </label>
              <p className="mt-1">
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                  {log.recordId}
                </code>
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Dados
            </label>
            <ScrollArea className="mt-1 h-[300px] rounded-md border">
              <div className="p-4">
                <JsonViewer data={log.data} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
