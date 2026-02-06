'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  PiCamera,
  PiShieldCheck,
  PiSpinner,
  PiUpload,
  PiX,
} from 'react-icons/pi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { Button } from '@/components/ui/shadcn/button';
import { Label } from '@/components/ui/shadcn/label';
import { useApiError } from '@/hooks/useApiError';
import { NannyProUpsellModal } from '@/components/subscription/nanny-pro-upsell-modal';

interface SelfieValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  hasActivePlan: boolean;
}

interface SelfieUpload {
  id: string;
  signedUrl: string | null;
}

export function SelfieValidationModal({
  open,
  onOpenChange,
  onSuccess,
  hasActivePlan,
}: SelfieValidationModalProps) {
  const { showError, showSuccess, showWarning } = useApiError();

  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [upload, setUpload] = useState<SelfieUpload | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Carregar selfie existente quando o modal abre
  const fetchUpload = useCallback(async () => {
    try {
      const response = await fetch('/api/validation/selfie/upload');
      if (response.ok) {
        const data = await response.json();
        if (data.upload) {
          setUpload(data.upload);
          setPreview(data.upload.signedUrl);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar selfie:', error);
    }
  }, []);

  // Carregar quando o modal abre
  useEffect(() => {
    if (open && hasActivePlan) {
      fetchUpload();
    }
  }, [open, hasActivePlan, fetchUpload]);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(upload?.signedUrl || null);
    }
  };

  const handleUploadSelfie = async () => {
    if (!file) {
      showWarning('Selecione uma selfie para enviar', true);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('selfie', file);

      const response = await fetch('/api/validation/selfie/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Selfie enviada com sucesso!');
        setFile(null);
        setUpload({ id: data.upload?.id || '', signedUrl: data.signedUrl });
        setPreview(data.signedUrl);
      } else {
        showError(new Error(data.error));
      }
    } catch (error) {
      showError(error, 'Erro ao enviar selfie');
    } finally {
      setIsUploading(false);
    }
  };

  const handleValidateSelfie = async () => {
    setIsValidating(true);

    try {
      const response = await fetch('/api/validation/selfie', {
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
          data.error || 'Erro na validação. Verifique sua selfie.',
          true
        );
      }
    } catch (error) {
      showError(error, 'Erro ao processar validação');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveSelfie = () => {
    setFile(null);
    setPreview(upload?.signedUrl || null);
  };

  const hasUploadedSelfie = upload !== null;
  const hasNewFile = file !== null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiShieldCheck className="size-5 text-purple-600" />
            Validação de Selfie
          </DialogTitle>
          <DialogDescription>
            Envie uma selfie para validar sua identidade (Prova de Vida)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload area */}
          <div className="space-y-2">
            <Label>Sua Selfie *</Label>
            <div className="relative">
              {preview ? (
                <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-lg border">
                  <Image
                    src={preview}
                    alt="Selfie"
                    fill
                    className="object-cover"
                  />
                  {hasNewFile && (
                    <button
                      type="button"
                      onClick={handleRemoveSelfie}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <PiX className="size-4" />
                    </button>
                  )}
                </div>
              ) : (
                <label className="mx-auto flex aspect-square w-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-purple-400 hover:bg-gray-100">
                  <PiCamera className="size-10 text-gray-400" />
                  <span className="mt-2 text-center text-sm text-gray-500">
                    Clique para selecionar
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(e.target.files?.[0] || null)
                    }
                  />
                </label>
              )}
            </div>
            {!hasNewFile && !hasUploadedSelfie && (
              <p className="text-center text-xs text-gray-500">
                JPG, PNG ou WebP - Máximo 5MB
              </p>
            )}
          </div>

          {/* Instruções */}
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            <p className="font-medium text-gray-700">
              Dicas para uma boa validação:
            </p>
            <ul className="mt-1 list-inside list-disc space-y-1">
              <li>Use boa iluminação</li>
              <li>Mantenha o rosto bem visível</li>
              <li>Olhe diretamente para a câmera</li>
              <li>Evite óculos escuros ou chapéus</li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-3">
            {/* Botão de trocar/selecionar selfie */}
            {(hasUploadedSelfie || hasNewFile) && !hasNewFile && (
              <label className="cursor-pointer">
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <PiCamera className="mr-2 size-4" />
                    Trocar Selfie
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] || null)
                  }
                />
              </label>
            )}

            {/* Botão de upload */}
            {hasNewFile && (
              <Button
                onClick={handleUploadSelfie}
                disabled={isUploading}
                variant="outline"
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <PiSpinner className="mr-2 size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <PiUpload className="mr-2 size-4" />
                    Enviar Selfie
                  </>
                )}
              </Button>
            )}

            {/* Botão de validação */}
            {hasUploadedSelfie && !hasNewFile && (
              <Button
                onClick={handleValidateSelfie}
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
                    Validar Selfie
                  </>
                )}
              </Button>
            )}
          </div>

          {!hasUploadedSelfie && !hasNewFile && (
            <p className="text-center text-sm text-gray-500">
              Selecione uma selfie para continuar
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
