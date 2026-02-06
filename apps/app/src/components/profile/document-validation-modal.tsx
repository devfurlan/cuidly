'use client';

import { useState, useCallback } from 'react';
import {
  PiIdentificationCard,
  PiSpinner,
  PiUploadSimple,
  PiCheckCircle,
  PiX,
  PiCamera,
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
import Image from 'next/image';

interface DocumentValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type DocumentType = 'RG' | 'CNH';
type Step = 'select' | 'upload' | 'validating' | 'success' | 'error';

export function DocumentValidationModal({
  open,
  onOpenChange,
  onSuccess,
}: DocumentValidationModalProps) {
  const { showError, showSuccess, showWarning } = useApiError();

  const [step, setStep] = useState<Step>('select');
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    documentType?: string;
    expirationDate?: string;
    extractedData?: {
      name?: string;
      cpf?: string;
      birthDate?: string;
    };
  } | null>(null);

  const resetState = useCallback(() => {
    setStep('select');
    setDocumentType(null);
    setFrontImage(null);
    setFrontPreview(null);
    setBackImage(null);
    setBackPreview(null);
    setIsUploading(false);
    setIsValidating(false);
    setValidationResult(null);
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const handleSelectDocumentType = (type: DocumentType) => {
    setDocumentType(type);
    setStep('upload');
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo (inclui PDF para CNH digital)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      showWarning('Formato inválido. Use JPG, PNG, WebP ou PDF.', true);
      return;
    }

    // Validar tamanho (max 10MB para PDFs)
    if (file.size > 10 * 1024 * 1024) {
      showWarning('Arquivo muito grande. Máximo 10MB.', true);
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Para PDFs, usar um placeholder de preview
      const previewUrl =
        file.type === 'application/pdf'
          ? '/images/pdf-placeholder.svg'
          : result;

      if (side === 'front') {
        setFrontImage(file);
        setFrontPreview(previewUrl);
      } else {
        setBackImage(file);
        setBackPreview(previewUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontImage(null);
      setFrontPreview(null);
    } else {
      setBackImage(null);
      setBackPreview(null);
    }
  };

  const handleUploadAndValidate = async () => {
    if (!frontImage) {
      showWarning('É necessário enviar a frente do documento.', true);
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload das imagens
      const formData = new FormData();
      formData.append('documentFront', frontImage);
      if (backImage) {
        formData.append('documentBack', backImage);
      }

      const uploadResponse = await fetch('/api/validation/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        throw new Error(uploadData.error || 'Erro ao enviar documentos');
      }

      setIsUploading(false);
      setIsValidating(true);
      setStep('validating');

      // 2. Validar documento
      const validateResponse = await fetch('/api/validation/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const validateData = await validateResponse.json();

      if (validateResponse.ok && validateData.success) {
        setValidationResult(validateData);
        setStep('success');
        showSuccess(validateData.message);
      } else {
        setStep('error');
        showWarning(
          validateData.error || 'Erro na validação. Verifique a imagem.',
          true
        );
      }
    } catch (error) {
      setStep('error');
      showError(error, 'Erro ao processar documento');
    } finally {
      setIsUploading(false);
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onSuccess();
    }
    handleOpenChange(false);
  };

  // Renderizar conteúdo baseado no step
  const renderContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Selecione o tipo de documento que você deseja enviar para
              validação:
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSelectDocumentType('RG')}
                className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 p-6 transition-colors hover:border-purple-500 hover:bg-purple-50"
              >
                <PiIdentificationCard className="size-12 text-purple-600" />
                <span className="font-medium">RG</span>
                <span className="text-xs text-gray-500">
                  Carteira de Identidade
                </span>
              </button>

              <button
                onClick={() => handleSelectDocumentType('CNH')}
                className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-200 p-6 transition-colors hover:border-purple-500 hover:bg-purple-50"
              >
                <PiIdentificationCard className="size-12 text-purple-600" />
                <span className="font-medium">CNH</span>
                <span className="text-xs text-gray-500">
                  Carteira de Motorista
                </span>
              </button>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('select')}
              >
                Voltar
              </Button>
              <span className="text-sm text-gray-500">
                Documento: <strong>{documentType}</strong>
              </span>
            </div>

            {/* Upload Frente */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Frente do documento *
              </label>
              {frontPreview ? (
                <div className="relative">
                  <Image
                    src={frontPreview}
                    alt="Frente do documento"
                    width={400}
                    height={250}
                    className="w-full rounded-lg border object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage('front')}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <PiX className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-purple-500 hover:bg-purple-50">
                  <PiCamera className="size-8 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Clique para enviar a frente
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => handleFileSelect(e, 'front')}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Upload Verso */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Verso do documento{' '}
                <span className="text-gray-400">(opcional)</span>
              </label>
              {backPreview ? (
                <div className="relative">
                  <Image
                    src={backPreview}
                    alt="Verso do documento"
                    width={400}
                    height={250}
                    className="w-full rounded-lg border object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage('back')}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <PiX className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-purple-500 hover:bg-purple-50">
                  <PiUploadSimple className="size-6 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Clique para enviar o verso
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => handleFileSelect(e, 'back')}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Dicas */}
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              <p className="font-medium">Dicas para envio:</p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-xs">
                <li>Aceitos: JPG, PNG, WebP ou PDF (CNH digital)</li>
                <li>Use boa iluminação e evite sombras</li>
                <li>Certifique-se que todos os dados estão legíveis</li>
                <li>Evite reflexos e brilhos na imagem</li>
              </ul>
            </div>

            {/* Consentimento */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">Importante:</p>
              <p className="mt-1">
                Ao clicar em &quot;Validar&quot;, você autoriza a análise do seu
                documento conforme nossa política de privacidade (LGPD).
              </p>
            </div>

            {/* Botão */}
            <Button
              onClick={handleUploadAndValidate}
              disabled={!frontImage || isUploading || isValidating}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isUploading ? (
                <>
                  <PiSpinner className="mr-2 size-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <PiIdentificationCard className="mr-2 size-4" />
                  Validar Documento
                </>
              )}
            </Button>
          </div>
        );

      case 'validating':
        return (
          <div className="flex flex-col items-center gap-4 py-12">
            <PiSpinner className="size-12 animate-spin text-purple-600" />
            <p className="text-gray-600">Validando seu documento...</p>
            <p className="text-sm text-gray-400">
              Isso pode levar alguns segundos
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-green-100 p-3">
                <PiCheckCircle className="size-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-700">
                Documento Validado!
              </h3>
            </div>

            {validationResult && (
              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <div className="space-y-2">
                  {validationResult.documentType && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-medium">
                        {validationResult.documentType}
                      </span>
                    </div>
                  )}
                  {validationResult.extractedData?.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nome:</span>
                      <span className="font-medium">
                        {validationResult.extractedData.name}
                      </span>
                    </div>
                  )}
                  {validationResult.expirationDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Válido até:</span>
                      <span className="font-medium">
                        {new Date(
                          validationResult.expirationDate
                        ).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="text-center text-sm text-gray-600">
              Seu selo de verificação foi atualizado no seu perfil.
            </p>

            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-red-100 p-3">
                <PiX className="size-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-700">
                Erro na Validação
              </h3>
            </div>

            <p className="text-center text-sm text-gray-600">
              Não foi possível validar seu documento. Verifique se a imagem está
              nítida e tente novamente.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={() => setStep('upload')} className="flex-1">
                Tentar Novamente
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiIdentificationCard className="size-5 text-purple-600" />
            Validação de Documento
          </DialogTitle>
          {step === 'select' && (
            <DialogDescription>
              Valide seu documento de identidade para obter o selo de
              verificação
            </DialogDescription>
          )}
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
