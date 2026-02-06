'use client';

import { useState } from 'react';
import {
  PiShieldCheck,
  PiSpinner,
  PiWarningCircle,
} from 'react-icons/pi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { Button } from '@/components/ui/shadcn/button';
import { useApiError } from '@/hooks/useApiError';
import { NannyProUpsellModal } from '@/components/subscription/nanny-pro-upsell-modal';

interface BackgroundCheckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  hasActivePlan: boolean;
  cpf: string | null;
}

/**
 * Mascara o CPF mostrando apenas os 3 primeiros e 2 últimos dígitos
 */
function maskCpf(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return '***.***.***-**';
  return `${cleaned.slice(0, 3)}.***.***-${cleaned.slice(-2)}`;
}

export function BackgroundCheckModal({
  open,
  onOpenChange,
  onSuccess,
  hasActivePlan,
  cpf,
}: BackgroundCheckModalProps) {
  const { showError, showSuccess, showWarning } = useApiError();

  const [isValidating, setIsValidating] = useState(false);

  const handleValidateBackgroundCheck = async () => {
    setIsValidating(true);

    try {
      const response = await fetch('/api/validation/background-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccess(data.message);
        onSuccess();
        onOpenChange(false);
      } else {
        showWarning(
          data.error || 'Erro na validação. Verifique seus dados.',
          true
        );
      }
    } catch (error) {
      showError(error, 'Erro ao processar validação');
    } finally {
      setIsValidating(false);
    }
  };

  // Se não tem plano ativo - mostrar modal de upgrade
  if (!hasActivePlan) {
    return (
      <NannyProUpsellModal
        isOpen={open}
        onClose={() => onOpenChange(false)}
        feature="validation"
      />
    );
  }

  // Se CPF não está preenchido
  if (!cpf) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PiWarningCircle className="size-5 text-amber-600" />
              CPF Necessário
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Para validar seus antecedentes, é necessário ter o CPF preenchido
              no seu perfil. Acesse a aba &quot;Informações&quot; e preencha seu
              CPF.
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiShieldCheck className="size-5 text-purple-600" />
            Validação de Antecedentes
          </DialogTitle>
          <DialogDescription>
            Verificação de antecedentes criminais para maior segurança
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* CPF Info */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              A validação será feita com base no seu CPF cadastrado:
            </p>
            <p className="mt-2 text-center text-lg font-mono font-semibold text-gray-800">
              {maskCpf(cpf)}
            </p>
          </div>

          {/* Explicação */}
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Esta validação consulta bancos de dados públicos para verificar se
              existem pendências ou registros em seu nome.
            </p>
            <p>
              O resultado será processado automaticamente e seu selo será
              atualizado se aprovado.
            </p>
          </div>

          {/* Consentimento */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">Importante:</p>
            <p className="mt-1">
              Ao clicar em &quot;Validar&quot;, você autoriza a consulta de seus
              dados em bases públicas conforme nossa política de privacidade
              (LGPD).
            </p>
          </div>

          {/* Botão */}
          <Button
            onClick={handleValidateBackgroundCheck}
            disabled={isValidating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isValidating ? (
              <>
                <PiSpinner className="mr-2 size-4 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <PiShieldCheck className="mr-2 size-4" />
                Validar Antecedentes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
