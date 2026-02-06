'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { WarningIcon } from '@phosphor-icons/react';

interface PrivacyWarningDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PrivacyWarningDialog({
  open,
  onConfirm,
  onCancel,
}: PrivacyWarningDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <WarningIcon className="h-6 w-6 text-yellow-600" weight="fill" />
            </div>
            <DialogTitle>Aviso de Privacidade</DialogTitle>
          </div>
          <div className="text-left pt-4 space-y-4 text-sm text-muted-foreground">
            <p>
              Você está prestes a visualizar o conteúdo de uma conversa privada
              entre usuários da plataforma.
            </p>
            <p>
              <strong>Este acesso será registrado</strong> para fins de auditoria.
              O registro incluirá seu identificador de usuário, data e hora do
              acesso.
            </p>
            <p>
              Esta funcionalidade deve ser utilizada apenas para:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Investigação de denúncias de abuso</li>
              <li>Verificação de comportamento inadequado</li>
              <li>Garantia da segurança da comunidade</li>
            </ul>
            <p>
              O uso indevido desta funcionalidade pode resultar em medidas
              disciplinares.
            </p>
          </div>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-4 border-t">
          <Checkbox
            id="acknowledge"
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
          />
          <Label htmlFor="acknowledge" className="text-sm">
            Declaro que estou ciente das responsabilidades e que este acesso é
            para fins legítimos de moderação.
          </Label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={!acknowledged}>
            Confirmar e visualizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
