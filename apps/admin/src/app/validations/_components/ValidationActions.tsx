'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';

interface ValidationActionsProps {
  validationId: string;
  nannyName: string;
  status: string;
}

export default function ValidationActions({
  validationId,
  nannyName,
  status,
}: ValidationActionsProps) {
  const router = useRouter();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isCompleted = status === 'COMPLETED' || status === 'FAILED';

  async function handleApprove() {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/validation-requests/${validationId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao aprovar validação');
      }

      toast({
        variant: 'success',
        title: 'Validação aprovada',
        description: `A validação de ${nannyName} foi aprovada com sucesso.`,
      });
      setShowApproveDialog(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao aprovar validação',
        description:
          error instanceof Error ? error.message : 'Por favor, tente novamente.',
      });
    }
    setIsLoading(false);
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Motivo obrigatório',
        description: 'Por favor, informe o motivo da rejeição.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/validation-requests/${validationId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao rejeitar validação');
      }

      toast({
        variant: 'success',
        title: 'Validação rejeitada',
        description: `A validação de ${nannyName} foi rejeitada.`,
      });
      setShowRejectDialog(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao rejeitar validação',
        description:
          error instanceof Error ? error.message : 'Por favor, tente novamente.',
      });
    }
    setIsLoading(false);
  }

  if (isCompleted) {
    return (
      <div className="text-sm text-muted-foreground">
        Esta validação já foi {status === 'COMPLETED' ? 'concluída' : 'rejeitada'}.
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4">
        <Button
          onClick={() => setShowApproveDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircleIcon className="mr-2 h-4 w-4" />
          Aprovar
        </Button>
        <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>
          <XCircleIcon className="mr-2 h-4 w-4" />
          Rejeitar
        </Button>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar validação</DialogTitle>
            <DialogDescription>
              Você está prestes a aprovar a validação de <strong>{nannyName}</strong>.
              Esta ação irá marcar o CPF e dados pessoais da babá como validados.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Aprovando...' : 'Confirmar aprovação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar validação</DialogTitle>
            <DialogDescription>
              Você está prestes a rejeitar a validação de <strong>{nannyName}</strong>.
              Por favor, informe o motivo da rejeição.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da rejeição</Label>
              <Textarea
                id="reason"
                placeholder="Informe o motivo da rejeição..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading}
            >
              {isLoading ? 'Rejeitando...' : 'Confirmar rejeição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
