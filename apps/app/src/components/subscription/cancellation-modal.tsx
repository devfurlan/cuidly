'use client';

/**
 * Cancellation Modal Component
 *
 * Multi-step modal for subscription cancellation:
 * 1. Retention - Show benefits user will lose
 * 2. Reason - Collect cancellation reason
 * 3. Confirmation - Show cancellation success
 */

import { cn } from '@cuidly/shared';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import {
  PiArrowLeft,
  PiBriefcase,
  PiChatCircle,
  PiCheckCircle,
  PiCircleNotch,
  PiCrown,
  PiMagnifyingGlass,
  PiRocket,
  PiShieldCheck,
  PiSparkle,
  PiStar,
  PiWarningCircle,
} from 'react-icons/pi';

import { Button } from '@/components/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { Label } from '@/components/ui/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/shadcn/radio-group';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { toast } from 'sonner';

type CancellationStep = 'retention' | 'reason' | 'confirmation';

type CancellationReason =
  | 'FOUND_WHAT_I_NEEDED'
  | 'TOO_EXPENSIVE'
  | 'NOT_USING'
  | 'MISSING_FEATURES'
  | 'TECHNICAL_ISSUES'
  | 'OTHER';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userType: 'family' | 'nanny';
  currentPeriodEnd: Date;
}

const CANCELLATION_REASONS: { value: CancellationReason; label: string }[] = [
  { value: 'FOUND_WHAT_I_NEEDED', label: 'Encontrei o que precisava' },
  { value: 'TOO_EXPENSIVE', label: 'Muito caro' },
  { value: 'NOT_USING', label: 'Não estou usando' },
  { value: 'MISSING_FEATURES', label: 'Funcionalidades insuficientes' },
  { value: 'TECHNICAL_ISSUES', label: 'Problemas técnicos' },
  { value: 'OTHER', label: 'Outro motivo' },
];

const FAMILY_BENEFITS = [
  { icon: PiChatCircle, text: 'Chat ilimitado com babás' },
  { icon: PiMagnifyingGlass, text: 'Matching inteligente' },
  { icon: PiBriefcase, text: 'Até 3 vagas ativas (30 dias)' },
  { icon: PiStar, text: 'Avaliações completas' },
  { icon: PiRocket, text: '1 boost por mês' },
];

const NANNY_BENEFITS = [
  { icon: PiChatCircle, text: 'Mensagens ilimitadas' },
  { icon: PiSparkle, text: 'Perfil em destaque' },
  { icon: PiCrown, text: 'Matching prioritário' },
  { icon: PiShieldCheck, text: 'Selos Verificada / Confiável' },
];

