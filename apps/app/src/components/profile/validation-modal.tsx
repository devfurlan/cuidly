'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  PiCamera,
  PiFile,
  PiShieldCheck,
  PiSpinner,
  PiUpload,
  PiX,
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
import { Label } from '@/components/ui/shadcn/label';
import { useApiError } from '@/hooks/useApiError';
import { NannyProUpsellModal } from '@/components/subscription/nanny-pro-upsell-modal';

interface ValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  hasActivePlan: boolean;
  documentValidated: boolean;
}

interface DocumentUpload {
  id: string;
  type: 'DOCUMENT_FRONT' | 'DOCUMENT_BACK' | 'SELFIE';
  signedUrl: string | null;
}

export function ValidationModal({
  open,
  onOpenChange,
  onSuccess,
  hasActivePlan,
  documentValidated,
}: ValidationModalProps) {
  const { showError, showSuccess, showWarning } = useApiError();

  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [uploads, setUploads] = useState<DocumentUpload[]>([]);

  const [files, setFiles] = useState<{
    documentFront: File | null;
    documentBack: File | null;
    selfie: File | null;
  }>({
    documentFront: null,
    documentBack: null,
    selfie: null,
  });

  const [previews, setPreviews] = useState<{
    documentFront: string | null;
    documentBack: string | null;
    selfie: string | null;
  }>({
    documentFront: null,
    documentBack: null,
    selfie: null,
  });

  // Carregar uploads existentes quando o modal abre
  const fetchUploads = useCallback(async () => {
    try {
      const response = await fetch('/api/validation/upload');
      if (response.ok) {
        const data = await response.json();
        setUploads(data.uploads || []);

        // Preencher previews com uploads existentes
        const newPreviews: typeof previews = {
          documentFront: null,
          documentBack: null,
          selfie: null,
        };
        for (const upload of data.uploads || []) {
          if (upload.type === 'DOCUMENT_FRONT') {
            newPreviews.documentFront = upload.signedUrl;
          } else if (upload.type === 'DOCUMENT_BACK') {
            newPreviews.documentBack = upload.signedUrl;
          } else if (upload.type === 'SELFIE') {
            newPreviews.selfie = upload.signedUrl;
          }
        }
        setPreviews(newPreviews);
      }
    } catch (error) {
      console.error('Erro ao buscar uploads:', error);
    }
  }, []);

  // Carregar uploads quando o modal abre
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      fetchUploads();
    }
    onOpenChange(newOpen);
  };

  const handleFileChange = (
    type: 'documentFront' | 'documentBack' | 'selfie',
    file: File | null
  ) => {
    setFiles((prev) => ({ ...prev, [type]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => ({ ...prev, [type]: null }));
    }
  };

  const handleUploadDocuments = async () => {
    if (!files.documentFront || !files.selfie) {
      showWarning('Documento (frente) e selfie são obrigatórios', true);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('documentFront', files.documentFront);
      if (files.documentBack) {
        formData.append('documentBack', files.documentBack);
      }
      formData.append('selfie', files.selfie);

      const response = await fetch('/api/validation/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Documentos enviados com sucesso!');
        setFiles({ documentFront: null, documentBack: null, selfie: null });
        await fetchUploads();
      } else {
        showError(new Error(data.error));
      }
    } catch (error) {
      showError(error, 'Erro ao enviar documentos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleValidatePremium = async () => {
    setIsValidating(true);

    try {
      const response = await fetch('/api/validation/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccess(data.message);
        onSuccess();
        onOpenChange(false);
      } else {
        showWarning(data.error || 'Erro na validação. Verifique seus documentos.', true);
      }
    } catch (error) {
      showError(error, 'Erro ao processar validação');
    } finally {
      setIsValidating(false);
    }
  };

  const hasRequiredUploads =
    uploads.some((u) => u.type === 'DOCUMENT_FRONT') &&
    uploads.some((u) => u.type === 'SELFIE');

  const hasNewFiles = files.documentFront || files.selfie;

  // Se não tem plano ativo - mostrar modal de upgrade com checkout inline
  if (!hasActivePlan) {
    return (
      <NannyProUpsellModal
        isOpen={open}
        onClose={() => onOpenChange(false)}
        feature="validation"
      />
    );
  }

  // Se CPF não foi validado ainda
  if (!documentValidated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PiWarningCircle className="size-5 text-amber-600" />
              Identidade Básica Necessária
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Para validar o Reconhecimento Facial e Antecedentes, primeiro é necessário
              validar sua Identidade Básica. Clique no botão &quot;Validar&quot; na seção de
              verificação.
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiShieldCheck className="size-5 text-purple-600" />
            Validação de Documentos
          </DialogTitle>
          <DialogDescription>
            Envie fotos do seu documento (RG ou CNH) e uma selfie para validação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload area */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Documento Frente */}
            <div className="space-y-2">
              <Label>Documento (Frente) *</Label>
              <div className="relative">
                {previews.documentFront ? (
                  <div className="relative aspect-4/3 overflow-hidden rounded-lg border">
                    <Image
                      src={previews.documentFront}
                      alt="Documento frente"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleFileChange('documentFront', null)}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <PiX className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex aspect-4/3 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-purple-400 hover:bg-gray-100">
                    <PiFile className="size-8 text-gray-400" />
                    <span className="mt-2 text-center text-sm text-gray-500">
                      RG/CNH (frente)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange('documentFront', e.target.files?.[0] || null)
                      }
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Documento Verso */}
            <div className="space-y-2">
              <Label>Documento (Verso)</Label>
              <div className="relative">
                {previews.documentBack ? (
                  <div className="relative aspect-4/3 overflow-hidden rounded-lg border">
                    <Image
                      src={previews.documentBack}
                      alt="Documento verso"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleFileChange('documentBack', null)}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <PiX className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex aspect-4/3 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-purple-400 hover:bg-gray-100">
                    <PiFile className="size-8 text-gray-400" />
                    <span className="mt-2 text-center text-sm text-gray-500">
                      RG (verso)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange('documentBack', e.target.files?.[0] || null)
                      }
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Selfie */}
            <div className="space-y-2">
              <Label>Selfie *</Label>
              <div className="relative">
                {previews.selfie ? (
                  <div className="relative aspect-4/3 overflow-hidden rounded-lg border">
                    <Image
                      src={previews.selfie}
                      alt="Selfie"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleFileChange('selfie', null)}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <PiX className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex aspect-4/3 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-purple-400 hover:bg-gray-100">
                    <PiCamera className="size-8 text-gray-400" />
                    <span className="mt-2 text-center text-sm text-gray-500">
                      Sua selfie
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange('selfie', e.target.files?.[0] || null)
                      }
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            <p className="font-medium text-gray-700">Dicas para uma boa validação:</p>
            <ul className="mt-1 list-inside list-disc space-y-1">
              <li>Use boa iluminação</li>
              <li>Evite reflexos no documento</li>
              <li>A selfie deve mostrar seu rosto claramente</li>
              <li>Documento deve estar legível</li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Botão de upload */}
            {hasNewFiles && (
              <Button
                onClick={handleUploadDocuments}
                disabled={isUploading || !files.documentFront || !files.selfie}
                variant="outline"
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <PiSpinner className="mr-2 size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <PiUpload className="mr-2 size-4" />
                    Enviar Documentos
                  </>
                )}
              </Button>
            )}

            {/* Botão de validação */}
            {hasRequiredUploads && !hasNewFiles && (
              <Button
                onClick={handleValidatePremium}
                disabled={isValidating}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isValidating ? (
                  <>
                    <PiSpinner className="mr-2 size-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <PiShieldCheck className="mr-2 size-4" />
                    Iniciar Validação
                  </>
                )}
              </Button>
            )}
          </div>

          {!hasRequiredUploads && !hasNewFiles && (
            <p className="text-center text-sm text-gray-500">
              Envie o documento (frente) e a selfie para continuar
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
