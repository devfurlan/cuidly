'use client';

import { useState } from 'react';
import { PiFlag, PiWarning, PiSpinner } from 'react-icons/pi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { Button } from '@/components/ui/shadcn/button';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { toast } from 'sonner';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'NANNY' | 'JOB';
  targetId: number;
  targetName: string;
}

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      toast.error('Por favor, descreva o motivo com pelo menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setReason('');
        onClose();
      } else {
        toast.error(data.error || 'Erro ao enviar denúncia');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Erro ao enviar denúncia. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetLabel = targetType === 'NANNY' ? 'perfil' : 'vaga';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiFlag className="size-5 text-red-500" />
            Denunciar {targetLabel}
          </DialogTitle>
          <DialogDescription>
            Você está denunciando: <strong>{targetName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <PiWarning className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">
                Denúncias falsas podem resultar em restrições na sua conta.
                Use este recurso apenas para reportar conteúdo que viole
                nossas diretrizes.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Descreva o motivo da denúncia *
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explique por que você está denunciando este conteúdo..."
              className="min-h-32"
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {reason.length}/2000 caracteres (mínimo 10)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || reason.trim().length < 10}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <PiSpinner className="mr-2 size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <PiFlag className="mr-2 size-4" />
                Enviar Denúncia
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
