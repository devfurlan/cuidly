'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/useToast';
import { Job } from '../schema';

interface DeactivateJobDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeactivateJobDialog({
  job,
  open,
  onOpenChange,
}: DeactivateJobDialogProps) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeactivate() {
    if (!reason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Motivo obrigatório',
        description: 'Por favor, informe o motivo da desativação.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/jobs/${job.id}?reason=${encodeURIComponent(reason)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao desativar vaga');
      }

      toast({
        variant: 'success',
        title: 'Vaga desativada',
        description: `A vaga "${job.title}" foi desativada com sucesso.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao desativar vaga',
        description:
          error instanceof Error ? error.message : 'Por favor, tente novamente.',
      });
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desativar vaga</DialogTitle>
          <DialogDescription>
            Você está prestes a desativar a vaga &quot;{job.title}&quot;. Esta ação
            irá encerrar a vaga e notificar a família. Por favor, informe o motivo
            da desativação para fins de auditoria.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da desativação</Label>
            <Textarea
              id="reason"
              placeholder="Informe o motivo da moderação..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeactivate}
            disabled={isLoading}
          >
            {isLoading ? 'Desativando...' : 'Desativar vaga'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