export function CancellationModal({
  isOpen,
  onClose,
  onSuccess,
  userType,
  currentPeriodEnd,
}: CancellationModalProps) {
  const [currentStep, setCurrentStep] = useState<CancellationStep>('retention');
  const [selectedReason, setSelectedReason] =
    useState<CancellationReason | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const benefits = userType === 'family' ? FAMILY_BENEFITS : NANNY_BENEFITS;

  const handleClose = () => {
    // Reset state when closing
    setCurrentStep('retention');
    setSelectedReason(null);
    setFeedback('');
    onClose();
  };

  const handleContinueToReason = () => {
    setCurrentStep('reason');
  };

  const handleBackToRetention = () => {
    setCurrentStep('retention');
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    // Validate feedback for 'OTHER' reason
    if (selectedReason === 'OTHER' && !feedback.trim()) {
      toast.error('Por favor, descreva o motivo do cancelamento');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: selectedReason,
          feedback: feedback.trim() || undefined,
        }),
      });

      if (response.ok) {
        setCurrentStep('confirmation');
        onSuccess?.();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao cancelar assinatura');
      }
    } catch {
      toast.error('Erro ao cancelar assinatura');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = format(currentPeriodEnd, "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const isSubmitDisabled =
    !selectedReason ||
    isSubmitting ||
    (selectedReason === 'OTHER' && !feedback.trim());

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[calc(100%-3rem)] overflow-hidden rounded-2xl border-0 p-0 sm:max-w-md">
        {/* Step 1: Retention */}
        {currentStep === 'retention' && (
          <>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 px-4 pt-8 pb-6 text-center sm:px-6 sm:pt-10 sm:pb-8">
              {/* Decorative elements */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -right-4 size-24 rounded-full bg-white/10" />
                <div className="absolute bottom-0 -left-8 size-32 rounded-full bg-white/5" />
              </div>

              {/* Icon */}
              <div className="relative mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:mb-4 sm:size-16">
                <PiWarningCircle className="size-7 text-white sm:size-8" />
              </div>

              <DialogTitle className="mb-2 text-xl font-bold text-white sm:text-2xl">
                Tem certeza?
              </DialogTitle>
              <DialogDescription className="text-sm text-orange-100 sm:text-base">
                Ao cancelar, você perderá acesso a esses benefícios
              </DialogDescription>
            </div>

            {/* Body */}
            <div className="bg-white p-4 sm:p-6">
              {/* Benefits List */}
              <div className="mb-6 space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <benefit.icon className="size-5 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Access until info */}
              <div className="mb-6 rounded-lg bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  Você continuará tendo acesso até{' '}
                  <strong>{formattedDate}</strong>
                </p>
              </div>

              {/* CTA Buttons */}
              <Button
                onClick={handleClose}
                className="w-full bg-linear-to-r from-fuchsia-500 to-purple-600 text-white hover:from-fuchsia-600 hover:to-purple-700"
                size="lg"
              >
                <PiCrown className="size-4" />
                Manter meu plano
              </Button>

              <Button
                variant="ghost"
                onClick={handleContinueToReason}
                className="mt-3 w-full text-gray-400 hover:text-gray-600"
              >
                Continuar cancelando
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Reason */}
        {currentStep === 'reason' && (
          <>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 px-4 pt-8 pb-6 text-center sm:px-6 sm:pt-10 sm:pb-8">
              <DialogTitle className="mb-2 text-xl font-bold text-white sm:text-2xl">
                Nos ajude a melhorar
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-300 sm:text-base">
                Qual o motivo do cancelamento?
              </DialogDescription>
            </div>

            {/* Body */}
            <div className="bg-white p-4 sm:p-6">
              <RadioGroup
                value={selectedReason ?? undefined}
                onValueChange={(value) =>
                  setSelectedReason(value as CancellationReason)
                }
                className="space-y-2"
              >
                {CANCELLATION_REASONS.map((reason) => (
                  <div
                    key={reason.value}
                    className={cn(
                      'flex cursor-pointer items-center space-x-3 rounded-lg border-2 p-3 transition-colors',
                      selectedReason === reason.value
                        ? 'border-fuchsia-500 bg-fuchsia-50'
                        : 'border-gray-200 hover:border-gray-300',
                    )}
                    onClick={() => setSelectedReason(reason.value)}
                  >
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label
                      htmlFor={reason.value}
                      className="flex-1 cursor-pointer text-sm font-medium"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Feedback textarea (visible when OTHER is selected) */}
              {selectedReason === 'OTHER' && (
                <div className="mt-4">
                  <Textarea
                    placeholder="Conte-nos mais sobre seu motivo..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-24 resize-none"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  onClick={handleBackToRetention}
                  className="w-full bg-linear-to-r from-fuchsia-500 to-purple-600 text-white hover:from-fuchsia-600 hover:to-purple-700"
                  size="lg"
                >
                  <PiArrowLeft className="size-4" />
                  Voltar e manter meu plano
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <PiCircleNotch className="mr-1 inline size-4 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    'Confirmar cancelamento'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 'confirmation' && (
          <>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-emerald-600 px-4 pt-8 pb-6 text-center sm:px-6 sm:pt-10 sm:pb-8">
              {/* Icon */}
              <div className="relative mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:mb-4 sm:size-16">
                <PiCheckCircle className="size-7 text-white sm:size-8" />
              </div>

              <DialogTitle className="mb-2 text-xl font-bold text-white sm:text-2xl">
                Cancelamento agendado
              </DialogTitle>
              <DialogDescription className="text-sm text-green-100 sm:text-base">
                Sua assinatura será cancelada ao final do período
              </DialogDescription>
            </div>

            {/* Body */}
            <div className="bg-white p-4 sm:p-6">
              <div className="mb-6 rounded-lg bg-green-50 p-4 text-center">
                <p className="text-sm text-green-800">
                  Você continuará tendo acesso aos recursos do plano até{' '}
                  <strong>{formattedDate}</strong>
                </p>
              </div>

              <Button onClick={handleClose} className="w-full" size="lg">
                Entendi
              </Button>

              <p className="mt-4 text-center text-xs text-gray-500">
                Mudou de ideia? Você pode reverter o cancelamento a qualquer
                momento antes da data de expiração.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
